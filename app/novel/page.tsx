'use client';

import React from "react";
import "./local.css";
import { useState } from "react";

function 最新内容组件() {
  return (
    <div className="div-box">
      最新内容
    </div>
  );
}

function 科幻内容组件() {
  return (
    <div className="div-box">
      科幻内容
    </div>
  );
}

function 修仙内容组件() {
  return (
    <div className="div-box">
      修仙内容
    </div>
  );
}

function 都市内容组件() {
  return (
    <div className="div-box">
      都市内容
    </div>
  );
}

function 玄幻内容组件() {
  return (
    <div className="div-box">
      玄幻内容
    </div>
  );
}

function 恐怖内容组件() {
  return (
    <div className="div-box">
      恐怖内容
    </div>
  );
}

export default function BlogPage() {
  type ContentType = 'latest' | 'SciFi' | 'Xiuxian' | 'urban' | 'Xuanhuan' | 'horror' ;
  const [activeContent, setActiveContent] = useState<ContentType>('latest');

  const contentMap: Record<ContentType, React.ReactNode> = {
    latest:   <最新内容组件 />,
    SciFi:    <科幻内容组件 />,
    Xiuxian:  <修仙内容组件 />,
    urban:    <都市内容组件 />,
    Xuanhuan: <玄幻内容组件 />,
    horror:   <恐怖内容组件 />
  };


  return (
    <main>
    {contentMap[activeContent]}
     <div className="小说底边区">
        <div className="小说底边导航栏">
          <ul>
            <li>
              <button onClick={() => setActiveContent('latest')}>最新</button>
            </li>
            <li>
              <button onClick={() => setActiveContent('SciFi')}>科幻</button>
            </li>
            <li>
              <button onClick={() => setActiveContent('Xiuxian')}>修仙</button>
            </li>
            <li>
              <button onClick={() => setActiveContent('urban')}>都市</button>
            </li>
            <li>
              <button onClick={() => setActiveContent('Xuanhuan')}>玄幻</button>
            </li>
            <li>
              <button onClick={() => setActiveContent('horror')}>恐怖</button>
            </li>
            <div className="小说底边导航栏-box"></div>
          </ul>
        </div>
      </div>
    </main>
  );
}
