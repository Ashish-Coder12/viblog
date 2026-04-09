import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', textAlign: 'center', padding: '24px'
    }}>
      <h1 style={{ fontSize: '72px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>404</h1>
      <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '28px' }}>
        This page doesn't exist.
      </p>
      <Link href="/dashboard" style={{
        background: 'var(--accent)', color: '#fff', textDecoration: 'none',
        padding: '12px 24px', borderRadius: '10px', fontWeight: 600, fontSize: '14px'
      }}>
        Back to Dashboard
      </Link>
    </div>
  );
}
