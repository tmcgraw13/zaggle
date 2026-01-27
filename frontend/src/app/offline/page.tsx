export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🎮</div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent mb-4">
          ZAGGLE
        </h1>
        <p className="text-slate-400 text-lg">Game is currently offline.</p>
        <p className="text-slate-400 text-lg">Check back later!</p>
      </div>
    </div>
  );
}
