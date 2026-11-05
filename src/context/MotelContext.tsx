'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Room,
  Reservation,
  RoomInquiry,
  AmenityRequest,
  ExtensionCallLog,
  UserAccount,
  UserRole,
  RoomStatus,
  RoomActivityLog,
  RoomLogType,
} from '@/types/motel';
import {
  INITIAL_ROOMS,
  INITIAL_RESERVATIONS,
  INITIAL_INQUIRIES,
  INITIAL_AMENITIES,
  INITIAL_CALL_LOGS,
  INITIAL_ROOM_LOGS,
  USERS,
} from '@/lib/mockData';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  timestamp: string;
}

interface MotelContextType {
  rooms: Room[];
  reservations: Reservation[];
  inquiries: RoomInquiry[];
  amenities: AmenityRequest[];
  callLogs: ExtensionCallLog[];
  roomLogs: RoomActivityLog[];
  currentUser: UserAccount;
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
  setCurrentRole: (role: UserRole) => void;
  lastCheckedOutRoom: { roomNumber: string; data: Partial<Room> } | null;
  undoCheckout: () => void;

  // Actions
  addRoomLog: (
    roomNumber: string,
    type: RoomLogType,
    title: string,
    description: string,
    actor?: string,
    badgeText?: string
  ) => void;
  updateRoomStatus: (roomNumber: string, status: RoomStatus, cleanerName?: string) => void;
  addRoomNote: (roomNumber: string, note: string) => void;
  removeRoomNote: (roomNumber: string, index: number) => void;

  submitCleaningInspection: (
    roomNumber: string,
    cleanerName: string,
    photoDataUrl: string,
    score?: number,
    feedback?: string
  ) => void;

  syncReservations: () => Promise<number>;
  checkInReservation: (reservationId: string, roomNumber: string) => void;

  addInquiry: (roomNumber: string, guestName: string, message: string, category?: any) => Promise<string>;
  resolveInquiry: (inquiryId: string, answerText: string) => void;

  addAmenityRequest: (roomNumber: string, item: string, quantity: number) => void;
  deliverAmenity: (requestId: string) => void;

  simulateIncomingCall: (roomNumber: string, question: string) => Promise<void>;
}

const MotelContext = createContext<MotelContextType | undefined>(undefined);

