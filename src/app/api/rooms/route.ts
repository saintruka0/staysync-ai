import { NextResponse } from 'next/server';
import { client, initDatabase } from '@/db';
import { Room } from '@/types/motel';

export async function GET() {
  await initDatabase();
  const res = await client.execute('SELECT * FROM rooms ORDER BY number ASC');

  const rooms: Room[] = res.rows.map((row: any) => ({
    id: row.id,
    number: row.number,
    floor: Number(row.floor),
    type: row.type,
    status: row.status,
    guestName: row.guest_name || undefined,
    phone: row.phone || undefined,
    platform: row.platform || undefined,
    checkIn: row.check_in || undefined,
    checkOut: row.check_out || undefined,
    cleanerName: row.cleaner_name || undefined,
    inspection: row.inspection_json ? JSON.parse(row.inspection_json) : undefined,
    notes: row.notes_json ? JSON.parse(row.notes_json) : [],
    wifiPassword: row.wifi_password,
  }));

  return NextResponse.json(rooms);
}

export async function PATCH(req: Request) {
  await initDatabase();
  const body = await req.json();
  const { number, status, cleanerName, guestName, phone, platform, checkIn, checkOut, notes, inspection } = body;

  if (!number) {
    return NextResponse.json({ error: 'room number required' }, { status: 400 });
  }

  // 업데이트 쿼리 구성
  let updates = [];
  let args = [];

  if (status !== undefined) {
    updates.push('status = ?');
    args.push(status);
    if (status === 'available') {
      updates.push('guest_name = NULL, phone = NULL, platform = NULL');
    }
  }

  if (cleanerName !== undefined) {
    updates.push('cleaner_name = ?');
    args.push(cleanerName);
  }

  if (guestName !== undefined) {
    updates.push('guest_name = ?');
    args.push(guestName);
  }

  if (phone !== undefined) {
    updates.push('phone = ?');
    args.push(phone);
  }

  if (platform !== undefined) {
    updates.push('platform = ?');
    args.push(platform);
  }

  if (checkIn !== undefined) {
    updates.push('check_in = ?');
    args.push(checkIn);
  }

  if (checkOut !== undefined) {
    updates.push('check_out = ?');
    args.push(checkOut);
  }

  if (notes !== undefined) {
    updates.push('notes_json = ?');
    args.push(JSON.stringify(notes));
  }

  if (inspection !== undefined) {
    updates.push('inspection_json = ?');
    args.push(JSON.stringify(inspection));
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  args.push(number);

  const query = `UPDATE rooms SET ${updates.join(', ')} WHERE number = ?`;
  await client.execute({ sql: query, args });

  return NextResponse.json({ success: true, updatedNumber: number });
}
