import { NetworkGraph } from '@/components/network/NetworkGraph';

export default function NetworkPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white">
            🌐 Network Control Center
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Real-time topology visualization with per-node control
          </p>
          <a
            href="/"
            className="mt-3 inline-block rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            ← Back to Dashboard
          </a>
        </header>
        <NetworkGraph />
      </div>
    </main>
  );
}
