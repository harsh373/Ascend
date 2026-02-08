export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-8 py-10 pb-24 animate-pulse">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 h-64 bg-zinc-800 rounded-2xl" />

        <div className="mb-8">
          <div className="h-8 bg-zinc-800 rounded w-3/4 mb-4" />
          <div className="h-4 bg-zinc-800 rounded w-1/2" />
        </div>

        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="h-6 bg-zinc-800 rounded w-1/4 mb-4" />
              <div className="h-4 bg-zinc-800 rounded w-full mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}