// 定义文章类型
export type Post = {
  id: number;          // 文章唯一标识
  title: string;       // 文章标题
  preface: string;     // 文章前言
  content: string;     // 文章正文内容
  date: string;        // 发布日期 (格式: YYYY-MM-DD HH:mm:ss)
  category: string;    // 文章分类
  views: number;       // 浏览次数
  comments: number;    // 评论数量
  tags: string[];      // 文章标签数组
  published: boolean;  // 是否已发布
};

// 定义分类类型
type Category = {
  id: number;     // 分类ID
  name: string;   // 分类名称
  slug: string;   // 分类URL友好名称
};

// 定义博客总统计数据类型
export type Stats = {
  totalBlogViews: number;    // 博客总访问量
  totalArticleViews: number; // 文章总点击量
  totalComments: number;     // 文章总评论量
};

// 定义每日博客访问量类型
export type DailyBlogView = {
  date: string;   // 日期 (格式: YYYY-MM-DD)
  views: number;  // 当日博客访问量
};

// 定义每日文章点击类型
export type DailyArticleView = {
  date: string;   // 日期 (格式: YYYY-MM-DD)
  postId: number; // 文章ID
  views: number;  // 当日文章点击量
};

// 定义每日文章评论类型
export type Comment = {
  id: number;         // 评论ID
  postId: number;     // 所属文章ID
  nickname: string;   // 评论者昵称
  content: string;    // 评论内容
  date: string;       // 评论日期 (格式: YYYY-MM-DD HH:mm:ss)
};

// 定义用户类型
export type User = {
  id: number;         // 用户ID
  username: string;   // 用户名
  role: 'admin' | 'user'; // 用户角色
  createdAt: string;  // 创建时间 (格式: YYYY-MM-DD HH:mm:ss)
};

// 定义博客数据库结构类型
type BlogDB = {
  posts: Post[];                          // 文章列表
  categories: Category[];                 // 分类列表
  stats: Stats;                           // 统计数据
  dailyBlogViews: DailyBlogView[];        // 每日博客访问记录
  dailyArticleViews: DailyArticleView[];  // 每日文章点击记录
  comments: Comment[];                    // 每日文章评论记录
  users: User[];                          // 用户列表
};

// 将用户数据直接定义在这里，而不是从 fetchDB 中获取
// 用户认证改为API调用
async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return await response.json();
  } catch (error) {
    console.error('认证失败:', error);
    return null;
  }
}
    

// 从API获取博客数据的异步函数
async function fetchDB(): Promise<BlogDB> {
  const res = await fetch('/api/blog');  // 发起API请求
  if (!res.ok) {
    throw new Error('Failed to fetch blog data');  // 请求失败时抛出错误
  }
  return res.json();  // 返回解析后的JSON数据
}

// 根据用户名获取用户的异步函数，通过API调用
export async function getUserByUsername(username: string): Promise<User | undefined> {
  try {
    const response = await fetch('/api/auth/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    return await response.json();
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return undefined;
  }
}


// 导出读取数据库的函数
export async function readDB(): Promise<BlogDB> {
  return fetchDB();  // 调用fetchDB并返回结果
}

// 获取所有文章的异步函数
export async function getPosts(): Promise<Post[]> {
  const db = await readDB();  // 读取数据库
  return db.posts;            // 直接返回文章列表(已包含views数据)
}

// 根据ID获取特定文章的异步函数
export async function getPostById(id: number): Promise<Post | undefined> {
  const db = await readDB();  // 读取数据库
  return db.posts.find(post => post.id === id);  // 查找匹配ID的文章
}

// 获取所有分类的异步函数
export async function getCategories(): Promise<Category[]> {
  const db = await readDB();  // 读取数据库
  return db.categories;       // 返回分类列表
}

// 获取所有评论的异步函数
export async function getComments(): Promise<Comment[]> {
  const db = await readDB();  // 读取数据库
  return db.comments;         // 返回评论列表
}

// 获取统计数据的异步函数
export async function getStats(): Promise<Stats> {
  const db = await readDB();  // 读取数据库
  return db.stats;            // 返回统计数据
}
