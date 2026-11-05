import { NextResponse } from 'next/server';
import { client, initDatabase } from '@/db';
import { Reservation } from '@/types/motel';

export async function GET() {
  await initDatabase();
  const res = await client.execute('SELECT * FROM reservations ORDER BY created_at DESC');

  const reservations: Reservation[] = res.rows.map((row: any) => ({
    id: row.id,
    reservationNo: row.reservation_no,
    platform: row.platform,
    guestName: row.guest_name,
    phone: row.phone,
    roomType: row.room_type,
    roomNumber: row.room_number || undefined,
    checkInDate: row.check_in_date,
    checkInTime: row.check_in_time,
    checkOutDate: row.check_out_date,
    price: Number(row.price),
    status: row.status,
    syncedAt: row.synced_at,
  }));

  return NextResponse.json({
    count: reservations.length,
    reservations,
  });
}

export async function POST(req: Request) {
  try {
    await initDatabase();
    const body = await req.json();
    const { platform = '크롤러', reservations = [] } = body;

    if (!Array.isArray(reservations) || reservations.length === 0) {
      return NextResponse.json(
        { error: 'reservations 배열이 비어있습니다.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newEntries: Reservation[] = [];

    for (const item of reservations) {
      const id = item.id || `crawler-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const reservationNo = item.reservationNo || `${platform.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-6)}`;
      const price = Number(item.price) || 60000;
      const roomType = item.roomType || '스탠다드 더블';
      const checkInDate = item.checkInDate || now.toISOString().split('T')[0];
      const checkInTime = item.checkInTime || '18:00';
      const checkOutDate = item.checkOutDate || now.toISOString().split('T')[0];

      // SQLite INSERT OR REPLACE
      await client.execute({
        sql: `INSERT INTO reservations (id, reservation_no, platform, guest_name, phone, room_type, room_number, check_in_date, check_in_time, check_out_date, price, status, synced_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(reservation_no) DO UPDATE SET
                status = excluded.status,
                synced_at = excluded.synced_at`,
        args: [
          id,
          reservationNo,
          item.platform || platform,
          item.guestName || '고객',
          item.phone || '010-****-****',
          roomType,
          item.roomNumber || null,
          checkInDate,
          checkInTime,
          checkOutDate,
          price,
          item.status || '대기',
          timeStr,
        ],
      });

      newEntries.push({
        id,
        reservationNo,
        platform: item.platform || platform,
        guestName: item.guestName || '고객',
        phone: item.phone || '010-****-****',
        roomType,
        roomNumber: item.roomNumber,
        checkInDate,
        checkInTime,
        checkOutDate,
        price,
        status: item.status || '대기',
        syncedAt: timeStr,
      });
    }

    return NextResponse.json({
      success: true,
      message: `파이썬 크롤러로부터 [${platform}] 신규 예약 ${newEntries.length}건이 SQLite 데이터베이스(stay.db)에 영구 저장되었습니다.`,
      addedCount: newEntries.length,
      latest: newEntries,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '예약 수신 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
