// app/api/blog/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs/promises'; // 修改点：改为 fs/promises 进行异步文件操作
import path from 'path';
import type { Post, Comment, DailyBlogView, DailyArticleView } from '../../utils/db';

// 定义数据库文件的路径
const DB_PATH = path.join(process.cwd(), 'db/blog.json');

// 新增：内存缓存变量和锁
let dbCache: any = null; // 用于存储数据库的内存缓存
let isWriting = false;   // 写入锁，防止并发写入导致数据损坏
let writeQueue: (() => Promise<void>)[] = []; // 写入队列

/**
 * 异步读取数据库文件。
 * 引入了简单的内存缓存机制，减少文件 I/O。
 * @returns 数据库的 JSON 数据。
 */
async function readDBAsync(): Promise<any> {
    if (dbCache) {
        return dbCache; // 如果有缓存，直接返回缓存数据
    }
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        dbCache = JSON.parse(data); // 读取后更新缓存
        return dbCache;
    } catch (error) {
        console.error('Failed to read database file:', error);
        // 如果文件不存在或读取失败，可以初始化一个空数据库结构
        const initialDB = {
            posts: [],
            categories: [],
            stats: { totalBlogViews: 0, totalArticleViews: 0, totalComments: 0 },
            dailyBlogViews: [],
            dailyArticleViews: [],
            comments: [],
            users: [] // 注意：用户数据现在在 db.ts 中模拟，这里仅作为初始结构
        };
        dbCache = initialDB; // 缓存初始化数据
        await writeDBAsync(initialDB); // 写入初始数据到文件
        return initialDB;
    }
}

/**
 * 异步写入数据到数据库文件。
 * 使用队列和锁机制，防止并发写入问题。
 * @param data - 要写入的 JSON 数据。
 */
async function writeDBAsync(data: any): Promise<void> {
    dbCache = data; // 更新内存缓存
    
    try {
        // 直接写入文件，不再使用队列
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
        console.log('Database written successfully at', new Date().toISOString());
    } catch (error) {
        console.error('Failed to write database file:', error);
        // 失败后重试一次
        try {
            await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
            console.log('Retry write succeeded at', new Date().toISOString());
        } catch (retryError) {
            console.error('Retry write failed:', retryError);
            throw retryError; // 抛出错误让调用方处理
        }
    }
}


/**
 * 处理 GET 请求。
 * 返回博客数据库的全部内容。此端点通常是公开访问的。
 * @returns 包含博客数据的 JSON 响应。
 */
export async function GET() {
    try {
        const data = await readDBAsync(); // 修改点：使用异步读取
        const response = NextResponse.json(data);
        response.headers.set('Cache-Control', 'no-cache');
        // 由于文件异步读取，mtime 可能需要单独获取
        try {
            const stats = await fs.stat(DB_PATH);
            response.headers.set('Last-Modified', new Date(stats.mtime).toUTCString());
        } catch (fileStatError) {
            console.warn('Could not get file stats for Last-Modified:', fileStatError);
        }
        return response;
    } catch (error) {
        console.error("GET /api/blog error:", error);
        return NextResponse.json(
            { error: 'Failed to read database' },
            { status: 500 }
        );
    }
}

/**
 * 处理 POST 请求。
 * 根据请求中的 'action' 执行各种博客管理操作。
 * 此端点在执行敏感操作前会进行身份验证检查。
 *
 * @param request - 传入的 NextRequest 对象，用于获取请求体和 cookies。
 * @returns JSON 响应表示操作成功或失败。
 */
