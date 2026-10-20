export default function Home() {
  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', background: '#0f172a', color: 'white', minHeight: '100vh' }}>
      <h1>✅ داشبورد متصل شد!</h1>
      <p>API خروجی CAT کار می‌کند.</p>
      <a href="/api/export?user=test" style={{ color: '#60a5fa' }}>تست دانلود ZIP خروجی</a>
    </div>
  );
}
