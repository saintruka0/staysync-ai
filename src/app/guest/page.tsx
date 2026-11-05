import { Suspense } from 'react';
import GuestClient from './GuestClient';

export default function GuestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">객실 정보를 불러오는 중...</div>}>
      <GuestClient />
    </Suspense>
  );
}
