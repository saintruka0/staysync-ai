'use client';

import React, { useState } from 'react';
import { useMotel } from '@/context/MotelContext';
import { UserAccount, UserRole } from '@/types/motel';
import { ShieldCheck, User, Plus, X, Check, Phone } from 'lucide-react';

interface UserManagementModalProps {
  onClose: () => void;
}

export default function UserManagementModal({ onClose }: UserManagementModalProps) {
  const { users, addUserAccount } = useMotel();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('front');
  const [loading, setLoading] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    await addUserAccount({
      username: `user_${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      phone: phone.trim() || '010-0000-0000',
      role,
      password: 'password123',
    });
    setLoading(false);
    setName('');
    setPhone('');
  };

  const roleLabels: Record<UserRole, { label: string; desc: string; color: string }> = {
    admin: {
      label: '점주 / 최고 관리자 (Admin)',
      desc: '시스템 전 권한, Dify API 설정, 직원 계정 관리, 전체 통계',
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    front: {
      label: '프론트 데스크 (Front)',
      desc: '예약 싱크, 방 배정, 고객 문의 실시간 응대, 비품 전달, AI 챗봇',
      color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    housekeeping: {
      label: '하우스키핑 (Housekeeping)',
      desc: '객실 청소 상태 관리, 청소 완료 사진 업로드 및 AI 점검 검사',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm motion-safe:animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">직원 사용자 & 권한 관리 (RBAC)</h3>
              <p className="text-xs text-slate-400">점주, 프론트 데스크, 하우스키핑 3단계 권한 체계</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* 권한 체계 설명 카드 */}
          <div className="space-y-2 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60 text-xs">
            <span className="font-bold text-slate-200 block mb-1">역할별 접근 권한 정의:</span>
            {Object.entries(roleLabels).map(([key, val]) => (
              <div key={key} className="flex items-start gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${val.color}`}>
                  {key.toUpperCase()}
                </span>
                <span className="text-slate-400">{val.desc}</span>
              </div>
            ))}
          </div>

          {/* 등록된 직원 목록 */}
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-2">
              등록된 직원 계정 목록 ({users.length}명)
            </span>
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200">{u.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {u.phone}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold border ${roleLabels[u.role].color}`}
                  >
                    {u.role.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 직원 추가 폼 */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-indigo-300 block">
              신규 직원 계정 추가
            </span>
            <form onSubmit={handleAddUser} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="이름 (예: 정직원)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
                <input
                  type="text"
                  placeholder="연락처 (예: 010-1234-5678)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="bg-slate-900 text-slate-200 text-xs border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-1"
                >
                  <option value="front">프론트 데스크 (Front)</option>
                  <option value="housekeeping">하우스키핑 (Housekeeping)</option>
                  <option value="admin">점주 / 최고 관리자 (Admin)</option>
                </select>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {loading ? '등록 중…' : '계정 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
