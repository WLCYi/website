'use client';
import "./globals.css";
import { Particles } from "./components/particles";

/**
 * 主页组件
 */

function 手风琴内容组件() {
  return (
    <div className="button-page">
      {['博客', '音乐', '绘画', '摄影', '小说'].map((item, index) => (
        <div key={item} className="box">
          <img src={`/img/sfq${index+1}.${index === 1 || index === 4 ? 'jpg' : 'png'}`} 
               alt={item} 
               suppressHydrationWarning />
          <span suppressHydrationWarning>{item}</span>
        </div>
      ))}
    </div>
  );
}

function 层叠内容组件() {
  return (
    <div className="sibling-page">
      <h2>层叠内容区</h2>
      <p>可以在这里添加任何内容作为补充</p>
    </div>
  );
}

import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    const nav1 = document.querySelectorAll(".nav1 li");
    function activeLink(this: HTMLLIElement){
      nav1.forEach((item)=>item.classList.remove("active"));
      this.classList.add("active");
    }
    nav1.forEach((item)=>item.addEventListener("click",activeLink));
    
    return () => {
      nav1.forEach((item)=>item.removeEventListener("click",activeLink));
    };
  }, []);

  return (
    <>
      <Particles />
      <div className="main-container">
        <手风琴内容组件 />
        <层叠内容组件 />
      </div>
    </>
  );
}
