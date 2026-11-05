import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// 1. 객실 테이블 (rooms)
export const roomsTable = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  number: text('number').notNull().unique(),
  floor: integer('floor').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull().default('available'),
  guestName: text('guest_name'),
  phone: text('phone'),
  platform: text('platform'),
  checkIn: text('check_in'),
  checkOut: text('check_out'),
  cleanerName: text('cleaner_name'),
  inspectionJson: text('inspection_json'), // RoomInspection JSON
  notesJson: text('notes_json').notNull().default('[]'), // string[] JSON
  wifiPassword: text('wifi_password').default('stay1234!'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// 2. 예약 테이블 (reservations)
export const reservationsTable = sqliteTable('reservations', {
  id: text('id').primaryKey(),
  reservationNo: text('reservation_no').notNull().unique(),
  platform: text('platform').notNull(),
  guestName: text('guest_name').notNull(),
  phone: text('phone').notNull(),
  roomType: text('room_type').notNull(),
  roomNumber: text('room_number'),
  checkInDate: text('check_in_date').notNull(),
  checkInTime: text('check_in_time').notNull(),
  checkOutDate: text('check_out_date').notNull(),
  price: integer('price').notNull().default(0),
  status: text('status').notNull().default('대기'),
  syncedAt: text('synced_at').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 3. 문의사항 테이블 (inquiries)
export const inquiriesTable = sqliteTable('inquiries', {
  id: text('id').primaryKey(),
  roomNumber: text('room_number').notNull(),
  guestName: text('guest_name').notNull(),
  category: text('category').notNull().default('비품'),
  message: text('message').notNull(),
  aiSuggestedAnswer: text('ai_suggested_answer'),
  finalAnswer: text('final_answer'),
  status: text('status').notNull().default('new'),
  isUrgent: integer('is_urgent').notNull().default(0), // 0 or 1
  createdAt: text('created_at').notNull(),
});

// 4. 비품 요청 테이블 (amenity_requests)
export const amenityRequestsTable = sqliteTable('amenity_requests', {
  id: text('id').primaryKey(),
  roomNumber: text('room_number').notNull(),
  item: text('item').notNull(),
  quantity: integer('quantity').notNull().default(1),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
});

// 5. 내선 전화 통화 로그 테이블 (call_logs)
export const callLogsTable = sqliteTable('call_logs', {
  id: text('id').primaryKey(),
  roomNumber: text('room_number').notNull(),
  timestamp: text('timestamp').notNull(),
  caller: text('caller').notNull(),
  duration: text('duration').notNull(),
  category: text('category').notNull(),
  transcript: text('transcript').notNull(),
  aiSuggestedAction: text('ai_suggested_action').notNull(),
  status: text('status').notNull().default('조치필요'),
});

// 6. 사용자/직원 계정 테이블 (users)
export const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull().default('password123'),
  name: text('name').notNull(),
  role: text('role').notNull().default('front'),
  phone: text('phone').notNull(),
});

// 7. 객실별 활동 이력/로그 테이블 (room_logs)
export const roomLogsTable = sqliteTable('room_logs', {
  id: text('id').primaryKey(),
  roomNumber: text('room_number').notNull(),
  type: text('type').notNull(), // 'reservation' | 'cleaning' | 'status' | 'inquiry' | 'amenity' | 'call' | 'note'
  title: text('title').notNull(),
  description: text('description').notNull(),
  timestamp: text('timestamp').notNull(),
  actor: text('actor'),
  badgeText: text('badge_text'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
