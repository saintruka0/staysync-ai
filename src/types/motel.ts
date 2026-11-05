export type RoomStatus =
  | 'available'    // 입실가능 (빈방)
  | 'occupied'     // 재실중
  | 'cleaning'     // 청소중
  | 'inspected'    // 청소점검완료
  | 'reserved'     // 예약입실대기
  | 'maintenance'; // 수리/점검

export type RoomType =
  | '스탠다드 더블'
  | '디럭스 트윈'
  | '프리미엄 스위트'
  | '게이밍 PC 2인실'
  | '스파 욕조룸';

export interface RoomInspection {
  photoUrl?: string;
  score: number; // 0-100
  passed: boolean;
  timestamp: string;
  cleanerName: string;
  items: {
    bedding: boolean;   // 침구 정돈
    bathroom: boolean;  // 욕실 물기/세면도구
    amenities: boolean; // 어메니티 완비
    trash: boolean;     // 쓰레기통 비움
    floor: boolean;     // 바닥 청결
  };
  aiFeedback: string;
}

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  guestName?: string;
  phone?: string;
  platform?: '야놀자' | '여기어때' | '아고다' | '네이버' | '현장';
  checkIn?: string;
  checkOut?: string;
  cleanerName?: string;
  inspection?: RoomInspection;
  notes: string[]; // 특이사항/주의사항 메모
  wifiPassword?: string;
}

export interface Reservation {
  id: string;
  reservationNo: string;
  platform: '야놀자' | '여기어때' | '아고다' | '네이버' | '현장';
  guestName: string;
  phone: string;
  roomType: RoomType;
  roomNumber?: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  price: number;
  status: '대기' | '체크인완료' | '취소';
  syncedAt: string;
}

export interface RoomInquiry {
  id: string;
  roomNumber: string;
  guestName: string;
  category: '비품' | '시설' | '소음' | '퇴실' | '기타';
  message: string;
  aiSuggestedAnswer?: string;
  finalAnswer?: string;
  status: 'new' | 'answered' | 'resolved';
  createdAt: string;
  isUrgent?: boolean;
}

export interface AmenityRequest {
  id: string;
  roomNumber: string;
  item: string;
  quantity: number;
  status: 'pending' | 'delivered';
  createdAt: string;
}

export interface ExtensionCallLog {
  id: string;
  roomNumber: string;
  timestamp: string;
  caller: string;
  duration: string;
  category: string;
  transcript: string;
  aiSuggestedAction: string;
  status: '조치완료' | '조치필요' | '부재중';
}

export type RoomLogType =
  | 'reservation' // OTA 또는 현장 예약 관련
  | 'cleaning'    // 청소 시작, 완료, AI 비전 검수
  | 'status'      // 객실 상태 전이 (입실, 퇴실, 점검 등)
  | 'inquiry'     // 투숙객 QR 문의 및 AI 응대
  | 'amenity'     // 수건, 생수 등 비품 요청 및 전달
  | 'call'        // 내선 전화 통화 및 음성 문의
  | 'note';       // 특이사항 메모 등록

export interface RoomActivityLog {
  id: string;
  roomNumber: string;
  type: RoomLogType;
  title: string;
  description: string;
  timestamp: string;
  actor?: string;      // 수행자: '프론트 데스크', '김이모(룸메이드)', '야놀자', 'AI 비전', '투숙객' 등
  badgeText?: string;  // 보조 뱃지: '체크인', 'AI합격', '배달안내' 등
}

export type UserRole = 'admin' | 'front' | 'housekeeping';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone: string;
}
