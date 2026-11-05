import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import {
  INITIAL_ROOMS,
  INITIAL_RESERVATIONS,
  INITIAL_INQUIRIES,
  INITIAL_AMENITIES,
  INITIAL_CALL_LOGS,
  INITIAL_ROOM_LOGS,
  USERS,
} from '@/lib/mockData';

const sqliteUrl = process.env.DATABASE_URL || 'file:stay.db';

export const client = createClient({
  url: sqliteUrl,
});

export const db = drizzle(client, { schema });

let isInitialized = false;

export async function initDatabase() {
  if (isInitialized) return;

  // 1. 테이블 DDL 생성
  await client.execute(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL UNIQUE,
      floor INTEGER NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      guest_name TEXT,
      phone TEXT,
      platform TEXT,
      check_in TEXT,
      check_out TEXT,
      cleaner_name TEXT,
      inspection_json TEXT,
      notes_json TEXT NOT NULL DEFAULT '[]',
      wifi_password TEXT DEFAULT 'stay1234!',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      reservation_no TEXT NOT NULL UNIQUE,
      platform TEXT NOT NULL,
      guest_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      room_type TEXT NOT NULL,
      room_number TEXT,
      check_in_date TEXT NOT NULL,
      check_in_time TEXT NOT NULL,
      check_out_date TEXT NOT NULL,
      price INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT '대기',
      synced_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      room_number TEXT NOT NULL,
      guest_name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '비품',
      message TEXT NOT NULL,
      ai_suggested_answer TEXT,
      final_answer TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      is_urgent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS amenity_requests (
      id TEXT PRIMARY KEY,
      room_number TEXT NOT NULL,
      item TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS call_logs (
      id TEXT PRIMARY KEY,
      room_number TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      caller TEXT NOT NULL,
      duration TEXT NOT NULL,
      category TEXT NOT NULL,
      transcript TEXT NOT NULL,
      ai_suggested_action TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT '조치필요'
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'front',
      phone TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS room_logs (
      id TEXT PRIMARY KEY,
      room_number TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      actor TEXT,
      badge_text TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. 초기 데이터 시딩 (테이블이 비어있는 경우에만 실행)
  const roomCount = await client.execute('SELECT COUNT(*) as cnt FROM rooms');
  if (Number(roomCount.rows[0].cnt) === 0) {
    for (const r of INITIAL_ROOMS) {
      await client.execute({
        sql: `INSERT INTO rooms (id, number, floor, type, status, guest_name, phone, platform, check_in, check_out, cleaner_name, inspection_json, notes_json)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          r.id,
          r.number,
          r.floor,
          r.type,
          r.status,
          r.guestName || null,
          r.phone || null,
          r.platform || null,
          r.checkIn || null,
          r.checkOut || null,
          r.cleanerName || null,
          r.inspection ? JSON.stringify(r.inspection) : null,
          JSON.stringify(r.notes || []),
        ],
      });
    }
  }

  const resCount = await client.execute('SELECT COUNT(*) as cnt FROM reservations');
  if (Number(resCount.rows[0].cnt) === 0) {
    for (const res of INITIAL_RESERVATIONS) {
      await client.execute({
        sql: `INSERT INTO reservations (id, reservation_no, platform, guest_name, phone, room_type, room_number, check_in_date, check_in_time, check_out_date, price, status, synced_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          res.id,
          res.reservationNo,
          res.platform,
          res.guestName,
          res.phone,
          res.roomType,
          res.roomNumber || null,
          res.checkInDate,
          res.checkInTime,
          res.checkOutDate,
          res.price,
          res.status,
          res.syncedAt,
        ],
      });
    }
  }

  const inqCount = await client.execute('SELECT COUNT(*) as cnt FROM inquiries');
  if (Number(inqCount.rows[0].cnt) === 0) {
    for (const inq of INITIAL_INQUIRIES) {
      await client.execute({
        sql: `INSERT INTO inquiries (id, room_number, guest_name, category, message, ai_suggested_answer, final_answer, status, is_urgent, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          inq.id,
          inq.roomNumber,
          inq.guestName,
          inq.category,
          inq.message,
          inq.aiSuggestedAnswer || null,
          inq.finalAnswer || null,
          inq.status,
          inq.isUrgent ? 1 : 0,
          inq.createdAt,
        ],
      });
    }
  }

  const userCount = await client.execute('SELECT COUNT(*) as cnt FROM users');
  if (Number(userCount.rows[0].cnt) === 0) {
    for (const u of USERS) {
      await client.execute({
        sql: `INSERT INTO users (id, username, name, role, phone) VALUES (?, ?, ?, ?, ?)`,
        args: [u.id, u.username, u.name, u.role, u.phone],
      });
    }
  }

  const logCount = await client.execute('SELECT COUNT(*) as cnt FROM room_logs');
  if (Number(logCount.rows[0].cnt) === 0) {
    for (const log of INITIAL_ROOM_LOGS) {
      await client.execute({
        sql: `INSERT INTO room_logs (id, room_number, type, title, description, timestamp, actor, badge_text)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          log.id,
          log.roomNumber,
          log.type,
          log.title,
          log.description,
          log.timestamp,
          log.actor || null,
          log.badgeText || null,
        ],
      });
    }
  }

  isInitialized = true;
}
