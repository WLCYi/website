'use client';

import React from "react";
import "./local.css";
import Link from "next/link";
import { Particles } from "../components/particles";
import { useState, useRef, useEffect } from "react";
import { getPosts, getStats } from "../utils/db"; // 导入 getStats
import type { Post, Comment, Stats } from "../utils/db"; // 导入 Stats 类型

function 文章详情组件({ post, onBack }: { post: Post, onBack: () => void }) {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [nickname, setNickname] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    // 页面加载时滚动到顶部
    window.scrollTo(0, 0);

    const loadComments = async () => {
      try {
        const response = await fetch('/api/blog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'get-comments', // 此处仍使用 get-comments，因为是获取特定文章评论，需要后端支持
            postId: post.id
          }),
        });
        if (!response.ok) {
          throw new Error('获取评论失败');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('无效的评论数据格式');
        }
        setComments(data);
      } catch (error) {
        console.error('加载评论失败:', error);
      }
    };
    loadComments();
  }, [post.id]);

  const handleSubmitComment = async () => {
    try {
      await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add-comment',
          postId: post.id,
          nickname,
          content: commentContent
        }),
      });
      setNickname('');
      setCommentContent('');
      setShowCommentModal(false);
      // 重新加载评论
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-comments', // 此处仍使用 get-comments，因为是获取特定文章评论，需要后端支持
          postId: post.id
        }),
      });
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('提交评论失败:', error);
    }
  };

  return (
    <div className="div-box">
      <article className="文章块">
        <button className="跳转列表与详情" onClick={onBack}>返回</button>
        <h1 onClick={onBack}>{post.title}</h1>
        <header>
          <img className="图标" src='/iconts/icons-时钟.png'></img>
          <time title={`发布于${post.date}`}>{post.date}</time>
          <div className="文章分类">
            <img className="图标" src='/iconts/icons-书签.png'></img>
            <span>{post.category}</span>
          </div>
          <div className="文章点击数">
            <img className="图标" src='/iconts/icons-点击.png'></img>
            <span>{post.views}</span>
          </div>
          <div className="文章评论数">
            <img className="图标" src='/iconts/icons-评论.png'></img>
            <span>{post.comments}</span>
          </div>
        </header>
        <div className="文章前言">{'前言：' + post.preface}</div>
        <div className="文章内容" dangerouslySetInnerHTML={{ __html: post.content }}></div>
        <div className="文章标签">
          <img className="图标" src='/iconts/icons-标签.png'></img>
          {post.tags.map((tag, index) => (
              <div key={index} className="tag-item">{tag}</div>
            ))}
        </div>

        <div className="评论区域">
          <button
            className="评论按钮"
            onClick={() => setShowCommentModal(true)}
          >
            发表评论
          </button>

          <div className="评论列表">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="评论项">
                  <div className="评论头">
                    <span className="评论昵称">{comment.nickname}：</span>
                    <span className="评论时间">{new Date(comment.date).toLocaleString()}</span>
                  </div>
                  <div className="评论内容">{comment.content}</div>
                </div>
              ))
            ) : (
              <div className="评论项">
                <div className="无评论提示">暂无评论</div>
              </div>

            )}
          </div>
        </div>

        {showCommentModal && (
          <div className="评论弹窗">
            <div className="弹窗内容">
              <h3>发表评论</h3>
              <input
                type="text"
                placeholder="昵称"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <textarea
                placeholder="评论内容"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
              <div className="弹窗按钮">
                <button onClick={handleSubmitComment}>发送</button>
                <button onClick={() => {
                  setNickname('');
                  setCommentContent('');
                  setShowCommentModal(false);
                }}>取消</button>
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

function 内容组件({ posts, onPostSelect }: { posts: Post[], onPostSelect: (id: number) => void }) {
  if (posts.length === 0) {
    return (
      <div className="div-box">
        <div className="empty-posts">暂无已发布的文章</div>
      </div>
    );
  }

  const sortedPosts = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return (
    <div className="div-box">
      {sortedPosts.map(post => (
        <article key={`blog-${post.id}`} className="文章块">
          <button className="跳转列表与详情" onClick={() => onPostSelect(post.id)}>详情</button>
          <h1 onClick={() => onPostSelect(post.id)}>{post.title}</h1>
          <header>
            <img className="图标" src='/iconts/icons-时钟.png'></img>
            <time title={`发布于${post.date}`}>
              {post.date}
            </time>
            <div className="文章分类">
              <img className="图标" src='/iconts/icons-书签.png'></img>
              <span>{post.category}</span>
            </div>
            <div className="文章点击数">
              <img className="图标" src='/iconts/icons-点击.png'></img>
              <span>{post.views}</span>
            </div>
            <div className="文章评论数">
              <img className="图标" src='/iconts/icons-评论.png'></img>
              <span>{post.comments}</span>
            </div>
          </header>
          <div className="文章前言">{'前言：' + post.preface}</div>
          <div className="文章标签">
            <img className="图标" src='/iconts/icons-标签.png'></img>
            {post.tags.map((tag, index) => (
              <div key={index} className="tag-item">{tag}</div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function BlogPage() {
  type ContentType = 'latest' | 'embedded' | 'fullstack' | 'daily' | 'detail' | 'search';
  const [activeContent, setActiveContent] = useState<ContentType>('latest');
  const [posts, setPosts] = useState<Post[]>([]);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [stats, setStats] = useState<Stats | null>(null); // 新增 stats 状态
  const [todayBlogViews, setTodayBlogViews] = useState<number | null>(null); // 新增今日博客访问量状态


  useEffect(() => {
    const loadData = async () => { // 修改函数名为 loadData 以便加载所有数据
      try {
        const postsData = await getPosts();
        setPosts(postsData.filter(post => post.published));

        const statsData = await getStats(); // 加载统计数据
        setStats(statsData);

        const todayBlogResponse = await fetch('/api/blog', { // 获取今日博客访问量
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'getTodayBlogViews'
          })
        });
        const todayBlogJson = await todayBlogResponse.json();
        setTodayBlogViews(todayBlogJson.views);

      } catch (error) {
        console.error('加载数据失败:', error);
      }
    };

    const updateButtonWidths = () => {
      buttonRefs.current.forEach((button, index) => {
        if (button) {
          const box = document.querySelectorAll('.博客分类-box')[index] as HTMLElement;
          if (box) {
            box.style.width = `${button.offsetWidth}px`;
            box.style.minWidth = `${button.offsetWidth}px`;
            box.style.maxWidth = `${button.offsetWidth}px`;
          }
        }
      });
    };

    // 文件监听策略
    let lastModified = 0;
    let cleanupWatcher: ReturnType<typeof setInterval> | null = null;

    // 轮询方案
    function setupPolling() {
      const pollInterval = 3600000; // 60分钟

      const checkForUpdates = async () => {
        try {
          const res = await fetch('/api/blog?t=' + Date.now(), {
            headers: { 'Cache-Control': 'no-cache' }
          });
          const lastMod = new Date(res.headers.get('Last-Modified') || 0).getTime();

          if (lastMod > lastModified) {
            console.log('(轮询)检测到文件变化，刷新数据...');
            lastModified = lastMod;
            loadData().then(updateButtonWidths); // 刷新数据时也加载统计
          }
        } catch (err) {
          console.error('检查更新失败:', err);
        }
      };

      checkForUpdates();
      return setInterval(checkForUpdates, pollInterval);
    }

    // 初始化轮询
    cleanupWatcher = setupPolling();

    // 初始加载
    loadData().then(updateButtonWidths); // 初始加载时也加载统计

    // 监听窗口变化
    const resizeObserver = new ResizeObserver(updateButtonWidths);
    buttonRefs.current.forEach(button => {
      if (button) resizeObserver.observe(button);
    });

    return () => {
      if (cleanupWatcher) {
        clearInterval(cleanupWatcher);
      }
      resizeObserver.disconnect();
    };
  }, []);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);

  const handlePostSelect = async (id: number) => {
    try {
      // 合并所有更新请求为一个Promise.all
      const [updateRes, postsData, statsData, todayBlogJson] = await Promise.all([
        // 更新文章点击统计
        fetch('/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'increment-article-views', id })
        }),
        // 获取文章数据
        getPosts(),
        // 获取统计数据
        getStats(),
        // 获取今日访问量
        fetch('/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getTodayBlogViews' })
        }).then(res => res.json())
      ]);

      // 更新状态
      setPosts(postsData.filter(post => post.published));
      setStats(statsData);
      setTodayBlogViews(todayBlogJson.views);
      setSelectedPost(postsData.find(p => p.id === id) || null);
      setActiveContent('detail');
    } catch (error) {
      console.error('更新views失败:', error);
      setSelectedPost(posts.find(p => p.id === id) || null);
      setActiveContent('detail');
    }
  };

  const handleBackToList = () => {
    setSelectedPost(null);
    setActiveContent('latest');
  };

  const contentMap: Record<ContentType | 'detail', React.ReactNode> = {
    latest: <内容组件 posts={posts} onPostSelect={handlePostSelect} />,
    daily: <内容组件 posts={posts.filter(p => p.category === '日常')} onPostSelect={handlePostSelect} />,
    embedded: <内容组件 posts={posts.filter(p => p.category === '嵌入式')} onPostSelect={handlePostSelect} />,
    fullstack: <内容组件 posts={posts.filter(p => p.category === '前后端')} onPostSelect={handlePostSelect} />,
    detail: selectedPost ? <文章详情组件 post={selectedPost} onBack={handleBackToList} /> : null,
    search: searchResults.length === 0 ? (
      <div className="div-box">
        <div className="empty-posts">暂无搜索结果</div>
      </div>
    ) : (
      <内容组件 posts={searchResults} onPostSelect={handlePostSelect} />
    )
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    const results = posts.filter(post => 
      post.title.toLowerCase().includes(term) || 
      post.preface.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term) ||
      post.tags.some(tag => tag.toLowerCase().includes(term))
    );
    setSearchResults(results);
    setActiveContent('search');
  };

  return (
    <main>
      <Particles />
      <div className="博客侧边区">
        <div className="头像-img"><img src="/img/sfq1.png" alt="" /></div>
        <div className="昵称"><Link href='/auth/login'>无洛尘依</Link></div>
        <div className="个人简介">
          <div className="个人简介-text">爱拼才会赢!</div>
        </div>
        <div className="博客统计">
          <p>博客统计</p>
          <div className="今日访问">今日访问：{todayBlogViews?.toLocaleString() ?? '加载中...'}&nbsp;次</div>
          <div className="总访问量">总访问量：{stats?.totalBlogViews?.toLocaleString() ?? '加载中...'}&nbsp;次</div>
        </div>
        <div className="博客分类">
          <ul>
            <li>
              <button
                ref={el => { buttonRefs.current[0] = el; }}
                onClick={() => {
                  setActiveContent('latest');
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className={activeContent === 'latest' ? 'active' : ''}
              >最新</button>
            </li>
            <div className="博客分类-box"></div>
            <li>
              <button
                ref={el => { buttonRefs.current[1] = el; }}
                onClick={() => {
                  setActiveContent('daily');
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className={activeContent === 'daily' ? 'active' : ''}
              >日常</button>
            </li>
            <div className="博客分类-box"></div>
            <li>
              <button
                ref={el => { buttonRefs.current[2] = el; }}
                onClick={() => {
                  setActiveContent('embedded');
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className={activeContent === 'embedded' ? 'active' : ''}
              >嵌入式</button>
            </li>
            <div className="博客分类-box"></div>
            <li>
              <button
                ref={el => { buttonRefs.current[3] = el; }}
                onClick={() => {
                  setActiveContent('fullstack');
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className={activeContent === 'fullstack' ? 'active' : ''}
              >前后端</button>
            </li>
            <div className="博客分类-box"></div>
          </ul>
        </div>
        <div className="搜索栏">
          <input 
            type="text" 
            className="搜索框" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <div className="搜索图标" onClick={handleSearch}>
            <img src="/iconts/icons-搜索.png" alt="" />
          </div>
        </div>
      </div>
      {contentMap[activeContent]}
    </main>
  );
}