export function MotelProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [inquiries, setInquiries] = useState<RoomInquiry[]>(INITIAL_INQUIRIES);
  const [amenities, setAmenities] = useState<AmenityRequest[]>(INITIAL_AMENITIES);
  const [callLogs, setCallLogs] = useState<ExtensionCallLog[]>(INITIAL_CALL_LOGS);
  const [roomLogs, setRoomLogs] = useState<RoomActivityLog[]>(INITIAL_ROOM_LOGS);
  const [currentUser, setCurrentUser] = useState<UserAccount>(USERS[1]); // 기본 프론트 직원
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [lastCheckedOutRoom, setLastCheckedOutRoom] = useState<{ roomNumber: string; data: Partial<Room> } | null>(null);

  // 객실 활동 로그 추가 유틸
  const addRoomLog = (
    roomNumber: string,
    type: RoomLogType,
    title: string,
    description: string,
    actor?: string,
    badgeText?: string
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newLog: RoomActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      roomNumber,
      type,
      title,
      description,
      timestamp: timeStr,
      actor: actor || currentUser.name,
      badgeText,
    };
    setRoomLogs((prev) => [newLog, ...prev]);
  };

  // SQLite DB 초기 데이터 로드 (마운트 시점)
  useEffect(() => {
    fetch('/api/rooms')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setRooms(data);
      })
      .catch(() => {});

    fetch('/api/sync/reservations')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.reservations) && data.reservations.length > 0) {
          setReservations(data.reservations);
        }
      })
      .catch(() => {});
  }, []);

  // 토스트 알림 추가 유틸
  const addToast = (title: string, message: string, type: ToastNotification['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newToast = { id, title, message, type, timestamp: timeStr };

    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    // 6초 뒤 자동 삭제
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setCurrentRole = (role: UserRole) => {
    const matched = USERS.find((u) => u.role === role) || USERS[0];
    setCurrentUser(matched);
    addToast('역할 전환', `${matched.name} (${matched.role.toUpperCase()}) 계정으로 전환되었습니다.`, 'info');
  };

  // 객실 상태 변경
  const updateRoomStatus = (roomNumber: string, status: RoomStatus, cleanerName?: string) => {
    const statusLabels: Record<RoomStatus, string> = {
      available: '입실가능 (빈방)',
      occupied: '재실중 (투숙중)',
      cleaning: '청소중',
      inspected: '청소점검완료',
      reserved: '예약입실대기',
      maintenance: '시설점검/수리중',
    };

    setRooms((prev) =>
      prev.map((r) => {
        if (r.number === roomNumber) {
          if (status === 'available' && r.guestName) {
            // 퇴실 시 기존 투숙객 정보 백업 (실행 취소용)
            setLastCheckedOutRoom({
              roomNumber,
              data: {
                guestName: r.guestName,
                phone: r.phone,
                platform: r.platform,
                checkIn: r.checkIn,
                checkOut: r.checkOut,
              },
            });

            addRoomLog(
              roomNumber,
              'status',
              '투숙객 퇴실 (체크아웃)',
              `${r.guestName} 고객님 퇴실 처리 완료 (상태: 빈방 전환)`,
              currentUser.name,
              '체크아웃'
            );
          } else {
            addRoomLog(
              roomNumber,
              status === 'cleaning' ? 'cleaning' : 'status',
              `객실 상태 변경 [${statusLabels[status] || status}]`,
              cleanerName
                ? `담당 룸메이드: ${cleanerName} (청소 작업 진행)`
                : `상태가 [${statusLabels[status] || status}]로 업데이트되었습니다.`,
              cleanerName || currentUser.name,
              statusLabels[status]
            );
          }

          return {
            ...r,
            status,
            ...(cleanerName ? { cleanerName } : {}),
            ...(status === 'available' ? { guestName: undefined, phone: undefined, platform: undefined } : {}),
          };
        }
        return r;
      })
    );
    addToast('객실 상태 변경', `${roomNumber}호 상태가 [${status}]로 업데이트되었습니다.`, 'info');
  };

  // 퇴실 취소 (Undo Checkout)
  const undoCheckout = () => {
    if (!lastCheckedOutRoom) return;
    const { roomNumber, data } = lastCheckedOutRoom;
    setRooms((prev) =>
      prev.map((r) =>
        r.number === roomNumber
          ? { ...r, status: 'occupied', ...data }
          : r
      )
    );
    addRoomLog(
      roomNumber,
      'status',
      '퇴실 실행 취소 (복원)',
      `${data.guestName ? `${data.guestName} 고객님 ` : ''}투숙 정보가 정상 복원되어 [재실중] 상태로 재전환되었습니다.`,
      currentUser.name,
      '퇴실 취소'
    );
    setLastCheckedOutRoom(null);
    addToast('퇴실 실행 취소', `${roomNumber}호 투숙객 정보가 정상 복원되었습니다.`, 'success');
  };

  // 객실 메모 추가
  const addRoomNote = (roomNumber: string, note: string) => {
    if (!note.trim()) return;
    setRooms((prev) =>
      prev.map((r) => (r.number === roomNumber ? { ...r, notes: [...r.notes, note.trim()] } : r))
    );
    addRoomLog(
      roomNumber,
      'note',
      '특이사항 메모 등록',
      note.trim(),
      currentUser.name,
      '메모 추가'
    );
    addToast('특이사항 메모', `${roomNumber}호에 메모가 저장되었습니다.`, 'info');
  };

  // 객실 메모 삭제
  const removeRoomNote = (roomNumber: string, index: number) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.number === roomNumber
          ? { ...r, notes: r.notes.filter((_, i) => i !== index) }
          : r
      )
    );
  };

  // 청소 점검 사진 업로드 & AI 분석 시뮬레이션
  const submitCleaningInspection = (
    roomNumber: string,
    cleanerName: string,
    photoDataUrl: string,
    score = 96,
    feedback = 'AI 비전 분석 완료: 침구 주름 정돈 양호, 욕실 건조 및 어메니티 2인 세트 구비 확인. 합격 판정.'
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const inspection = {
      photoUrl: photoDataUrl,
      score,
      passed: score >= 85,
      timestamp: timeStr,
      cleanerName,
      items: {
        bedding: true,
        bathroom: true,
        amenities: true,
        trash: true,
        floor: score >= 90,
      },
      aiFeedback: feedback,
    };

    setRooms((prev) =>
      prev.map((r) => {
        if (r.number === roomNumber) {
          return {
            ...r,
            status: inspection.passed ? 'inspected' : 'cleaning',
            cleanerName,
            inspection,
          };
        }
        return r;
      })
    );

    addToast(
      '청소 AI 점검 완료',
      `${roomNumber}호 AI 점검 결과: ${score}점 (${inspection.passed ? '합격/입실가능' : '재확인 필요'})`,
      inspection.passed ? 'success' : 'warning'
    );

    addRoomLog(
      roomNumber,
      'cleaning',
      `AI 비전 청소 점검 ${score}점 (${score >= 85 ? '합격' : '재확인'})`,
      feedback,
      cleanerName ? `${cleanerName} & AI 비전` : 'AI 비전 검수',
      score >= 85 ? 'AI 점검 합격' : '재점검 요망'
    );
  };

  // 예약 크롤링/동기화 연동 (파이썬 크롤러 API 우선 연동)
  const syncReservations = async (): Promise<number> => {
    try {
      const res = await fetch('/api/sync/reservations');
      const data = await res.json();
      const crawlerReservations: Reservation[] = data.reservations || [];

      if (crawlerReservations.length > 0) {
        // 이미 등록된 예약 제외하고 신규 건만 추가
        setReservations((prev) => {
          const existingIds = new Set(prev.map((r) => r.reservationNo));
          const fresh = crawlerReservations.filter((r) => !existingIds.has(r.reservationNo));
          if (fresh.length > 0) {
            addToast(
              '파이썬 크롤러 예약 동기화',
              `[${fresh[0].platform}] ${fresh[0].guestName} 등 ${fresh.length}건의 실제 크롤링 예약이 동기화되었습니다.`,
              'info'
            );
            return [...fresh, ...prev];
          }
          return prev;
        });
        return crawlerReservations.length;
      }
    } catch {}

    // 폴백 시뮬레이션
    return new Promise((resolve) => {
      setTimeout(() => {
        const platforms: Reservation['platform'][] = ['야놀자', '여기어때', '아고다', '네이버'];
        const names = ['유*진', '문*우', '송*민', '임*희'];
        const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const newRes: Reservation = {
          id: `res-${Date.now()}`,
          reservationNo: `SYNC-${Date.now().toString().slice(-6)}`,
          platform: randomPlatform,
          guestName: randomName,
          phone: '010-5821-****',
          roomType: '스탠다드 더블',
          checkInDate: '2026-11-03',
          checkInTime: '20:30',
          checkOutDate: '2026-11-04',
          price: 70000,
          status: '대기',
          syncedAt: timeStr,
        };

        setReservations((prev) => [newRes, ...prev]);
        addToast(
          '신규 예약 동기화',
          `[${randomPlatform}] ${randomName} 고객님 예약 1건이 실시간 연동되었습니다.`,
          'info'
        );
        resolve(1);
      }, 500);
    });
  };

  // 예약 건을 실제 객실로 체크인 처리
  const checkInReservation = (reservationId: string, roomNumber: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;

    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: '체크인완료', roomNumber } : r))
    );

    setRooms((prev) =>
      prev.map((room) => {
        if (room.number === roomNumber) {
          return {
            ...room,
            status: 'occupied',
            guestName: res.guestName,
            phone: res.phone,
            platform: res.platform,
            checkIn: res.checkInTime,
            checkOut: '익일 12:00',
          };
        }
        return room;
      })
    );

    addToast('체크인 완료', `${res.guestName} (${res.platform}) -> ${roomNumber}호 입실 처리되었습니다.`, 'success');

    addRoomLog(
      roomNumber,
      'reservation',
      `[${res.platform}] 예약 고객 입실 (체크인)`,
      `${res.guestName} (${res.phone}) ${res.roomType} 배정 입실 완료`,
      currentUser.name,
      '체크인'
    );
  };

  // 객실 문의 추가 (투숙객 QR 또는 프론트 등록)
  const addInquiry = async (
    roomNumber: string,
    guestName: string,
    message: string,
    category: any = '비품'
  ): Promise<string> => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const id = `inq-${Date.now()}`;

    // 기본 등록
    const initialInquiry: RoomInquiry = {
      id,
      roomNumber,
      guestName,
      category,
      message,
      status: 'new',
      createdAt: timeStr,
      isUrgent: message.includes('급') || message.includes('환불') || message.includes('소음'),
    };

    setInquiries((prev) => [initialInquiry, ...prev]);

    addToast(
      `객실 문의 [${roomNumber}호]`,
      `${guestName}: "${message.slice(0, 30)}${message.length > 30 ? '...' : ''}"`,
      initialInquiry.isUrgent ? 'urgent' : 'info'
    );

    addRoomLog(
      roomNumber,
      'inquiry',
      `객실 ${category} 문의 접수`,
      `"${message}" (고객: ${guestName})`,
      guestName,
      'QR 문의'
    );

    // Dify API 백그라운드 호출을 통해 AI 답변 생성
    try {
      const res = await fetch('/api/dify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: `${roomNumber}호 ${guestName}`,
          userContent: message,
        }),
      });

      const data = await res.json();
      const aiAnswer = data.answer || '답변을 생성할 수 없습니다.';

      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, aiSuggestedAnswer: aiAnswer } : inq))
      );

      return aiAnswer;
    } catch {
      const fallback = '프론트 데스크에서 확인 후 신속히 안내해 드리겠습니다.';
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, aiSuggestedAnswer: fallback } : inq))
      );
      return fallback;
    }
  };

  // 문의 완료 처리
  const resolveInquiry = (inquiryId: string, answerText: string) => {
    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === inquiryId
          ? { ...inq, status: 'resolved', finalAnswer: answerText }
          : inq
      )
    );
    addToast('문의 조치 완료', '고객 문의가 처리 완료되었습니다.', 'success');
  };

  // 원클릭 비품 요청
  const addAmenityRequest = (roomNumber: string, item: string, quantity: number) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const req: AmenityRequest = {
      id: `am-${Date.now()}`,
      roomNumber,
      item,
      quantity,
      status: 'pending',
      createdAt: timeStr,
    };

    setAmenities((prev) => [req, ...prev]);
    addToast('비품 요청 도착', `${roomNumber}호에서 [${item} x ${quantity}] 요청이 접수되었습니다.`, 'urgent');

    addRoomLog(
      roomNumber,
      'amenity',
      '비품 추가 요청 접수',
      `${item} (${quantity}개) 추가 요청이 접수되었습니다.`,
      '투숙객',
      '비품 요청'
    );
  };

  const deliverAmenity = (requestId: string) => {
    const target = amenities.find((a) => a.id === requestId);
    setAmenities((prev) =>
      prev.map((a) => (a.id === requestId ? { ...a, status: 'delivered' } : a))
    );
    addToast('비품 전달 완료', '비품이 고객에게 전달 완료 처리되었습니다.', 'success');

    if (target) {
      addRoomLog(
        target.roomNumber,
        'amenity',
        '비품 전달 완료',
        `${target.item} (${target.quantity}개) 고객 전달 완료 처리되었습니다.`,
        currentUser.name,
        '전달 완료'
      );
    }
  };

  // 내선 전화 시뮬레이션
  const simulateIncomingCall = async (roomNumber: string, question: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    addToast('내선 전화 수신', `${roomNumber}호에서 프론트로 전화가 걸려왔습니다.`, 'urgent');

    // Dify에 AI 답변 스크립트 질의
    let aiScript = '호텔 표준 응대 매뉴얼에 따라 친절히 안내합니다.';
    try {
      const res = await fetch('/api/dify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: `${roomNumber}호 내선전화`,
          userContent: question,
        }),
      });
      const data = await res.json();
      if (data.answer) aiScript = data.answer;
    } catch {}

    const callLog: ExtensionCallLog = {
      id: `call-${Date.now()}`,
      roomNumber,
      timestamp: timeStr,
      caller: `${roomNumber}호 내선`,
      duration: '50초',
      category: '내선 음성 문의',
      transcript: `고객: "${question}"`,
      aiSuggestedAction: `AI 권장 스크립트: ${aiScript}`,
      status: '조치필요',
    };

    setCallLogs((prev) => [callLog, ...prev]);

    addRoomLog(
      roomNumber,
      'call',
      '객실 내선 전화 수신',
      `고객: "${question}"`,
      `${roomNumber}호 내선`,
      '음성 통화'
    );
  };

  return (
    <MotelContext.Provider
      value={{
        rooms,
        reservations,
        inquiries,
        amenities,
        callLogs,
        roomLogs,
        currentUser,
        toasts,
        dismissToast,
        setCurrentRole,
        lastCheckedOutRoom,
        undoCheckout,
        addRoomLog,
        updateRoomStatus,
        addRoomNote,
        removeRoomNote,
        submitCleaningInspection,
        syncReservations,
        checkInReservation,
        addInquiry,
        resolveInquiry,
        addAmenityRequest,
        deliverAmenity,
        simulateIncomingCall,
      }}
    >
      {children}
    </MotelContext.Provider>
  );
}

export function useMotel() {
  const context = useContext(MotelContext);
  if (!context) {
    throw new Error('useMotel must be used within a MotelProvider');
  }
  return context;
}
