import { NextResponse } from 'next/server';
import { client, initDatabase } from '@/db';

export async function GET() {
  try {
    await initDatabase();
    const result = await client.execute(
      'SELECT id, username, name, role, phone FROM users ORDER BY id ASC'
    );

    const users = result.rows.map((row) => ({
      id: String(row.id),
      username: String(row.username),
      name: String(row.name),
      role: String(row.role),
      phone: String(row.phone),
    }));

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { error: '사용자 목록 조회 실패: ' + (error?.message || '') },
      { status: 500 }
    );
  }
}
