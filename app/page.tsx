import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}>
      {/* Glow effect */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(108,99,255,0.15) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '640px' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'var(--accent-dim)', border: '1px solid rgba(108,99,255,0.3)',
          borderRadius: '100px', padding: '4px 14px', marginBottom: '32px',
          fontSize: '13px', color: 'var(--accent)'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          Powered by Claude AI
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700,
          letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px',
          color: 'var(--text)'
        }}>
          YouTube videos<br />
          <span style={{ color: 'var(--accent)' }}>into blog posts</span>
        </h1>

        <p style={{
          fontSize: '18px', color: 'var(--text-muted)', lineHeight: 1.7,
          marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px'
        }}>
          Paste any YouTube link. We fetch the transcript, run it through AI,
          and generate a complete blog post with title, description, and hashtags — in seconds.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/sign-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'var(--accent)', color: '#fff', textDecoration: 'none',
            padding: '14px 28px', borderRadius: '10px', fontWeight: 600,
            fontSize: '15px', transition: 'background 0.2s',
          }}
          // onMouseOver={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
          // onMouseOut={(e) => (e.currentTarget.style.background = 'var(--accent)')}
          >
            Get started free
          </Link>
          <Link href="/sign-in" style={{
            display: 'inline-flex', alignItems: 'center',
            background: 'var(--bg-card)', color: 'var(--text)', textDecoration: 'none',
            padding: '14px 28px', borderRadius: '10px', fontWeight: 500,
            fontSize: '15px', border: '1px solid var(--border)', transition: 'border-color 0.2s',
          }}>
            Sign in
          </Link>
        </div>

        {/* Feature grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
          marginTop: '64px', textAlign: 'left'
        }}>
          {[
            { icon: '🎬', label: 'Any YouTube URL', desc: 'Shorts, standard videos, any length' },
            { icon: '🤖', label: 'AI-generated content', desc: 'Title, description & 10 hashtags' },
            { icon: '📚', label: 'Blog dashboard', desc: 'All your posts in one place' },
          ].map((f) => (
            <div key={f.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '20px'
            }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>{f.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{f.label}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
