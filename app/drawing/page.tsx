import "./local.css";

export default function BlogPage() {
  return (
    <main>
      <article className="drawing-article" key="drawing-content">
        <div className="article_img">
          <img src="/img/sfq1.png" alt="#" />
        </div>
        <div className="article_info">
          <h2>测试</h2>
          <p>1</p>
        </div>
        
      </article>
      <article className="drawing-article">
        <div className="article_img">
          <img src="/img/sfq3.png" alt="#" />
        </div>
        <div className="article_info">
          <h2>测试</h2>
          <p>2</p>
        </div>
      </article>
      <article className="drawing-article">
        <div className="article_img">
          <img src="/img/sfq4.png" alt="#" />
        </div>
        <div className="article_info">
          <h2>测试</h2>
          <p>3</p>
        </div>
      </article>
      <article className="drawing-article">
        <div className="article_img">
          <img src="/img/sfq2.jpg" alt="#" />
        </div>
        <div className="article_info">
          <h2>测试</h2>
          <p>4</p>
        </div>
      </article>
      <article className="drawing-article">
        <div className="article_img">
          <img src="/img/sfq5.jpg" alt="#" />
        </div>
        <div className="article_info">
          <h2>测试</h2>
          <p>5</p>
        </div>
      </article>
      <div className="透明区"></div>
    </main>
  );
}
