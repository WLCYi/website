/**
 * 粒子效果组件
 * 在页面上创建随机移动的粒子背景效果
 * 使用CSS动画实现粒子运动
 */
'use client';

import { useEffect, useState } from 'react';

export function Particles() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 初始化粒子效果
  useEffect(() => {
    if (!isClient) return;

    const container = document.getElementById('particles-js');
    if (!container) return;

    // 粒子数量配置
    const particleCount = 50;
    const particles: HTMLElement[] = [];
    
    // 创建并配置每个粒子
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // 随机粒子大小 (5-15px)
      const size = Math.random() * 10 + 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // 随机初始位置
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.top = `${Math.random() * 100}vh`;
      
      // 随机动画持续时间 (10-30秒)
      const duration = Math.random() * 20 + 10;
      particle.style.animationDuration = `${duration}s`;
      
      container.appendChild(particle);
      particles.push(particle);
    }

    // 清理函数 - 组件卸载时移除所有粒子
    return () => {
      particles.forEach(p => p.remove());
    };
  }, [isClient]);

  return <div className="particles" id="particles-js"></div>;
}
