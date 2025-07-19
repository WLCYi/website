'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getStats, getPosts } from '../../utils/db';
import type { Stats, Post } from '../../utils/db';
import './local.css';

// 自定义确认模态框组件
function ConfirmationModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>确认操作</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onCancel}>取消</button>
          <button className="save-btn" onClick={onConfirm}>确定</button>
        </div>
      </div>
    </div>
  );
}

// 自定义提示框组件
function AlertDialog({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>提示</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
}


function formatLocalDateTime(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function 文章管理() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('全部');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // 提示/确认框状态
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; message: string; onConfirm: () => void } | null>(null);
  const [alertDialog, setAlertDialog] = useState<{ show: boolean; message: string } | null>(null);

  // 显示提示框
  const showAlert = (message: string) => {
    setAlertDialog({ show: true, message });
  };

  // 显示确认框
  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmModal({ show: true, message, onConfirm });
  };


  // 处理文章发布/取消发布
  const handlePublish = async (id: number, publish: boolean) => {
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'publish',
          id,
          publish
        })
      });

      if (response.ok) {
        const data = await getPosts();
        setPosts(data);
        setFilteredPosts(data);
        showAlert(publish ? '文章已发布' : '文章已取消发布');
      } else {
        showAlert('操作失败，请重试');
      }
    } catch (error) {
      console.error('操作失败:', error);
      showAlert('操作失败，请检查网络连接');
    }
  };

  // 处理文章编辑
  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setShowModal(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPost(null);
  };

  // 处理文章删除
  const handleDelete = async (id: number) => {
    showConfirm('确定要删除这篇文章吗？', async () => {
      setConfirmModal(null); // 关闭确认模态框
      try {
        const response = await fetch('/api/blog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'delete',
            id
          })
        });

        if (response.ok) {
          const data = await getPosts();
          setPosts(data);
          setFilteredPosts(data);
          showAlert('文章已删除');
        } else {
          showAlert('删除失败，请重试');
        }
      } catch (error) {
        console.error('删除失败:', error);
        showAlert('删除失败，请检查网络连接');
      }
    });
  };

  // 组件挂载时加载文章
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const data = await getPosts();
        setPosts(data);
        setFilteredPosts(data);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  // 处理分类筛选
  const handleCategoryFilter = (category: string) => {
    setCurrentCategory(category);
    if (category === '全部') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.category === category));
    }
  };

  // 新建文章
  const handleNewPost = () => {
    setShowModal(true);
  };

  return (
    <div className="posts-management">
      <div className="post-categories">
        <button onClick={() => handleCategoryFilter('全部')}>全部</button>
        <button onClick={() => handleCategoryFilter('日常')}>日常</button>
        <button onClick={() => handleCategoryFilter('嵌入式')}>嵌入式</button>
        <button onClick={() => handleCategoryFilter('前后端')}>前后端</button>
        <button onClick={handleNewPost} className="new-post-btn">
          新建文章
        </button>
      </div>

      <div className="post-list">
        {[...filteredPosts].sort((a, b) => {
          // 将日期字符串转换为Date对象进行比较
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }).map(post => (
          <div key={post.id} className="post-item">
            <div className="post-info">
              <span className="post-date">{post.date}</span>
              <span className="post-title">{post.title}</span>
              <div className="post-tags">
                {post.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
            <div className="post-actions">
              {post.published ? (
                <button className="unpublish-btn" onClick={() => handlePublish(post.id, false)}>取消发布</button>
              ) : (
                <button className="publish-btn" onClick={() => handlePublish(post.id, true)}>发布</button>
              )}
              <button onClick={() => handleEdit(post)}>编辑</button>
              <button onClick={() => handleDelete(post.id)}>删除</button>
            </div>
          </div>
        ))}
      </div>

      {(showModal || editingPost) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingPost ? '编辑文章' : '新建文章'}</h3>
            <div className="modal-row">
              <input
                type="text"
                placeholder="文章标题"
                defaultValue={editingPost?.title || ''}
              />
            </div>
            <div className="modal-row">
              <select defaultValue={editingPost?.category || '日常'}>
                <option value="日常">日常</option>
                <option value="嵌入式">嵌入式</option>
                <option value="前后端">前后端</option>
              </select>
              <div className='date'>发布时间：{editingPost?.date || formatLocalDateTime()}</div>
            </div>
            <div className="modal-row">
              <input
                type="text"
                placeholder="文章前言"
                defaultValue={editingPost?.preface || ''}
              />
            </div>
            <div className="modal-row">
              <div className="editor-container">
                <div
                  className="editor-content"
                  contentEditable
                  dangerouslySetInnerHTML={editingPost ? { __html: editingPost.content } : undefined}
                  data-placeholder="文章内容"
                  style={{
                    minHeight: '200px',
                    border: '1px solid #ddd',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    marginTop: '0.5rem'
                  }}
                ></div>
              </div>
            </div>
            <div className="modal-row">
              <input
                type="text"
                placeholder="添加标签，用英文逗号分隔"
                defaultValue={editingPost?.tags.join(', ') || ''}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleCloseModal}>取消</button>
              <button className="save-btn" onClick={async () => {
                const titleInput = document.querySelector('.modal-row input') as HTMLInputElement;
                const prefaceInput = document.querySelectorAll('.modal-row input[type="text"]')[1] as HTMLInputElement;
                const selectElement = document.querySelector('.modal-row select') as HTMLSelectElement;
                const editorContent = document.querySelector('.editor-content') as HTMLElement;
                const tagsInput = document.querySelectorAll('.modal-row input[type="text"]')[2] as HTMLInputElement;

                const postData = {
                  id: editingPost?.id || Date.now(),
                  title: titleInput.value,
                  preface: prefaceInput.value,
                  content: editorContent.innerHTML,
                  date: editingPost?.date || formatLocalDateTime(),
                  category: selectElement.value,
                  views: editingPost?.views || 0,
                  comments: editingPost?.comments || 0,
                  tags: tagsInput.value.split(',').map(tag => tag.trim()),
                  published: editingPost?.published || false
                };

                try {
                  const response = await fetch('/api/blog', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      action: editingPost ? 'update' : 'create',
                      post: postData
                    })
                  });

                  if (response.ok) {
                    const data = await getPosts();
                    setPosts(data);
                    setFilteredPosts(data);
                    handleCloseModal();
                    showAlert(editingPost ? '文章已更新' : '文章已创建');
                  } else {
                    showAlert('保存失败，请重试');
                  }
                } catch (error) {
                  console.error('保存文章失败:', error);
                  showAlert('保存失败，请检查网络连接');
                }
              }}>{editingPost ? '更新' : '保存'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmModal && <ConfirmationModal message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
      {alertDialog && <AlertDialog message={alertDialog.message} onClose={() => setAlertDialog(null)} />}
    </div>
  );
}

