'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import RoomGrid from '@/components/RoomGrid';
import ReservationSyncPanel from '@/components/ReservationSyncPanel';
import InquiryFeed from '@/components/InquiryFeed';
import CleaningOverview from '@/components/CleaningOverview';
import DifyChatWidget from '@/components/DifyChatWidget';
import ExtensionCallSimulator from '@/components/ExtensionCallSimulator';
import UserManagementModal from '@/components/UserManagementModal';
import DifyDiagnosticsModal from '@/components/DifyDiagnosticsModal';
import AuthModal from '@/components/AuthModal';
import { useMotel } from '@/context/MotelContext';
import {
  BedDouble,
  Users,
  Sparkles,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  const { rooms, reservations, inquiries, amenities } = useMotel();
  const [showCallSimulator, setShowCallSimulator] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showDifyDiagnostics, setShowDifyDiagnostics] = useState(false);

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const availableRooms = rooms.filter((r) => r.status === 'available' || r.status === 'inspected').length;
  const cleaningRooms = rooms.filter((r) => r.status === 'cleaning').length;
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

  const todayReservations = reservations.filter((r) => r.status === '대기').length;
  const pendingRequests = inquiries.filter((i) => i.status === 'new').length + amenities.filter((a) => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 상단 네비게이션 헤더 */}
      <Header
        onOpenCallSimulator={() => setShowCallSimulator(true)}
        onOpenUserManagement={() => setShowUserManagement(true)}
        onOpenDifyDiagnostics={() => setShowDifyDiagnostics(true)}
      />

      {/* 메인 대시보드 컨테이너 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 상단 핵심 지표 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 1. 객실 점유율 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">현재 투숙률 (재실)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{occupancyRate}%</span>
                <span className="text-xs text-blue-400 font-medium">({occupiedRooms}/{totalRooms}실)</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>

          {/* 2. 입실 가능 빈방 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">즉시 입실 가능 (빈방)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-400">{availableRooms}실</span>
                <span className="text-xs text-slate-400">배정 준비완료</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* 3. 예약 체크인 대기 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">오늘 예약 입실대기</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-cyan-400">{todayReservations}건</span>
                <span className="text-xs text-slate-400">OTA 싱크 연동</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* 4. 미처리 문의 및 요청 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">실시간 미처리 문의</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black ${pendingRequests > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {pendingRequests}건
                </span>
                <span className="text-xs text-slate-400">QR 및 비품</span>
              </div>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                pendingRequests > 0
                  ? 'bg-rose-600/20 text-rose-400 border-rose-500/30 motion-safe:animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 메인 2단 그리드 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 좌측 영역 (8단: 객실 매트릭스 그리드 & 하우스키핑 점검) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* 객실 매트릭스 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-indigo-400" />
                    전 객실 실시간 종합 현황판
                  </h2>
                  <p className="text-xs text-slate-400">
                    객실을 클릭하여 상태 변경, 투숙객 정보 조회, 특이사항 메모를 관리하세요.
                  </p>
                </div>
              </div>
              <RoomGrid />
            </div>

            {/* 청소 & AI 점검 현황 */}
            <CleaningOverview />
          </div>

          {/* 우측 영역 (4단/5단: 실시간 문의/비품 & 예약 싱크) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 flex flex-col">
            {/* 방별 실시간 문의 & 비품 요청 */}
            <div className="flex-1 min-h-[380px]">
              <InquiryFeed />
            </div>

            {/* 예약 플랫폼 실시간 싱크 */}
            <div className="flex-1 min-h-[380px]">
              <ReservationSyncPanel />
            </div>
          </div>
        </div>
      </main>

      {/* Dify 기반 플로팅 AI 어시스턴트 챗봇 */}
      <DifyChatWidget />

      {/* 내선 전화 자동응대 시뮬레이터 모달 */}
      {showCallSimulator && (
        <ExtensionCallSimulator onClose={() => setShowCallSimulator(false)} />
      )}

      {/* 사용자 및 권한 관리 모달 */}
      {showUserManagement && (
        <UserManagementModal onClose={() => setShowUserManagement(false)} />
      )}

      {/* Dify v1 연결 상태 및 실시간 스트리밍 진단 모달 */}
      {showDifyDiagnostics && (
        <DifyDiagnosticsModal onClose={() => setShowDifyDiagnostics(false)} />
      )}

      {/* 사용자 로그인 및 계정 생성(회원가입) 모달 */}
      <AuthModal />
    </div>
  );
}
