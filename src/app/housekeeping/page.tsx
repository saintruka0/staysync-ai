'use client';

import React, { useState } from 'react';
import { useMotel } from '@/context/MotelContext';
import {
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Upload,
  RefreshCw,
  User,
  BedDouble,
} from 'lucide-react';
import Link from 'next/link';

export default function HousekeepingPage() {
  const { rooms, updateRoomStatus, submitCleaningInspection } = useMotel();
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [activeRoomNumber, setActiveRoomNumber] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cleanerName, setCleanerName] = useState('김이모');

  const filteredRooms = rooms.filter((r) => {
    if (selectedFloor !== 'all' && r.floor !== selectedFloor) return false;
    return true;
  });

  const handleStartCleaning = (roomNumber: string) => {
    updateRoomStatus(roomNumber, 'cleaning', cleanerName);
    setActiveRoomNumber(roomNumber);
  };

  const handleSimulatePhotoUpload = (roomNumber: string) => {
    setActiveRoomNumber(roomNumber);
    // 가상의 청소 완료 사진 데이터 시뮬레이션
    setPhotoPreview(
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'
    );
  };

  const handleRunAiInspection = () => {
    if (!activeRoomNumber) return;

    setIsAnalyzing(true);

    // AI 비전 분석 시뮬레이션 (1.5초)
    setTimeout(() => {
      submitCleaningInspection(
        activeRoomNumber,
        cleanerName,
        photoPreview || '',
        97,
        'AI 비전 판독: 침구류 주름 없이 반듯하게 정돈됨. 세면대 및 거울 물기 제거 완료, 어메니티 2인 세트 및 생수 2병 비치 확인. 97점 최종 합격.'
      );
      setIsAnalyzing(false);
      setPhotoPreview(null);
      setActiveRoomNumber(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-slate-900 border-x border-slate-800 flex flex-col min-h-screen shadow-2xl">
        {/* 상단 헤더 */}
        <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>데스크 메인</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-xs font-bold text-white">하우스키핑 전용 모바일</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <select
              value={cleanerName}
              onChange={(e) => setCleanerName(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-xs"
            >
              <option value="김이모">김이모</option>
              <option value="박주임">박주임</option>
              <option value="이담당">이담당</option>
            </select>
          </div>
        </div>

        {/* 안내 배너 */}
        <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-b border-slate-800">
          <h1 className="text-base font-black text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            객실 청소 & AI 사진 검사
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            청소 완료 후 사진을 등록하면 AI가 침구/욕실/비품 상태를 자동 판정합니다.
          </p>

          {/* 층별 필터 */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto text-xs">
            {(['all', 2, 3, 4, 5] as const).map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  selectedFloor === floor
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {floor === 'all' ? '전체' : `${floor}층`}
              </button>
            ))}
          </div>
        </div>

        {/* 객실 청소 목록 */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 pb-24">
          {filteredRooms.map((room) => {
            const isTarget = activeRoomNumber === room.number;

            return (
              <div
                key={room.id}
                className={`p-4 rounded-2xl border transition space-y-3 ${
                  room.status === 'cleaning'
                    ? 'bg-amber-950/20 border-amber-700/60'
                    : room.status === 'inspected'
                    ? 'bg-purple-950/20 border-purple-800/40'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white">{room.number}호</span>
                    <span className="text-xs text-slate-400">{room.type}</span>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      room.status === 'cleaning'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        : room.status === 'inspected'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : room.status === 'occupied'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {room.status === 'cleaning'
                      ? '청소중'
                      : room.status === 'inspected'
                      ? '점검완료(합격)'
                      : room.status === 'occupied'
                      ? '재실중'
                      : '입실가능'}
                  </span>
                </div>

                {/* 특이사항 안내 */}
                {room.notes.length > 0 && (
                  <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-800/40">
                    ⚠️ {room.notes.join(' / ')}
                  </div>
                )}

                {/* 청소 완료 검사 결과 (기존) */}
                {room.inspection && (
                  <div className="text-xs text-purple-300 bg-purple-950/30 p-2.5 rounded-xl border border-purple-800/40 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                        AI 검사 점수: {room.inspection.score}점
                      </span>
                      <span className="text-[10px] text-slate-400">{room.inspection.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{room.inspection.aiFeedback}</p>
                  </div>
                )}

                {/* 액션 버튼들 */}
                <div className="pt-1 flex gap-2">
                  {room.status !== 'cleaning' && room.status !== 'inspected' && (
                    <button
                      onClick={() => handleStartCleaning(room.number)}
                      className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      청소 시작하기
                    </button>
                  )}

                  {(room.status === 'cleaning' || isTarget) && (
                    <button
                      onClick={() => handleSimulatePhotoUpload(room.number)}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      청소 완료 사진 촬영 & AI 검사
                    </button>
                  )}

                  {room.status === 'inspected' && (
                    <button
                      onClick={() => updateRoomStatus(room.number, 'available')}
                      className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      프론트 빈방(입실가능) 확정
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI 사진 업로드 & 검사 팝업 모달 */}
        {photoPreview && activeRoomNumber && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  {activeRoomNumber}호 청소 사진 AI 판독
                </h3>
                <button
                  onClick={() => setPhotoPreview(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  취소
                </button>
              </div>

              {/* 사진 미리보기 */}
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video flex items-center justify-center">
                <img
                  src={photoPreview}
                  alt="객실 청소 상태"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded text-white backdrop-blur">
                  촬영 시각: 방금 전
                </span>
              </div>

              {/* 검사 항목 리스트 */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <span className="font-semibold text-slate-400 block mb-1">AI 자동 판독 항목:</span>
                <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg">
                  <span>침구류(이불/베개) 정돈 및 주름</span>
                  <span className="text-emerald-400 font-bold">확인 예정</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg">
                  <span>어메니티/생수 2인 세트 비치</span>
                  <span className="text-emerald-400 font-bold">확인 예정</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg">
                  <span>욕실 건조 및 쓰레기통 비움</span>
                  <span className="text-emerald-400 font-bold">확인 예정</span>
                </div>
              </div>

              {/* 검사 실행 버튼 */}
              <button
                onClick={handleRunAiInspection}
                disabled={isAnalyzing}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                    <span>AI 비전 심층 판독 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>AI 자동 검사 완료 및 프론트 통보</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
