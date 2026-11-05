'use client';

import React, { useState } from 'react';
import { useMotel } from '@/context/MotelContext';
import { UserRole } from '@/types/motel';
import {
  LogIn,
  UserPlus,
  Lock,
  User,
  Phone,
  ShieldCheck,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    login,
    register,
  } = useMotel();

  // 로그인 상태
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // 회원가입 상태
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('front');
  const [regPhone, setRegPhone] = useState('');

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!loginUser.trim() || !loginPass.trim()) {
      setErrorMsg('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    const res = await login(loginUser.trim(), loginPass.trim());
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || '로그인에 실패했습니다.');
    } else {
      setLoginUser('');
      setLoginPass('');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!regUser.trim() || !regPass.trim() || !regName.trim()) {
      setErrorMsg('아이디, 비밀번호, 이름은 필수 항목입니다.');
      return;
    }

    setLoading(true);
    const res = await register({
      username: regUser.trim(),
      password: regPass.trim(),
      name: regName.trim(),
      role: regRole,
      phone: regPhone.trim(),
    });
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || '회원가입에 실패했습니다.');
    } else {
      setRegUser('');
      setRegPass('');
      setRegName('');
      setRegPhone('');
    }
  };

  // 빠른 테스트 계정 입력 헬퍼
  const handleQuickLogin = async (username: string, password: string) => {
    setLoginUser(username);
    setLoginPass(password);
    setErrorMsg(null);
    setLoading(true);
    await login(username, password);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm motion-safe:animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col relative">
        {/* 헤더 & 닫기 */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              {authMode === 'login' ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {authMode === 'login' ? 'StaySync AI 로그인' : '직원 계정 생성 (회원가입)'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {authMode === 'login'
                  ? '모텔 PMS 통합 관리 데스크 접속'
                  : '호텔 운영을 위한 전용 관리자/직원 계정 발급'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 전환 바 */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => {
              setAuthMode('login');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              authMode === 'login'
                ? 'bg-slate-800 text-white shadow-sm font-bold border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>로그인</span>
          </button>
          <button
            onClick={() => {
              setAuthMode('register');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              authMode === 'register'
                ? 'bg-slate-800 text-white shadow-sm font-bold border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>신규 계정 생성</span>
          </button>
        </div>

        {/* 본문 폼 */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: 로그인 */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  아이디
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="아이디를 입력하세요 (예: admin, front1)"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shadow-md shadow-blue-900/40 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <span>로그인 확인 중…</span>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>로그인하기</span>
                  </>
                )}
              </button>

              {/* 빠른 1초 테스트 로그인 칩 */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-2 font-medium">
                  빠른 테스트 계정 (클릭 시 1초 자동 로그인):
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin', 'password123')}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-[11px] text-rose-300 border border-rose-500/30 font-semibold transition-colors text-center"
                  >
                    점주 (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('front1', 'password123')}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-[11px] text-indigo-300 border border-indigo-500/30 font-semibold transition-colors text-center"
                  >
                    프론트 (Front)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('clean1', 'password123')}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-[11px] text-amber-300 border border-amber-500/30 font-semibold transition-colors text-center"
                  >
                    청소 (Clean)
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: 회원가입 (신규 계정 생성) */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    아이디 (영문/숫자)
                  </label>
                  <input
                    type="text"
                    value={regUser}
                    onChange={(e) => setRegUser(e.target.value)}
                    placeholder="예: manager2"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="4자리 이상"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    사용자 성명
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="예: 최팀장"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    담당 역할 (권한)
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-700/80 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="front">프론트 데스크 (Front)</option>
                    <option value="admin">점주 / 최고관리자 (Admin)</option>
                    <option value="housekeeping">하우스키핑 (Clean)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  연락처 (선택)
                </label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="예: 010-9876-5432"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shadow-md shadow-emerald-900/40 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                {loading ? (
                  <span>계정 생성 처리 중…</span>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>신규 계정 발급 완료</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
