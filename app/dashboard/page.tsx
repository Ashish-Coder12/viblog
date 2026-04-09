'use client';

import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Blog } from '@/types';

export default function DashboardPage() {
  const { user } = useUser();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/blogs/generate');
      const data = await res.json();
      if (data.blogs) setBlogs(data.blogs);
    } catch {
      console.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/blogs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtube_url: youtubeUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      setSuccess(true);
      setYoutubeUrl('');
      setBlogs((prev) => [data.blog, ...prev]);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(13,13,15,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.02em' }}>
          <span style={{ color: 'var(--accent)' }}>YT</span>Blog
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {user?.firstName || user?.emailAddresses[0]?.emailAddress}
          </span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Your Blog Posts
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Paste a YouTube link below to generate a new post.
          </p>
        </div>

        {/* Create form */}
        <form onSubmit={handleGenerate} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '24px', marginBottom: '40px'
        }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>
            YouTube Video URL
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={generating}
              required
              style={{
                flex: 1, background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '11px 16px', fontSize: '14px',
                color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
            <button
              type="submit"
              disabled={generating || !youtubeUrl.trim()}
              style={{
                background: generating ? 'var(--accent-dim)' : 'var(--accent)',
                color: generating ? 'var(--accent)' : '#fff',
                border: 'none', borderRadius: '10px', padding: '11px 24px',
                fontWeight: 600, fontSize: '14px', cursor: generating ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.2s', minWidth: '120px'
              }}
            >
              {generating ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SpinnerIcon />
                  Generating...
                </span>
              ) : '✦ Generate'}
            </button>
          </div>

          {error && (
            <div style={{
              marginTop: '12px', padding: '10px 14px', background: 'rgba(255,77,77,0.1)',
              border: '1px solid rgba(255,77,77,0.25)', borderRadius: '8px',
              fontSize: '13px', color: '#ff6b6b'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              marginTop: '12px', padding: '10px 14px', background: 'rgba(62,207,142,0.1)',
              border: '1px solid rgba(62,207,142,0.25)', borderRadius: '8px',
              fontSize: '13px', color: 'var(--success)'
            }}>
              ✓ Blog post generated successfully!
            </div>
          )}

          {generating && (
            <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
              Fetching transcript → running through AI → saving... this takes ~15 seconds.
            </div>
          )}
        </form>

        {/* Blog list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <SpinnerIcon size={24} />
            <p style={{ marginTop: '12px' }}>Loading your blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            border: '1px dashed var(--border)', borderRadius: '16px',
            color: 'var(--text-muted)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>No blogs yet</p>
            <p style={{ fontSize: '14px' }}>Paste a YouTube link above to generate your first post.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-subtle)', marginBottom: '4px' }}>
              {blogs.length} post{blogs.length !== 1 ? 's' : ''}
            </p>
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} formatDate={formatDate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BlogCard({ blog, formatDate }: { blog: Blog; formatDate: (d: string) => string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/blog/${blog.id}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
          border: `1px solid ${hovered ? 'var(--border-hover)' : 'var(--border)'}`,
          borderRadius: '14px', padding: '20px', transition: 'all 0.2s',
          display: 'flex', gap: '20px', cursor: 'pointer'
        }}
      >
        {/* Thumbnail */}
        {blog.thumbnail && (
          <img
            src={blog.thumbnail}
            alt=""
            style={{
              width: '120px', height: '68px', borderRadius: '8px',
              objectFit: 'cover', flexShrink: 0, background: 'var(--border)'
            }}
          // onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            fontSize: '15px', fontWeight: 600, color: 'var(--text)',
            marginBottom: '6px', lineHeight: 1.4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {blog.title}
          </h2>
          <p style={{
            fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5,
            marginBottom: '12px', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {blog.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
              {formatDate(blog.created_at)}
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {blog.hashtags.slice(0, 4).map((tag) => (
                <span key={tag} style={{
                  fontSize: '11px', padding: '2px 8px',
                  background: 'var(--accent-dim)', color: 'var(--accent)',
                  borderRadius: '100px', fontWeight: 500
                }}>
                  #{tag}
                </span>
              ))}
              {blog.hashtags.length > 4 && (
                <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                  +{blog.hashtags.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SpinnerIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
