'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function OrderModal({ 
  isOpen, 
  onClose, 
  product, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  product: any; 
  onConfirm: (qty: number, note: string) => void 
}) {
  const t = useTranslations('order');
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !product) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm(qty, note);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[500] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-[var(--surface)] border border-[var(--border2)] rounded-[20px] w-[450px] max-w-[92vw] p-[34px] shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
        <div className="text-[18px] font-bold mb-[22px] flex items-center justify-between">
          {t('confirm')}
          <button onClick={onClose} className="bg-[var(--surface2)] border border-[var(--border)] text-[var(--text2)] w-[30px] h-[30px] rounded-lg cursor-pointer text-[14px] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]">✕</button>
        </div>
        
        <div className="bg-[var(--surface2)] rounded-xl p-4 mb-5 flex items-center gap-3.5 border border-[var(--border)]">
          <div className="text-[32px]">{product.emoji}</div>
          <div>
            <div className="text-[14px] font-bold">{product.name}</div>
            <div className="text-[11px] text-[var(--text3)]">Ref: {product.ref}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <span className="text-[13px]">{t('quantity')}</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] cursor-pointer text-[18px] transition-all hover:border-[var(--accent)]">−</button>
            <span className="text-[17px] font-bold min-w-[28px] text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-8 h-8 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] cursor-pointer text-[18px] transition-all hover:border-[var(--accent)]">+</button>
          </div>
        </div>

        <div className="field-group mb-5">
          <div className="field-label">{t('note')}</div>
          <textarea 
            className="field-input resize-none" 
            rows={2} 
            placeholder={t('notePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          ></textarea>
        </div>

        <div className="flex justify-between items-center py-4 border-t border-[var(--border)] mb-5">
          <span className="text-[14px]">{t('total')}</span>
          <span className="text-[24px] font-bold text-[var(--accent)]">{(product.price * qty).toLocaleString()} دج</span>
        </div>

        <button 
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? '...' : `✔ ${t('submit')}`}
        </button>
      </div>
    </div>
  );
}
