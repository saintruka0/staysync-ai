'use client';

import React, { useState, useEffect } from 'react';
import { useMotel } from '@/context/MotelContext';
import {
  RefreshCw,
  Calendar,
  Phone,
  CheckCircle2,
  BedDouble,
  Search,
  Zap,
  Filter,
} from 'lucide-react';

export default function ReservationSyncPanel() {
  const { reservations, rooms, syncReservations, checkInReservation } = useMotel();
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedRooms, setSelectedRooms] = useState<Record<string, string>>({});

  // 자동 동기화 타이머 (Auto-Sync: 30초 주기)
  useEffect(() => {
    if (!autoSync) return;
    const interval = setInterval(() => {
      syncReservations();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoSync, syncReservations]);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncReservations();
    setIsSyncing(false);
  };

  const availableRooms = rooms.filter((r) => r.status === 'available' || r.status === 'inspected');

  // 검색 및 플랫폼 필터링
  const filteredReservations = reservations.filter((res) => {
    if (selectedPlatform !== 'all' && res.platform !== selectedPlatform) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = res.guestName.toLowerCase().includes(q);
      const matchNo = res.reservationNo.toLowerCase().includes(q);
      const matchPhone = res.phone.includes(q);
      if (!matchName && !matchNo && !matchPhone) return false;
    }
    return true;
  });

  const platformColors: Record<string, string> = {
    야놀자: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
    여기어때: 'bg-red-950/80 text-red-300 border-red-700/60',
    아고다: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
    네이버: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    현장: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  // 최적 빈방 스마트 추천 (동일 룸타입 및 점검완료 우선)
  const getRecommendedRoom = (roomType: string) => {
    const match = availableRooms.find((r) => r.type === roomType && r.status === 'inspected');
    if (match) return match.number;
    const anyTypeMatch = availableRooms.find((r) => r.type === roomType);
    if (anyTypeMatch) return anyTypeMatch.number;
    return availableRooms[0]?.number || '';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            예약 플랫폼 실시간 싱크
          </h2>
          <p className="text-xs text-slate-400">야놀자, 여기어때, 아고다, 네이버 실시간 연동</p>
        </div>

        <div className="flex items-center gap-2">
          {/* 자동 싱크 토글 */}
          <button
            onClick={() => setAutoSync(!autoSync)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              autoSync
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="30초마다 자동으로 새로운 예약 싱크"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoSync ? 'bg-emerald-400 motion-safe:animate-ping' : 'bg-slate-500'}`}></span>
            <span>{autoSync ? '자동연동 ON' : '자동연동'}</span>
          </button>

          {/* 수동 싱크 버튼 */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shadow-md shadow-blue-900/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'motion-safe:animate-spin' : ''}`} />
            <span>{isSyncing ? '동기화중' : '지금 싱크'}</span>
          </button>
        </div>
      </div>

      {/* 검색 & 플랫폼 필터 바 */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="예약자명, 예약번호(YN-..), 연락처 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* 플랫폼 필터 칩 */}
        <div className="flex gap-1 overflow-x-auto text-[11px] pb-1">
          {['all', '야놀자', '여기어때', '아고다', '네이버', '현장'].map((plat) => (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              className={`px-2 py-0.5 rounded-lg font-semibold transition shrink-0 ${
                selectedPlatform === plat
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {plat === 'all' ? '전체 채널' : plat}
            </button>
          ))}
        </div>
      </div>

      {/* 예약 목록 리스트 */}
      <div className="space-y-3 overflow-y-auto flex-1 max-h-[380px] pr-1">
        {filteredReservations.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            조건에 일치하는 예약 내역이 없습니다.
          </div>
        ) : (
          filteredReservations.map((res) => {
            const isPending = res.status === '대기';
            const recommendedRoom = getRecommendedRoom(res.roomType);
            const assignedRoom =
              selectedRooms[res.id] || res.roomNumber || recommendedRoom || availableRooms[0]?.number || '';

            return (
              <div
                key={res.id}
                className={`p-3.5 rounded-2xl border transition ${
                  isPending
                    ? 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
                    : 'bg-slate-900/50 border-slate-800/60 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                        platformColors[res.platform] || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {res.platform}
                    </span>
                    <span className="text-xs font-bold text-white">{res.guestName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({res.reservationNo})</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    {res.price.toLocaleString()}원
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-2.5">
                  <div className="flex items-center gap-1">
                    <BedDouble className="w-3.5 h-3.5 text-slate-500" />
                    <span>{res.roomType}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{res.phone}</span>
                  </div>
                  <div>입실 예정: <span className="text-white font-medium">{res.checkInTime}</span></div>
                  <div>싱크 시각: <span className="text-slate-400">{res.syncedAt}</span></div>
                </div>

                {/* 체크인 또는 배정 컨트롤 */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/50">
                  {isPending ? (
                    <div className="flex items-center gap-2 w-full">
                      <select
                        value={assignedRoom}
                        onChange={(e) =>
                          setSelectedRooms({ ...selectedRooms, [res.id]: e.target.value })
                        }
                        className="bg-slate-950 text-slate-200 text-xs border border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1 font-medium"
                      >
                        <option value="">객실 선택 ({availableRooms.length}실 가능)</option>
                        {availableRooms.map((r) => (
                          <option key={r.id} value={r.number}>
                            {r.number}호 ({r.type} - {r.status === 'inspected' ? '점검완료' : '빈방'})
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => {
                          if (!assignedRoom) return;
                          checkInReservation(res.id, assignedRoom);
                        }}
                        disabled={!assignedRoom}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 shrink-0 shadow-md shadow-blue-900/30 flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>체크인 배정</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full text-xs">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {res.roomNumber}호 입실 완료
                      </span>
                      <span className="text-[11px] text-slate-400">정상 투숙 중</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
