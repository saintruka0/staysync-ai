'use client';

import React, { useState } from 'react';
import { useMotel } from '@/context/MotelContext';
import { Room, RoomStatus } from '@/types/motel';
import RoomDetailModal from './RoomDetailModal';
import { User, Sparkles, AlertTriangle, CheckCircle2, BedDouble, ShieldAlert, Gamepad2, Bath } from 'lucide-react';

export default function RoomGrid() {
  const { rooms } = useMotel();
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus | 'all'>('all');
  const [activeModalRoom, setActiveModalRoom] = useState<Room | null>(null);

  // 층 리스트 (5층부터 2층까지 내림차순 - 실제 건물 층 구조)
  const floorList = [5, 4, 3, 2] as const;

  const statusConfig: Record<RoomStatus, { label: string; badge: string; cardBg: string }> = {
    available: {
      label: '입실가능',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      cardBg: 'bg-slate-900/90 hover:bg-slate-800/80',
    },
    occupied: {
      label: '재실중',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      cardBg: 'bg-slate-900/90 hover:bg-slate-800/80',
    },
    cleaning: {
      label: '청소중',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      cardBg: 'bg-slate-900/90 hover:bg-slate-800/80',
    },
    inspected: {
      label: '점검완료',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      cardBg: 'bg-slate-900/90 hover:bg-slate-800/80',
    },
    reserved: {
      label: '예약대기',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      cardBg: 'bg-slate-900/90 hover:bg-slate-800/80',
    },
    maintenance: {
      label: '수리/점검',
      badge: 'bg-slate-700 text-slate-300 border-slate-600',
      cardBg: 'bg-slate-900/70 opacity-70',
    },
  };

  const getFloorInfo = (floor: number) => {
    switch (floor) {
      case 5:
        return '프리미엄 스위트 (최고층 VIP)';
      case 4:
        return '게이밍 PC & 스파 욕조룸';
      case 3:
        return '디럭스 트윈';
      case 2:
        return '스탠다드 더블';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-5">
      {/* 필터 툴바 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
        {/* 층수 필터 탭 */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-semibold mr-1">층별:</span>
          {(['all', 5, 4, 3, 2] as const).map((floor) => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                selectedFloor === floor
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {floor === 'all' ? '전체 층 (건물 전경)' : `${floor}층`}
            </button>
          ))}
        </div>

        {/* 상태 필터 탭 */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-semibold mr-1">상태:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="all">전체 상태 보기</option>
            <option value="available">입실가능 (빈방)</option>
            <option value="occupied">재실중</option>
            <option value="cleaning">청소중</option>
            <option value="inspected">점검완료 (합격)</option>
            <option value="reserved">예약대기</option>
            <option value="maintenance">수리/점검</option>
          </select>
        </div>
      </div>

      {/* 층별 물리적 랙 구조 (Floor-by-Floor Architecture) */}
      <div className="space-y-6">
        {floorList
          .filter((f) => selectedFloor === 'all' || selectedFloor === f)
          .map((floor) => {
            const floorRooms = rooms.filter(
              (r) => r.floor === floor && (selectedStatus === 'all' || r.status === selectedStatus)
            );

            if (floorRooms.length === 0) return null;

            const totalFloorRooms = rooms.filter((r) => r.floor === floor).length;
            const availableFloorRooms = rooms.filter(
              (r) => r.floor === floor && (r.status === 'available' || r.status === 'inspected')
            ).length;

            return (
              <div key={floor} className="space-y-2.5">
                {/* 층 헤더 & 요약 배너 */}
                <div className="flex items-center justify-between px-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700">
                      {floor}F
                    </span>
                    <span className="font-bold text-slate-300">{getFloorInfo(floor)}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    공실 <span className="font-bold text-emerald-400">{availableFloorRooms}실</span> / 총 {totalFloorRooms}실
                  </div>
                </div>

                {/* 해당 층의 객실 그리드 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
                  {floorRooms.map((room) => {
                    const cfg = statusConfig[room.status];
                    const hasNotes = room.notes.length > 0;
                    const noiseNote = room.notes.find((n) => n.includes('소음') || n.includes('주의'));
                    const isGaming = room.type.includes('게이밍');
                    const isSpa = room.type.includes('스파');

                    return (
                      <div
                        key={room.id}
                        onClick={() => setActiveModalRoom(room)}
                        className={`group relative p-3.5 rounded-2xl border border-slate-800 hover:border-slate-700 ${cfg.cardBg} cursor-pointer transition-colors duration-150 motion-reduce:transition-none hover:shadow-lg flex flex-col justify-between`}
                      >
                        {/* 상단: 호실 번호 & 상태 뱃지 */}
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-xl font-black text-white tracking-tight">{room.number}</span>
                              <span className="text-xs text-slate-400 font-mono">호</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-xs text-slate-300 font-medium truncate max-w-[110px]">
                                {room.type}
                              </span>
                              {isGaming && (
                                <span title="게이밍 PC 구비">
                                  <Gamepad2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                </span>
                              )}
                              {isSpa && (
                                <span title="스파 욕조 구비">
                                  <Bath className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${cfg.badge}`}
                          >
                            {cfg.label}
                          </span>
                        </div>

                        {/* 중단: 투숙객 / 청소 상태 안내 */}
                        <div className="my-2 min-h-[36px] flex flex-col justify-center text-xs">
                          {room.status === 'occupied' && (
                            <div className="text-slate-200 flex items-center gap-1.5 truncate">
                              <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="font-bold truncate">{room.guestName || '투숙객'}</span>
                              {room.platform && (
                                <span className="text-[11px] px-1.5 py-0.2 rounded font-bold bg-blue-950 text-blue-300 border border-blue-800 shrink-0">
                                  {room.platform}
                                </span>
                              )}
                            </div>
                          )}

                          {room.status === 'reserved' && (
                            <div className="text-cyan-300 flex items-center gap-1.5 truncate">
                              <BedDouble className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-semibold truncate">{room.guestName || '예약 고객'}</span>
                              <span className="text-xs text-cyan-400 font-mono">{room.checkIn}</span>
                            </div>
                          )}

                          {room.status === 'cleaning' && (
                            <div className="text-amber-300 flex items-center gap-1.5 truncate">
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-medium">{room.cleanerName ? `${room.cleanerName} 청소중` : '청소중'}</span>
                            </div>
                          )}

                          {room.status === 'inspected' && (
                            <div className="text-purple-300 flex items-center gap-1.5 truncate">
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span className="font-bold truncate">AI 검사 {room.inspection?.score || 95}점</span>
                            </div>
                          )}

                          {room.status === 'available' && (
                            <div className="text-emerald-400 font-medium flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span>즉시 입실 가능</span>
                            </div>
                          )}

                          {room.status === 'maintenance' && (
                            <div className="text-slate-400 font-medium">시설 점검 중</div>
                          )}
                        </div>

                        {/* 하단: 특이사항/소음 주의 뱃지 표면화 */}
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                          {noiseNote ? (
                            <span className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 font-semibold truncate max-w-[150px]">
                              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>소음주의</span>
                            </span>
                          ) : hasNotes ? (
                            <span className="flex items-center gap-1 text-[11px] text-slate-300">
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                              <span>메모 {room.notes.length}건</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">특이사항 없음</span>
                          )}

                          <span className="text-[11px] text-slate-400 group-hover:text-blue-400 font-medium transition">
                            조회 &rarr;
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* 객실 상세 모달 */}
      {activeModalRoom && (
        <RoomDetailModal
          room={rooms.find((r) => r.id === activeModalRoom.id) || activeModalRoom}
          onClose={() => setActiveModalRoom(null)}
        />
      )}
    </div>
  );
}
