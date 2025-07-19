'use client';

import Link from "next/link";
import "./globals.css";
import Head from 'next/head';
import { Particles } from "./components/particles";
import { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: '博客', path: '/blog' },
  { name: '音乐', path: '/music' },
  { name: '摄影', path: '/photography' },
  { name: '绘画', path: '/drawing' },
  { name: '小说', path: '/novel' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const slide1Ref = useRef<HTMLLIElement>(null);
  const slide2Ref = useRef<HTMLLIElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleHover = (target: HTMLElement) => {
    if (!slide1Ref.current || !slide2Ref.current) return;

    const li = target.parentElement;
    if (!li) return;

    const nav = li.closest('ul');
    if (!nav) return;

    const navRect = nav.getBoundingClientRect();
    const liRect = li.getBoundingClientRect();
    const width = liRect.width;
    const left = liRect.left - navRect.left;

    slide2Ref.current.style.opacity = '1';
    slide2Ref.current.style.left = `${left}px`;
    slide2Ref.current.style.width = `${width}px`;
    setIsHovering(true);
  };

  const handleLeave = () => {
    if (slide2Ref.current) {
      slide2Ref.current.style.opacity = '0';
    }
    setIsHovering(false);
  };

  const handleClick = (target: HTMLElement) => {
    if (!slide1Ref.current) return;

    const li = target.parentElement;
    if (!li) return;

    const nav = li.closest('ul');
    if (!nav) return;

    const navRect = nav.getBoundingClientRect();
    const liRect = li.getBoundingClientRect();
    const width = liRect.width;
    const left = liRect.left - navRect.left;

    if (slide1Ref.current) {
      slide1Ref.current.style.opacity = '1';
      slide1Ref.current.style.left = `${left}px`;
      slide1Ref.current.style.width = `${width}px`;
      slide1Ref.current.classList.add('squeeze');

      setTimeout(() => {
        if (slide1Ref.current) {
          slide1Ref.current.classList.remove('squeeze');
        }
      }, 600);
    }
  };

  return (
    <html lang="en">
      <head>
        <title>个人导航站</title>
        <meta name="description" content="天依蓝主题的个人导航网站" charSet="utf-8" />
      </head>
      <body className="antialiased min-h-screen bg-gradient-to-b from-[var(--tianyi-blue)] to-white">
        <Particles />
        {!pathname?.startsWith('/admin') && (
          <nav className="bg-[var(--tianyi-blue)] text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
              <button className="text-2xl font-bold 标题按钮">
                <Link 
                  href='/' 
                  onClick={() => {
                    if (slide1Ref.current) {
                      slide1Ref.current.style.opacity = '0';
                    }
                  }}
                >
                  天依的小屋
                </Link>
                <span></span>
              </button>
              
              <div className="flex space-x-4 text-sm 跟踪导航栏">
                <ul className="relative flex">
                  <li
                    ref={slide1Ref}
                    className="absolute h-10 bg-[rgb(170,190,255)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1.05)] opacity-0"
                  />
                  <li
                    ref={slide2Ref}
                    className="absolute h-10 bg-[rgba(170,190,255,0.5)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1.05)] opacity-0 shadow-[inset_0_0_20px_#ffffffaa]"
                  />
                  {navItems.map((item) => (
                    <li key={item.name} className="relative">
                      <Link
                        href={item.path}
                        className="block px-8 py-2 text-lg text-[rgb(70,100,180)] hover:text-[var(--tianyi-blue-light)]"
                        onMouseEnter={(e) => handleHover(e.currentTarget)}
                        onMouseLeave={handleLeave}
                        onClick={(e) => {
                          handleClick(e.currentTarget);
                          if (item.path === '/blog') {
                            // 记录博客访问
                            fetch('/api/blog', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                action: 'increment-blog-views'
                              }),
                            });
                          }
                        }}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
        )}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
