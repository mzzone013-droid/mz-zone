'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductDeleteButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    setLoading(true);
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      disabled={loading}
      onClick={handleDelete}
      style={{
        padding: '6px 12px', borderRadius: '6px',
        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
        color: '#EF4444', fontSize: '11px', fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? '...' : 'حذف'}
    </button>
  );
}
