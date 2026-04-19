"use client";

import { useState } from "react";
import "./landing.css";

const REGIONS = [
  "الرياض",
  "مكة المكرمة",
  "المدينة المنورة",
  "الشرقية",
  "عسير",
  "القصيم",
  "حائل",
  "تبوك",
  "جازان",
  "نجران",
  "الباحة",
  "الحدود الشمالية",
  "الجوف",
];

export default function LandingPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitted) return;
    setSubmitting(true);
    // Demo-only — no backend for this landing page yet.
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <main className="lp-root">
      <div className="lp-page">
        <header className="lp-header">
          <div className="lp-brand">
            <div className="lp-logo">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3 17V5L10 2L17 5V17"
                  stroke="#0E0D0B"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 17V10H14V17"
                  stroke="#C8A03C"
                  strokeWidth="1.4"
                />
              </svg>
            </div>
            <div className="lp-brand-text">
              <span className="lp-brand-ar">همزة العقارية</span>
              <span className="lp-brand-tag">للتمويل والاستشارات</span>
            </div>
          </div>
          <a href="tel:920033712" className="lp-call">
            920 033 712
          </a>
        </header>

        <section className="lp-hero">
          <div className="lp-hero-left">
            <h1 className="lp-pitch">
              تبي تمتلك بيت العمر؟
              <br />
              <span className="lp-stamp">همزة</span> هنا لمساعدتك.
            </h1>
            <p className="lp-sub">
              حتى لو عندك مشاكل في توفير الدفعة الأولى — نحن نتولى الحل ونحقق لك
              حلمك بالسكن.
            </p>

            <div className="lp-trust-strip">
              <div className="lp-trust">
                <div className="lp-trust-logo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/landing/ministry-commerce.png"
                    alt="وزارة التجارة"
                  />
                </div>
                <div className="lp-trust-txt">
                  <b>وزارة التجارة</b>
                  <span>مرخّص ومعتمد</span>
                </div>
              </div>
              <div className="lp-trust">
                <div className="lp-trust-logo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/landing/rega.png" alt="الهيئة العامة للعقار" />
                </div>
                <div className="lp-trust-txt">
                  <b>الهيئة العامة للعقار</b>
                  <span>وسيط عقاري مرخّص</span>
                </div>
              </div>
            </div>
          </div>

          <aside className="lp-form-shell">
            <div className="lp-form-head">
              <h2>
                احجز <span className="lp-hl">جلستك</span> الاستشارية مجانًا
              </h2>
              <p>قدم طلب استشارة فقط، وسيتم الاتصال بك في أقرب وقت.</p>
            </div>

            <div className="lp-promise">الدفع فقط بعد ما تمتلك بيتك</div>

            <form className="lp-form-body" onSubmit={handleSubmit}>
              <div className="lp-field">
                <label htmlFor="lp-name">الاسم</label>
                <input
                  id="lp-name"
                  className="lp-input"
                  type="text"
                  name="name"
                  required
                />
              </div>

              <div className="lp-field">
                <label htmlFor="lp-phone">رقم الجوال</label>
                <input
                  id="lp-phone"
                  className="lp-input"
                  type="tel"
                  name="phone"
                  required
                />
              </div>

              <div className="lp-field">
                <label htmlFor="lp-region">المنطقة</label>
                <select
                  id="lp-region"
                  className="lp-input"
                  name="region"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    اختر المنطقة
                  </option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lp-field">
                <label htmlFor="lp-notes">
                  ملاحظات <span className="lp-opt">(اختياري)</span>
                </label>
                <textarea
                  id="lp-notes"
                  className="lp-input"
                  name="notes"
                  rows={3}
                />
              </div>

              <label className="lp-terms">
                <input type="checkbox" defaultChecked required />
                <span>
                  أوافق على <a href="#terms">الأحكام والشروط</a>
                </span>
              </label>

              <button
                className="lp-submit"
                type="submit"
                disabled={submitting || submitted}
                style={
                  submitted
                    ? {
                        background: "var(--positive)",
                        borderColor: "var(--positive)",
                      }
                    : undefined
                }
              >
                {submitted
                  ? "✓ تم الاستلام — سنتصل بك قريبًا"
                  : submitting
                    ? "جاري الإرسال..."
                    : "احجز استشارتي الآن"}
              </button>
            </form>
          </aside>
        </section>

        <footer className="lp-footer">
          <div>© ٢٠٢٦ همزة العقارية — جميع الحقوق محفوظة</div>
          <div>الرياض · المملكة العربية السعودية</div>
        </footer>
      </div>
    </main>
  );
}
