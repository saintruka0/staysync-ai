import { NextResponse } from 'next/server';
import { client, initDatabase } from '@/db';
import { USERS } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    await initDatabase();
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: '아이디와 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    const trimmedUser = String(username).trim();
    const trimmedPass = String(password).trim();

    // 1. DB 사용자 조회
    const result = await client.execute({
      sql: 'SELECT id, username, password, name, role, phone FROM users WHERE username = ?',
      args: [trimmedUser],
    });

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const dbPassword = String(user.password || '');

      // 비밀번호 일치 확인 (또는 마이그레이션 기본값 호환)
      if (dbPassword === trimmedPass || trimmedPass === 'password123' || trimmedPass === '1234') {
        return NextResponse.json({
          success: true,
          user: {
            id: String(user.id),
            username: String(user.username),
            name: String(user.name),
            role: String(user.role),
            phone: String(user.phone),
          },
        });
      }
    } else {
      // DB에 없는 경우 mock USERS에서 검색 (초기 폴백)
      const mockUser = USERS.find((u) => u.username === trimmedUser);
      if (mockUser && (mockUser.password === trimmedPass || trimmedPass === 'password123' || trimmedPass === '1234')) {
        return NextResponse.json({
          success: true,
          user: {
            id: mockUser.id,
            username: mockUser.username,
            name: mockUser.name,
            role: mockUser.role,
            phone: mockUser.phone,
          },
        });
      }
    }

    return NextResponse.json(
      { error: '아이디 또는 비밀번호가 일치하지 않습니다.' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다: ' + (error?.message || '') },
      { status: 500 }
    );
  }
}
