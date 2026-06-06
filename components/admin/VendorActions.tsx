'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function VendorActions({
  vendorId,
  userId,
  currentStatus,
}: {
  vendorId: string;
  userId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      // 1. Update vendor status
      await fetch('/api/admin/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, status }),
      });

      // 2. If approved → update profiles.role to 'vendor'
      if (status === 'approved' && userId) {
        await fetch('/api/admin/set-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, role: 'vendor' }),
        });
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
    setLoading(true);
    try {
      await fetch('/api/admin/vendors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
      {currentStatus !== 'approved' && (
        <button
          disabled={loading}
          onClick={() => handleAction('approved')}
          style={{
            padding: '6px 10px', borderRadius: '6px', background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', fontSize: '11px', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, whiteSpace: 'nowrap'
          }}
        >
          ✅ موافقة
        </button>
      )}
      {currentStatus !== 'rejected' && (
        <button
          disabled={loading}
          onClick={() => handleAction('rejected')}
          style={{
            padding: '6px 10px', borderRadius: '6px',
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
            color: '#F43F5E', fontSize: '11px', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, whiteSpace: 'nowrap'
          }}
        >
          ❌ رفض
        </button>
      )}
      <button
        disabled={loading}
        onClick={handleDelete}
        style={{
          padding: '6px 10px', borderRadius: '6px',
          background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)',
          color: '#64748B', fontSize: '11px', fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, whiteSpace: 'nowrap'
        }}
      >
        🗑️ حذف
      </button>
    </div>
  );
}
