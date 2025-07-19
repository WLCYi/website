'use client'; 

import { ReactNode } from 'react'; 
import Link from 'next/link';
import './admin.css';

export default function AdminLayout({ children }: { children: ReactNode }) {

  return (
    <div className="admin-container">
      <nav className="admin-sidebar">
        <div className="admin-header">
          <h2>管理后台</h2>
        </div>
        <ul className="admin-menu">
          <li>
            <Link href="/admin/dashboard">仪表盘</Link>
          </li>
          <li>
            <Link href="/admin/BlogBackend">博客管理</Link>
          </li>
          <li>
            <Link href="#">音乐管理</Link>
          </li>
          <li>
            <Link href="#">摄影管理</Link>
          </li>
          <li>
            <Link href="#">绘画管理</Link>
          </li>
          <li>
            <Link href="#">小说管理</Link>
          </li>
        </ul>
        <div className="user-info">
          <span>管理员</span>
          <Link href="/auth/login" onClick={() => document.cookie = 'admin-auth=; max-age=0; path=/'}>退出登录</Link>
        </div>
      </nav>
      <div className="admin-content">
        <main>{children}</main>
      </div>
    </div>
  );
}