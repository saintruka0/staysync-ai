'use client';

import React, { useState, useEffect } from 'react';
import { Room, RoomStatus, RoomActivityLog, RoomLogType } from '@/types/motel';
import { useMotel } from '@/context/MotelContext';
import {
  X,
  User,
  Phone,
  Clock,
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  QrCode,
  ShieldAlert,
  ExternalLink,
  Copy,
  Check,
  History,
  CalendarCheck,
  ArrowRightLeft,
  MessageSquare,
  Package,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

interface RoomDetailModalProps {
  room: Room;
  onClose: () => void;
}

export default function RoomDetailModal({ room, onClose }: RoomDetailModalProps) {
  const { roomLogs, updateRoomStatus, addRoomNote, removeRoomNote } = useMotel();
  const [newNote, setNewNote] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [confirmCheckout, setConfirmCheckout] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'reservation' | 'cleaning' | 'status' | 'other'>('all');
  const [isLogExpanded, setIsLogExpanded] = useState(true);
  const [showAllLogs, setShowAllLogs] = useState(false);

  // ESC 키 닫기 이벤트 리스너
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmCheckout) {
          setConfirmCheckout(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmCheckout, onClose]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addRoomNote(room.number, newNote);
    setNewNote('');
  };

  const handleCopyPhone = () => {
    if (!room.phone) return;
    navigator.clipboard?.writeText(room.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSelectStatus = (newStatus: RoomStatus) => {
    // [P0 방어]: 재실 또는 예약 상태인 객실을 '빈방'으로 전환하려 할 때 2차 확인 모달 띄움
    if (newStatus === 'available' && (room.status === 'occupied' || room.status === 'reserved')) {
      setConfirmCheckout(true);
      return;
    }
    updateRoomStatus(room.number, newStatus);
  };

  const handleConfirmCheckout = () => {
    updateRoomStatus(room.number, 'available');
    setConfirmCheckout(false);
  };

  const statusColors: Record<RoomStatus, string> = {
    available: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    occupied: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    cleaning: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    inspected: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    reserved: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    maintenance: 'bg-slate-700 text-slate-300 border-slate-600',
  };

  const statusLabels: Record<RoomStatus, string> = {
    available: '입실가능 (빈방)',
    occupied: '재실중 (투숙중)',
    cleaning: '청소중',
    inspected: '청소점검완료 (합격)',
    reserved: '예약입실대기',
    maintenance: '시설점검/수리중',
  };

  // 해당 호실의 모든 활동 로그 (역순)
  const roomAllLogs = roomLogs.filter((l) => l.roomNumber === room.number);

  const countReservation = roomAllLogs.filter((l) => l.type === 'reservation').length;
  const countCleaning = roomAllLogs.filter((l) => l.type === 'cleaning').length;
  const countStatus = roomAllLogs.filter((l) => l.type === 'status').length;
  const countOther = roomAllLogs.filter((l) => ['inquiry', 'amenity', 'call', 'note'].includes(l.type)).length;

  const filteredLogs = roomAllLogs.filter((log) => {
    if (logFilter === 'all') return true;
    if (logFilter === 'reservation') return log.type === 'reservation';
    if (logFilter === 'cleaning') return log.type === 'cleaning';
    if (logFilter === 'status') return log.type === 'status';
    if (logFilter === 'other') return ['inquiry', 'amenity', 'call', 'note'].includes(log.type);
    return true;
  });

  const displayedLogs = showAllLogs ? filteredLogs : filteredLogs.slice(0, 3);

  const getLogBadge = (type: RoomLogType) => {
    switch (type) {
      case 'reservation':
        return {
          icon: <CalendarCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />,
          badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          label: '예약',
        };
      case 'cleaning':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          label: '청소/점검',
        };
      case 'status':
        return {
          icon: <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          label: '상태변경',
        };
      case 'inquiry':
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />,
          badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          label: '고객문의',
        };
      case 'amenity':
        return {
          icon: <Package className="w-3.5 h-3.5 text-cyan-400 shrink-0" />,
          badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          label: '비품요청',
        };
      case 'call':
        return {
          icon: <Phone className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          label: '내선통화',
        };
      case 'note':
      default:
        return {
          icon: <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />,
          badgeClass: 'bg-slate-700/60 text-slate-200 border-slate-600',
          label: '특이메모',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm motion-safe:animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] relative">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-white">{room.number}호</span>
            <span className="text-sm text-slate-300 font-medium">{room.type}</span>
            <span
              className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${statusColors[room.status]}`}
            >
              {statusLabels[room.status]}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="닫기 (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* 1. 상태 즉시 변경 버튼군 */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">
              객실 상태 변경
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                ['available', 'occupied', 'cleaning', 'inspected', 'reserved', 'maintenance'] as RoomStatus[]
              ).map((st) => (
                <button
                  key={st}
                  onClick={() => handleSelectStatus(st)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition flex items-center justify-between ${
                    room.status === st
                      ? 'border-blue-500 bg-blue-600/20 text-white font-bold ring-1 ring-blue-500'
                      : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>{statusLabels[st]}</span>
                  {room.status === st && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 현재 투숙 / 예약 정보 */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                투숙객 정보
              </span>
              {room.platform && (
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  {room.platform} 예약
                </span>
              )}
            </div>

            {room.guestName ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">예약자명:</span>
                  <span className="font-bold text-white text-sm">{room.guestName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">연락처:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-medium text-slate-200 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {room.phone || '010-****-****'}
                    </span>
                    {room.phone && (
                      <button
                        onClick={handleCopyPhone}
                        className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] flex items-center gap-1 transition"
                        title="전화번호 복사"
                      >
                        {copiedPhone ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>복사</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block">체크인:</span>
                  <span className="font-medium text-slate-200 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {room.checkIn || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">체크아웃:</span>
                  <span className="font-medium text-slate-200 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {room.checkOut || '익일 12:00'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">현재 투숙객이 없는 빈 객실입니다.</p>
            )}

            {/* 객실 전용 투숙객 QR 페이지 바로가기 */}
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-400" />
                객실 내 비치 QR 투숙객 전용 링크:
              </span>
              <Link
                href={`/guest?room=${room.number}`}
                target="_blank"
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 hover:underline"
              >
                /guest?room={room.number}
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* 3. 청소 점검 및 AI 검사 결과 */}
          {room.inspection && (
            <div className="bg-purple-950/20 border border-purple-800/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-purple-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  AI 비전 청소 점검 분석 결과
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-900/60 text-purple-300 border border-purple-600/50">
                  {room.inspection.score}점 ({room.inspection.passed ? '합격' : '재확인'})
                </span>
              </div>
              <p className="text-xs text-purple-300/90 leading-relaxed bg-purple-900/20 p-2.5 rounded-lg border border-purple-800/30">
                {room.inspection.aiFeedback}
              </p>
              <div className="flex items-center justify-between text-[11px] text-purple-400 pt-1">
                <span>담당 룸메이드: {room.inspection.cleanerName}</span>
                <span>점검 시각: {room.inspection.timestamp}</span>
              </div>
            </div>
          )}

          {/* 4. 객실별 특이사항 / 주의 메모 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                특이사항 / 고객 선호 / 주의 메모
              </label>
              <span className="text-xs text-slate-400">{room.notes.length}건 기록</span>
            </div>

            {/* 메모 리스트 */}
            <div className="space-y-1.5 mb-3">
              {room.notes.length > 0 ? (
                room.notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                      <span>{note}</span>
                    </div>
                    <button
                      onClick={() => removeRoomNote(room.number, idx)}
                      className="text-slate-400 hover:text-rose-400 p-1 transition"
                      title="메모 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic p-2 bg-slate-800/30 rounded-lg">
                  등록된 특이사항 메모가 없습니다.
                </p>
              )}
            </div>

            {/* 메모 추가 폼 */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="예: 금연 객실 강조, 침구 추가, 소음 민원 이력 등..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition shadow-md shadow-blue-900/30"
              >
                <Plus className="w-3.5 h-3.5" />
                추가
              </button>
            </form>
          </div>

          {/* 5. 최근 호실 활동 로그 (예약, 청소, 상태변경 등 이력 타임라인) */}
          <div className="bg-slate-950/70 border border-slate-700/80 rounded-2xl p-4 space-y-3 shadow-md">
            {/* 섹션 헤더 & 접기/펼치기 버튼 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-sm shadow-blue-900/30">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-tight">
                      최근 호실 활동 로그
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      총 {roomAllLogs.length}건
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    예약 접수, 청소/AI점검, 상태변경, 비품/문의 등 실시간 타임라인
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLogExpanded(!isLogExpanded)}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-1 transition shrink-0"
                title={isLogExpanded ? '로그 섹션 접기' : '로그 섹션 펼치기'}
              >
                <span>{isLogExpanded ? '접기' : '펼치기'}</span>
                {isLogExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {isLogExpanded && (
              <>
                {/* 필터 칩 바 */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => { setLogFilter('all'); setShowAllLogs(false); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                      logFilter === 'all'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-900/40'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    전체 ({roomAllLogs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLogFilter('reservation'); setShowAllLogs(false); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border flex items-center gap-1 ${
                      logFilter === 'reservation'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-900/40'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <CalendarCheck className="w-3 h-3 text-blue-400" />
                    <span>예약 ({countReservation})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLogFilter('cleaning'); setShowAllLogs(false); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border flex items-center gap-1 ${
                      logFilter === 'cleaning'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-900/40'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>청소/점검 ({countCleaning})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLogFilter('status'); setShowAllLogs(false); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border flex items-center gap-1 ${
                      logFilter === 'status'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-sm shadow-amber-900/40'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <ArrowRightLeft className="w-3 h-3 text-amber-400" />
                    <span>상태변경 ({countStatus})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLogFilter('other'); setShowAllLogs(false); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border flex items-center gap-1 ${
                      logFilter === 'other'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-900/40'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>문의/비품/기타 ({countOther})</span>
                  </button>
                </div>

                {/* 타임라인 로그 리스트 */}
                <div className={`space-y-2 pt-1 ${showAllLogs ? 'max-h-72 overflow-y-auto pr-1' : ''}`}>
                  {displayedLogs.length > 0 ? (
                    displayedLogs.map((log) => {
                      const badge = getLogBadge(log.type);
                      return (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 border border-slate-700/70 shrink-0">
                              {badge.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-[11px] px-1.5 py-0.5 rounded font-bold border ${badge.badgeClass}`}
                                >
                                  {log.badgeText || badge.label}
                                </span>
                                <span className="text-xs font-bold text-white tracking-tight">
                                  {log.title}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1 leading-snug break-words">
                                {log.description}
                              </p>
                              {log.actor && (
                                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span>수행자: {log.actor}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {log.timestamp}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                      해당 조건의 최근 활동 이력이 없습니다.
                    </div>
                  )}
                </div>

                {/* 전체보기 토글 버튼 (3건 초과 시) */}
                {filteredLogs.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllLogs(!showAllLogs)}
                    className="w-full py-1.5 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <span>
                      {showAllLogs
                        ? '접기 (최근 3건만 표시)'
                        : `전체 ${filteredLogs.length}건 기록 모두 펼치기 (+${filteredLogs.length - 3}건)`}
                    </span>
                    {showAllLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            닫기 (Esc)
          </button>
        </div>

        {/* [P0 방어 가드레일]: 퇴실(체크아웃) 2차 확인 모달 */}
        {confirmCheckout && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 motion-safe:animate-fadeIn">
            <div className="bg-slate-900 border border-amber-500/60 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">객실 퇴실(체크아웃) 확인</h4>
                  <p className="text-xs text-slate-400">{room.number}호 투숙객 퇴실 처리</p>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <div>• 현재 투숙객: <span className="font-bold text-white">{room.guestName}</span> ({room.platform || '일반'})</div>
                <div>• 연락처: <span className="font-mono text-slate-200">{room.phone || '-'}</span></div>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300 mt-2 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>퇴실 처리 시 투숙객 정보가 초기화되고 빈방(입실가능)으로 전환됩니다.</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmCheckout(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmCheckout}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-900/40"
                >
                  퇴실 및 빈방 확정
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
