import Link from "next/link";
export default function NotFound() {
  return (
    <section className="section not-found">
      <div className="container">
        <span className="label">404</span>
        <h1>Page not found · 找不到頁面</h1>
        <p>The page may have moved. 請返回作品列表繼續瀏覽。</p>
        <Link className="btn btn-primary" href="/projects">
          View projects
        </Link>{" "}
        <Link className="btn btn-outline-dark" href="/zh/projects">
          查看作品
        </Link>
      </div>
    </section>
  );
}
