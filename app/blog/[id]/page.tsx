import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Blog } from '@/types';
import { DeleteBlogButton } from '@/components/DeleteBlogButton';

export default async function BlogPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createServerSupabaseClient();
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', userId) // enforce ownership
    .single();

  if (error || !blog) notFound();

  const b = blog as Blog;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
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
        display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <Link href="/dashboard" style={{
          color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          ← Back
        </Link>
        <div style={{ flex: 1 }} />
        <DeleteBlogButton blogId={b.id} />
      </nav>

      <div style={{ maxWidth: '740px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Thumbnail */}
        {/* {b.thumbnail && (
          <img
            src={b.thumbnail}
            alt={b.title}
            style={{
              width: '100%', borderRadius: '16px', marginBottom: '32px',
              objectFit: 'cover', aspectRatio: '16/9', background: 'var(--bg-card)'
            }}
          // onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )} */}
        <div style={{
          position: 'relative', width: '100%', paddingTop: '56.25%',
          borderRadius: '16px', overflow: 'hidden',
          marginBottom: '32px', background: '#000'
        }}>
          <iframe
            src={`https://www.youtube.com/embed/${b.video_id}?rel=0&modestbranding=1`}
            title={b.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%', border: 'none'
            }}
          />
        </div>

        {/* Meta */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: '16px', flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>
            {formatDate(b.created_at)}
          </span>
          <span style={{ color: 'var(--border)', fontSize: '13px' }}>·</span>
          <a
            href={b.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '13px', color: 'var(--accent)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            View on YouTube ↗
          </a>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700,
          letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '24px'
        }}>
          {b.title}
        </h1>

        {/* Description */}
        <div style={{
          fontSize: '16px', color: '#c8c7cc', lineHeight: 1.8,
          marginBottom: '40px', whiteSpace: 'pre-wrap'
        }}>
          {b.description}
        </div>

        {/* Hashtags */}
        <div style={{
          padding: '20px', background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: '12px',
          marginBottom: '40px'
        }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Hashtags
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {b.hashtags.map((tag) => (
              <span key={tag} style={{
                padding: '5px 12px', background: 'var(--accent-dim)',
                color: 'var(--accent)', borderRadius: '100px', fontSize: '13px', fontWeight: 500
              }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Transcript (collapsed) */}
        {b.transcript && (
          <details style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '20px'
          }}>
            <summary style={{
              cursor: 'pointer', fontWeight: 600, fontSize: '14px',
              color: 'var(--text-muted)', userSelect: 'none'
            }}>
              View original transcript
            </summary>
            <p style={{
              marginTop: '16px', fontSize: '13px', color: 'var(--text-subtle)',
              lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {b.transcript}
            </p>
          </details>
        )}
      </div>
    </div>
  );
}
