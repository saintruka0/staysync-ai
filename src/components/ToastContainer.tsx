'use client';

import React from 'react';
import { useMotel } from '@/context/MotelContext';
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, dismissToast, lastCheckedOutRoom, undoCheckout } = useMotel();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-blue-500 bg-slate-900/95 text-white';
        let Icon = Bell;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500 bg-slate-900/95 text-white';
          Icon = CheckCircle2;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500 bg-slate-900/95 text-white';
          Icon = AlertTriangle;
        } else if (toast.type === 'urgent') {
          borderClass = 'border-rose-500 bg-slate-900/95 text-white animate-pulse';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 ${borderClass}`}
          >
            <div className="p-1 rounded-lg shrink-0 mt-0.5">
              <Icon className="w-5 h-5 text-current" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200">{toast.title}</span>
                <span className="text-[10px] text-slate-400">{toast.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words">{toast.message}</p>
              {lastCheckedOutRoom && toast.message.includes('available') && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      undoCheckout();
                      dismissToast(toast.id);
                    }}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-md"
                  >
                    ↩ 실행 취소 (복구)
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
