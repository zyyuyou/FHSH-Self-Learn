// 不需要 import React / ReactDOM，因為已在 index.html 用 <script> 載入

// App 元件直接寫在這裡
const App = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">自主學習計畫申請系統</h1>
      <p className="text-lg text-gray-600">前端載入成功 🎉</p>
    </div>
  );
};

// React 入口
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
