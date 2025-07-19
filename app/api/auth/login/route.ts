import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // 导入 bcryptjs 用于密码比对

/**
 * 处理 POST 请求，用于用户登录。
 * 接收用户名和密码，验证后设置 HttpOnly 和 Secure Cookie。
 *
 * @param request - 传入的 Request 对象，包含请求体等信息。
 * @returns NextResponse 对象，包含登录结果和设置的 Cookie。
 */
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 检查请求体是否包含用户名和密码
    if (!username || !password) {
      return NextResponse.json({ message: '请输入用户名和密码' }, { status: 400 });
    }

    // 1. 检查环境变量是否配置
    console.log('环境变量检查:', {
      ADMIN_USERNAME: process.env.ADMIN_USERNAME,
      ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH ? '已配置' : '未配置'
    });
    
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH) {
      console.error('管理员凭证未配置');
      return NextResponse.json(
        { message: '系统配置错误，请联系管理员' }, 
        { status: 500 }
      );
    }

    // 2. 验证用户名和解码密码哈希
    if (username !== process.env.ADMIN_USERNAME) {
      return NextResponse.json(
        { message: '用户名或密码错误' }, 
        { status: 401 }
      );
    }
    
    const storedHash = Buffer.from(process.env.ADMIN_PASSWORD_HASH || '', 'base64').toString('utf-8');

    // 3. 比对用户提供的密码和存储的哈希密码
    console.log('密码比对:', {
      inputPassword: password,
      storedHash: storedHash
    });
    
    const isPasswordValid = await bcrypt.compare(password, storedHash);
    console.log('比对结果:', isPasswordValid);

    if (!isPasswordValid) {
      console.error('密码验证失败');
      return NextResponse.json({ message: '用户名或密码错误' }, { status: 401 });
    }

    // 4. 设置 HttpOnly 和 Secure Cookie
    // 使用管理员用户名作为Cookie值
    const cookieValue = process.env.ADMIN_USERNAME as string;

    // 构建 Set-Cookie 头字符串
    // HttpOnly: 防止客户端 JavaScript 访问 Cookie，增强安全性。
    // Secure: 只有在 HTTPS 连接下才发送 Cookie，生产环境必备。
    // SameSite=Strict: 严格限制 Cookie 的跨站发送，有助于防御 CSRF 攻击。
    // Path=/: Cookie 对所有路径都有效。
    // Max-Age: Cookie 的有效期（秒），这里设置为 1 天:24 * 60 * 60。
    const cookieString = `admin-auth=${cookieValue}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${24 * 60 * 60}`;

    // 创建成功响应
    const response = NextResponse.json(
      { message: '登录成功', user: { username: process.env.ADMIN_USERNAME, role: 'admin' } },
      { status: 200 }
    );

    // 在响应头中设置 Cookie
    response.headers.set('Set-Cookie', cookieString);

    return response;

  } catch (error) {
    console.error('Login API error:', error); // 记录详细错误信息
    return NextResponse.json({ message: '登录过程中发生服务器错误' }, { status: 500 });
  }
}
