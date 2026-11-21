"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="section not-found">
      <div className="container">
        <h1>Content temporarily unavailable</h1>
        <p>內容暫時無法載入，請稍後再試。</p>
        <button className="btn btn-primary" onClick={reset}>
          Retry · 重試
        </button>
        <a href="mailto:info@hqdesign.tw">info@hqdesign.tw</a>
      </div>
    </section>
  );
}
