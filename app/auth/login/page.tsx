// app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import './login.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // 清除之前的错误信息

    try {
      // 向服务器端登录 API 发送请求
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) { // 如果响应状态码是 2xx (成功)
        // 登录成功，服务器已设置 HttpOnly Cookie
        // 客户端不需要再操作 document.cookie
        // 根据服务器返回的用户角色进行重定向
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          // 理论上这个错误应该在服务器端就被拦截，但为了健壮性保留客户端显示
          setError('权限不足，请联系管理员');
        }
      } else {
        // 登录失败，显示服务器返回的错误信息
        setError(data.message || '用户名或密码错误');
      }
    } catch (err) {
      console.error('登录请求失败:', err);
      setError('网络或服务器错误，请稍后重试');
    }
  };

  return (
    <div className="login-container">
      <h1>后台管理系统</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit">登录</button>
      </form>
      <div className="back-link">
        <Link href="/blog">返回</Link>
      </div>
    </div>
  );
}