function 数据统计() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayViews, setTodayViews] = useState<number | null>(null);
  const [todayArticleViews, setTodayArticleViews] = useState<number | null>(null);
  const [todayArticleComments, setTodayArticleComments] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // 统计部分的提示/确认框状态
  const [confirmModalStats, setConfirmModalStats] = useState<{ show: boolean; message: string; onConfirm: () => void } | null>(null);
  const [alertDialogStats, setAlertDialogStats] = useState<{ show: boolean; message: string } | null>(null);

  // 显示统计部分的提示框
  const showAlertStats = (message: string) => {
    setAlertDialogStats({ show: true, message });
  };

  // 显示统计部分的确认框
  const showConfirmStats = (message: string, onConfirm: () => void) => {
    setConfirmModalStats({ show: true, message, onConfirm });
  };


  // 加载统计数据
  const loadStats = async () => {
    try {
      setLoading(true);
      const [statsData, todayBlogData, todayArticleData, todayCommentsData] = await Promise.all([
        getStats(),
        fetch('/api/blog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'getTodayBlogViews'
          })
        }).then(res => res.json()),
        fetch('/api/blog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'getTodayArticleViews'
          })
        }).then(res => res.json()),
        fetch('/api/blog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'getTodayArticleComments'
          })
        }).then(res => res.json())
      ]);

      setStats(statsData);
      setTodayViews(todayBlogData.views);
      setTodayArticleViews(todayArticleData.views);
      setTodayArticleComments(todayCommentsData.count);
    } catch (error) {
      console.error('加载统计数据失败:', error);
      showAlertStats('加载统计数据失败。');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载统计数据
  useEffect(() => {
    loadStats();
  }, []);

  // 处理清除数据操作
  const handleClearData = async (actionType: string, confirmMessage: string, successMessage: string) => {
    showConfirmStats(confirmMessage, async () => {
      setConfirmModalStats(null); // 关闭确认模态框
      try {
        const response = await fetch('/api/blog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: actionType
          })
        });

        if (response.ok) {
          showAlertStats(successMessage);
          loadStats(); // 清除成功后重新加载统计数据
        } else {
          showAlertStats('清除失败，请重试。');
        }
      } catch (error) {
        console.error(`清除 ${actionType} 失败:`, error);
        showAlertStats('清除失败，请检查网络连接。');
      }
    });
  };

  return (
    <div className="stats">
      <div className="stat-cards">
        <div className="stat-card">
          <h4>博客总访问量</h4>
          <p>{stats?.totalBlogViews?.toLocaleString() ?? '加载中...'}</p>
        </div>
        <div className="stat-card">
          <h4>文章总点击量</h4>
          <p>{stats?.totalArticleViews?.toLocaleString() ?? '加载中...'}</p>
        </div>
        <div className="stat-card">
          <h4>文章总评论量</h4>
          <p>{stats?.totalComments?.toLocaleString() ?? '加载中...'}</p>
        </div>
        <div className="stat-card">
          <h4>今日博客访问</h4>
          <p>{todayViews?.toLocaleString() ?? '加载中...'}</p>
        </div>
        <div className="stat-card">
          <h4>今日文章点击</h4>
          <p>{todayArticleViews?.toLocaleString() ?? '加载中...'}</p>
        </div>
        <div className="stat-card">
          <h4>今日文章评论</h4>
          <p>{todayArticleComments?.toLocaleString() ?? '加载中...'}</p>
        </div>
      </div>
      <div className="stat-cards">
        <div
          className="stat-card clear-button"
          onClick={() => handleClearData('clear-blog-views', '确定要清除所有博客访问数据吗？此操作不可撤销！', '所有博客访问数据已清除。')}
        >
          <h4>清除博客所有访问数据</h4>
        </div>
        <div
          className="stat-card clear-button"
          onClick={() => handleClearData('clear-article-views', '确定要清除所有文章点击数据吗？此操作不可撤销！', '所有文章点击数据已清除。')}
        >
          <h4>清除所有文章点击数据</h4>
        </div>
        <div
          className="stat-card clear-button"
          onClick={() => handleClearData('clear-comments', '确定要清除所有文章评论数据吗？此操作不可撤销！', '所有文章评论数据已清除。')}
        >
          <h4>清除所有文章评论数据</h4>
        </div>
      </div>

      {confirmModalStats && <ConfirmationModal message={confirmModalStats.message} onConfirm={confirmModalStats.onConfirm} onCancel={() => setConfirmModalStats(null)} />}
      {alertDialogStats && <AlertDialog message={alertDialogStats.message} onClose={() => setAlertDialogStats(null)} />}
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'stats'>('posts');

  return (
    <div className="dashboard-container">
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'posts' ? 'active' : ''}
          onClick={() => setActiveTab('posts')}
        >
          文章管理
        </button>
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          数据统计
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'posts' && <文章管理 />}
        {activeTab === 'stats' && <数据统计 />}
      </div>
    </div>
  );
}
