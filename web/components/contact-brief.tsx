"use client";
import { useRef, useState, type FormEvent } from "react";
import type { Locale } from "@/lib/content/schema";
import { ORG } from "@/lib/site";
type Brief = {
  name: string;
  email: string;
  phone: string;
  company: string;
  space_type: string;
  timeline: string;
  description: string;
};
export function ContactBrief({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  const form = useRef<HTMLFormElement>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const checklist = zh
    ? [
        "空間位置與坪數",
        "平面圖或現況照片",
        "使用人數與空間需求",
        "預計進場與啟用時間",
        "預算範圍",
        "品牌規範或參考方向",
      ]
    : [
        "Location and floor area",
        "Plans or existing photographs",
        "Headcount and spatial needs",
        "Target start and opening dates",
        "Budget range",
        "Brand guidelines or references",
      ];
  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBrief(
      Object.fromEntries(
        [
          "name",
          "email",
          "phone",
          "company",
          "space_type",
          "timeline",
          "description",
        ].map((key) => [key, String(data.get(key) || "").trim()]),
      ) as Brief,
    );
    setStatus("idle");
  }
  async function send() {
    if (!brief || status === "sending") return;
    setStatus("sending");
    try {
      const response = await fetch("https://formspree.io/f/xeendgkz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(brief),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error("Submission failed");
      setStatus("sent");
      form.current?.reset();
    } catch {
      setStatus("error");
    }
  }
  return (
    <div className="contact-layout">
      <aside>
        <p className="eyebrow">BEFORE WE MEET</p>
        <h2>
          {zh
            ? "第一次討論，從這六件事開始。"
            : "Six things to start the conversation."}
        </h2>
        <p>
          {zh
            ? "已有的資料先準備，尚未確定的部分可在討論中釐清。"
            : "Bring what you have. We can clarify the rest together."}
        </p>
        <div className="brief-checklist">
          {checklist.map((item) => (
            <label key={item}>
              <input type="checkbox" />
              {item}
            </label>
          ))}
        </div>
        <a href={`mailto:${ORG.email}`} className="text-link">
          {ORG.email} ↗
        </a>
        <p className="small muted">
          {zh
            ? "勾選清單僅協助準備，不會自動傳送。"
            : "This checklist stays in your browser."}
        </p>
      </aside>
      <div>
        {status === "sent" ? (
          <div role="status" className="contact-success">
            <p className="eyebrow">SENT</p>
            <h2>{zh ? "需求已送出，謝謝。" : "Your brief has been sent."}</h2>
            <p>
              {zh
                ? "團隊將透過提供的聯絡方式回覆。"
                : "The team will respond using your contact details."}
            </p>
            <button
              className="text-link"
              onClick={() => {
                setStatus("idle");
                setBrief(null);
              }}
            >
              {zh ? "另一份需求" : "Start another brief"} ↗
            </button>
          </div>
        ) : (
          <>
            <form
              ref={form}
              onSubmit={review}
              className="contact-form"
              hidden={brief !== null}
            >
              <div className="form-grid">
                <label>
                  {zh ? "姓名 *" : "Name *"}
                  <input
                    name="name"
                    required
                    maxLength={100}
                    autoComplete="name"
                  />
                </label>
                <label>
                  {zh ? "公司" : "Company"}
                  <input
                    name="company"
                    maxLength={150}
                    autoComplete="organization"
                  />
                </label>
                <label>
                  Email *
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={254}
                  />
                </label>
                <label>
                  {zh ? "電話" : "Phone"}
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={40}
                  />
                </label>
                <label>
                  {zh ? "空間類型 *" : "Space type *"}
                  <select name="space_type" required defaultValue="">
                    <option value="" disabled>
                      {zh ? "請選擇" : "Select a type"}
                    </option>
                    {[
                      "Office / 辦公",
                      "Hospitality / 旅宿",
                      "F&B / 餐飲",
                      "Showroom / 展廳",
                      "Other / 其他",
                    ].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  {zh ? "預計啟用時間" : "Target opening"}
                  <input
                    name="timeline"
                    maxLength={100}
                    placeholder={zh ? "例如：2027 年第一季" : "e.g. Q1 2027"}
                  />
                </label>
              </div>
              <label>
                {zh ? "專案需求 *" : "Project brief *"}
                <textarea
                  name="description"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={6}
                  placeholder={
                    zh
                      ? "請說明空間位置、規模、需求與預算方向（至少 10 字）。"
                      : "Location, scale, goals and budget direction (at least 10 characters)."
                  }
                />
              </label>
              <p className="small muted">
                {zh
                  ? "資料僅用於專案洽詢聯繫。下一步可先確認摘要，再決定送出。"
                  : "Your details are used to respond to this enquiry. Review your summary before sending."}
              </p>
              <button className="button-primary" type="submit">
                {zh ? "檢視需求摘要" : "Review your brief"} ↗
              </button>
            </form>
            {brief && (
              <section
                className="brief-summary"
                aria-label={zh ? "需求摘要" : "Brief summary"}
              >
                <p className="eyebrow">REVIEW / YOUR BRIEF</p>
                <h2>{zh ? "確認後，再送出。" : "Review before sending."}</h2>
                <dl>
                  {Object.entries(brief)
                    .filter(([, value]) => value)
                    .map(([key, value]) => (
                      <div key={key}>
                        <dt>
                          {
                            (
                              {
                                name: "姓名 / Name",
                                email: "Email",
                                phone: "電話 / Phone",
                                company: "公司 / Company",
                                space_type: "空間 / Space",
                                timeline: "時程 / Timeline",
                                description: "需求 / Brief",
                              } as Record<string, string>
                            )[key]
                          }
                        </dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                </dl>
                <p className="small muted">
                  {zh
                    ? "按下「確認送出」會透過 Formspree 將本摘要傳送給惠強。"
                    : "Confirming sends this brief to HQ Design through Formspree."}
                </p>
                {status === "error" && (
                  <p role="alert" className="form-error">
                    {zh
                      ? `傳送未完成。請稍後重試，或寄信至 ${ORG.email}；填寫內容仍保留。`
                      : `We could not send your brief. Try again or email ${ORG.email}. Your details are preserved.`}
                  </p>
                )}
                <div className="form-actions">
                  <button
                    type="button"
                    disabled={status === "sending"}
                    onClick={() => {
                      setBrief(null);
                      setStatus("idle");
                    }}
                  >
                    {zh ? "← 返回修改" : "← Edit"}
                  </button>
                  <button
                    type="button"
                    className="button-primary"
                    disabled={status === "sending"}
                    onClick={send}
                  >
                    {status === "sending"
                      ? zh
                        ? "傳送中…"
                        : "Sending…"
                      : zh
                        ? "確認送出 ↗"
                        : "Confirm and send ↗"}
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
