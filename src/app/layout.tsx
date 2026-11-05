import type { Metadata } from 'next';
import './globals.css';
import { MotelProvider } from '@/context/MotelContext';
import ToastContainer from '@/components/ToastContainer';

export const metadata: Metadata = {
  title: 'StaySync AI - 모텔 프론트 데스크 & 투숙객 AI 케어 포털',
  description: 'Dify 기반 모텔 운영, RAG 고객응대, 객실 예약 싱크 및 AI 청소 점검 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full bg-slate-950 text-slate-100 antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-950 text-white selection:bg-blue-600 selection:text-white">
        <MotelProvider>
          {children}
          <ToastContainer />
        </MotelProvider>
      </body>
    </html>
  );
}
