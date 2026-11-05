import { NextResponse } from 'next/server';
import { client, initDatabase } from '@/db';

export async function POST(request: Request) {
  try {
    await initDatabase();
    const body = await request.json();
    const { username, password, name, role = 'front', phone } = body;

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: '아이디, 비밀번호, 이름은 필수 항목입니다.' },
        { status: 400 }
      );
    }

    const trimmedUser = String(username).trim().toLowerCase();
    const trimmedPass = String(password).trim();
    const trimmedName = String(name).trim();
    const trimmedPhone = String(phone || '').trim();

    if (trimmedUser.length < 3) {
      return NextResponse.json(
        { error: '아이디는 최소 3자리 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    if (trimmedPass.length < 4) {
      return NextResponse.json(
        { error: '비밀번호는 최소 4자리 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 1. 아이디 중복 체크
    const existing = await client.execute({
      sql: 'SELECT id FROM users WHERE username = ?',
      args: [trimmedUser],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: '이미 사용 중인 아이디입니다. 다른 아이디를 선택해주세요.' },
        { status: 409 }
      );
    }

    // 2. 신규 사용자 생성
    const newId = `u-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await client.execute({
      sql: 'INSERT INTO users (id, username, password, name, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
      args: [newId, trimmedUser, trimmedPass, trimmedName, role, trimmedPhone || '010-0000-0000'],
    });

    const newUser = {
      id: newId,
      username: trimmedUser,
      name: trimmedName,
      role: role as 'admin' | 'front' | 'housekeeping',
      phone: trimmedPhone || '010-0000-0000',
    };

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: newUser,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다: ' + (error?.message || '') },
      { status: 500 }
    );
  }
}