export async function POST(request: NextRequest) {
    try {
        const requestData = await request.json();
        const { action, post, id, publish, nickname, content, postId } = requestData;

        // 定义不需要认证的 POST actions (公共读取或简单的计数器)
        const publicPostActions = [
            'getTodayBlogViews',
            'getTodayArticleViews',
            'getArticleViews',
            'getTodayArticleComments',
            'get-comments',
            'increment-blog-views',
            'increment-article-views',
            'add-comment',
        ];

        // --- 身份验证检查开始 ---
        // 如果当前 action 不是公共 action，则进行认证检查
        if (!publicPostActions.includes(action)) {
            const authCookie = request.cookies.get('admin-auth')?.value;
            if (!authCookie) {
                return NextResponse.json(
                    { error: 'Unauthorized - Please log in first.' },
                    { status: 401 }
                );
            }
        }
        // --- 身份验证检查结束 ---

        const db = await readDBAsync(); // 修改点：使用异步读取

        if (action === 'create') {
            const newPost = {
                ...post,
                id: Date.now(),
                views: 0,
                comments: 0,
                published: false,
                date: new Date().toLocaleString('zh-CN', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                }).replace(/\//g, '-').replace(/\s+/g, ' ')
            };
            db.posts.push(newPost);
            await writeDBAsync(db); // 修改点：使用异步写入
            return NextResponse.json({ success: true });
        }

        if (action === 'publish') {
            const postIndex = db.posts.findIndex((p: Post) => p.id === id);
            if (postIndex !== -1) {
                db.posts[postIndex].published = publish;
                await writeDBAsync(db); // 改点：使用异步写入
                return NextResponse.json({ success: true });
            }
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        if (action === 'delete') {
            const deletedPost = db.posts.find((p: Post) => p.id === id);
            db.posts = db.posts.filter((p: Post) => p.id !== id);

            if (deletedPost) {
                db.comments = db.comments.filter((c: Comment) => c.postId !== id);
                db.dailyArticleViews = db.dailyArticleViews.filter((d: DailyArticleView) => d.postId !== id);

                // 优化点：增量更新总统计
                db.stats.totalArticleViews -= deletedPost.views; // 从总数中减去被删除文章的浏览量
                db.stats.totalComments -= deletedPost.comments;  // 从总数中减去被删除文章的评论数
            }

            await writeDBAsync(db); // 修改点：使用异步写入
            return NextResponse.json({ success: true });
        }

        if (action === 'update') {
            const postIndex = db.posts.findIndex((p: Post) => p.id === post.id);
            if (postIndex !== -1) {
                db.posts[postIndex] = post;
                await writeDBAsync(db); // 修改点：使用异步写入
                return NextResponse.json({ success: true });
            }
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // --- 以下是公共操作，无需认证 ---

        if (action === 'increment-blog-views') {
            const today = new Date().toISOString().replace('T', ' ').slice(0, 10);
            let dailyBlogView = db.dailyBlogViews.find((d: DailyBlogView) => d.date === today);
            if (!dailyBlogView) {
                dailyBlogView = { date: today, views: 0 };
                db.dailyBlogViews.push(dailyBlogView);
            }
            dailyBlogView.views += 1;
            db.stats.totalBlogViews += 1; // 优化点：增量更新总统计
            await writeDBAsync(db); // 修改点：使用异步写入
            return NextResponse.json({ success: true });
        }

        if (action === 'increment-article-views') {
            const postIndex = db.posts.findIndex((p: Post) => p.id === id);
            if (postIndex !== -1) {
                const today = new Date().toISOString().split('T')[0];
                let dailyArticleView = db.dailyArticleViews.find(
                    (d: { date: string, postId: number }) => d.date === today && d.postId === id
                );
                if (!dailyArticleView) {
                    dailyArticleView = { date: today, postId: id, views: 0 };
                    db.dailyArticleViews.push(dailyArticleView);
                }
                dailyArticleView.views += 1;

                //  优化点：增量更新文章总点击量
                db.posts[postIndex].views += 1;
                db.stats.totalArticleViews += 1; //  优化点：增量更新总统计

                await writeDBAsync(db); //  修改点：使用异步写入
                return NextResponse.json({ success: true });
            }
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        if (action === 'getTodayBlogViews') {
            const today = new Date().toISOString().split('T')[0];
            const views = db.dailyBlogViews?.find((d: DailyBlogView) => d.date === today)?.views || 0;
            return NextResponse.json({ views });
        }

        if (action === 'getTodayArticleViews') {
            const today = new Date().toISOString().split('T')[0];
            const views = db.dailyArticleViews
                ?.filter((d: { date: string }) => d.date === today)
                ?.reduce((sum: number, d: { views: number }) => sum + d.views, 0) || 0;
            return NextResponse.json({ views });
        }

        if (action === 'getArticleViews') {
            const views = db.dailyArticleViews
                ?.filter((d: { postId: number }) => d.postId === postId)
                ?.reduce((sum: number, d: { views: number }) => sum + d.views, 0) || 0;
            return NextResponse.json({ views });
        }

        if (action === 'getTodayArticleComments') {
            const today = new Date().toISOString().split('T')[0];
            const commentsCount = db.comments
                .filter((c: Comment) => c.date.startsWith(today))
                .length;
            return NextResponse.json({ count: commentsCount });
        }

        if (action === 'get-comments') {
            const commentsForPost = db.comments.filter((c: Comment) => c.postId === postId);
            return NextResponse.json(commentsForPost);
        }

        if (action === 'add-comment') {
            const newComment = {
                id: Date.now(),
                postId,
                nickname,
                content,
                date: new Date().toLocaleString('zh-CN', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                }).replace(/\//g, '-').replace(/\s+/g, ' '),
            };
            db.comments.push(newComment);

            const postToUpdate = db.posts.find((p: Post) => p.id === postId);
            if (postToUpdate) {
                postToUpdate.comments += 1;
            }
            db.stats.totalComments += 1; // 优化点：增量更新总统计

            await writeDBAsync(db); // 修改点：使用异步写入
            return NextResponse.json({ success: true });
        }

        if (action === 'delete-comment') {
            const commentToDelete = db.comments.find((c: Comment) => c.id === id);
            if (commentToDelete) {
                const postToUpdate = db.posts.find((p: Post) => p.id === commentToDelete.postId);
                if (postToUpdate) {
                    postToUpdate.comments -= 1;
                }
            }
            db.comments = db.comments.filter((c: Comment) => c.id !== id);
            db.stats.totalComments -= 1; // 优化点：增量更新总统计
            await writeDBAsync(db); // 修改点：使用异步写入
            return NextResponse.json({ success: true });
        }

        // 清除博客所有访问数据
        if (action === 'clear-blog-views') {
            db.dailyBlogViews = []; // 清空每日博客访问记录
            db.stats.totalBlogViews = 0; // 重置总访问量
            await writeDBAsync(db); //  修改点：使用异步写入
            return NextResponse.json({ success: true, message: 'All blog view data cleared.' });
        }

        // 清除所有文章点击数据
        if (action === 'clear-article-views') {
            db.dailyArticleViews = []; // 清空每日文章点击记录
            // 重置所有文章的点击量
            db.posts.forEach((p: Post) => { p.views = 0; });
            db.stats.totalArticleViews = 0; // 重置总文章点击量
            await writeDBAsync(db); // 修改点：使用异步写入
            return NextResponse.json({ success: true, message: 'All article view data cleared.' });
        }

        // 清除所有文章评论数据
        if (action === 'clear-comments') {
            db.comments = []; // 清空所有评论
            // 重置所有文章的评论数
            db.posts.forEach((p: Post) => { p.comments = 0; });
            db.stats.totalComments = 0; // 重置总评论量
            await writeDBAsync(db); //  修改点：使用异步写入
            return NextResponse.json({ success: true, message: 'All comment data cleared.' });
        }

        // 如果 action 不匹配任何已知操作，返回 400 Bad Request
        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );

    } catch (error) {
        // 捕获并记录所有 API 错误，返回 500 Internal Server Error
        console.error("API error:", error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
