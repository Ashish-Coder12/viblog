'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteBlogButton({ blogId }: { blogId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/${blogId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        background: confirming ? 'rgba(255,77,77,0.15)' : 'transparent',
        color: confirming ? '#ff6b6b' : 'var(--text-muted)',
        border: `1px solid ${confirming ? 'rgba(255,77,77,0.3)' : 'var(--border)'}`,
        borderRadius: '8px', padding: '6px 14px', fontSize: '13px',
        cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
      }}
    >
      {loading ? 'Deleting...' : confirming ? 'Click again to confirm' : 'Delete post'}
    </button>
  );
}
