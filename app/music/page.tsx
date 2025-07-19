import "./local.css";

export default function MusicPage() {
  return (
    <div className="min-h-screen p-8 page-transition">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[var(--tianyi-blue-dark)]">
          音乐
        </h1>
        <div className="space-y-6">
          <div className="border-b border-[var(--tianyi-blue)] pb-6">
            <h2 className="text-xl font-semibold text-[var(--tianyi-blue-dark)]">
              我最爱的歌曲
            </h2>
            <p className="mt-2 text-gray-600">这里将展示我喜欢的音乐...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
