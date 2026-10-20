'use client';

import { useState } from 'react';
import { X, Power, RefreshCw, Scan, FileText, Loader2, Shield, ShieldOff } from 'lucide-react';

export type NodeStatus = 'online' | 'offline' | 'scanning';
export type NodeType = 'server' | 'router' | 'firewall' | 'client' | 'switch';

export interface NetworkNode {
  id: string;
  name: string;
  type: NodeType;
  status: NodeStatus;
  ip: string;
  ports: number[];
  lastSeen: string;
}

interface NetworkControlPanelProps {
  node: NetworkNode;
  onClose: () => void;
  onAction: (action: 'disconnect' | 'reconnect' | 'scan', nodeId: string) => void;
}

export function NetworkControlPanel({ node, onClose, onAction }: NetworkControlPanelProps) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    onAction('scan', node.id);
    await new Promise((r) => setTimeout(r, 2000));

    const ports = node.ports.length > 0 ? node.ports : [22, 80, 443];
    const results = ports
      .map((p) => {
        const services: Record<number, string> = {
          22: 'ssh',
          80: 'http',
          443: 'https',
          3306: 'mysql',
          5432: 'postgresql',
          6379: 'redis',
          8080: 'http-alt',
        };
        return `  ${p}/tcp   open    ${services[p] ?? 'unknown'}`;
      })
      .join('\n');

    setScanResult(
      `Port scan on ${node.ip} — ${new Date().toLocaleTimeString()}\n\nPORT      STATE   SERVICE\n${results}`
    );
    setScanning(false);
  };

  const statusColor =
    node.status === 'online'
      ? 'text-green-400'
      : node.status === 'offline'
      ? 'text-red-400'
      : 'text-yellow-400';

  const typeIcon =
    node.type === 'firewall' ? (
      <Shield size={16} className="text-blue-400" />
    ) : node.type === 'server' ? (
      <ShieldOff size={16} className="text-purple-400" />
    ) : null;

  return (
    <div className="fixed right-4 top-4 z-50 w-80 rounded-lg border border-gray-700 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {typeIcon}
          <h3 className="text-lg font-semibold text-white">{node.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mb-4 space-y-1.5 rounded bg-gray-800/50 p-2 text-sm text-gray-300">
        <div className="flex justify-between">
          <span className="text-gray-500">Type:</span>
          <span className="font-medium capitalize">{node.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">IP:</span>
          <span className="font-mono">{node.ip}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Status:</span>
          <span className={`font-medium ${statusColor}`}>{node.status.toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Last seen:</span>
          <span className="text-xs">{node.lastSeen}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Open ports:</span>
          <span className="font-mono text-xs">{node.ports.join(', ') || '—'}</span>
        </div>
      </div>

      <div className="space-y-2">
        {node.status === 'online' ? (
          <button
            onClick={() => onAction('disconnect', node.id)}
            className="flex w-full items-center justify-center gap-2 rounded bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <Power size={16} /> Disconnect Node
          </button>
        ) : (
          <button
            onClick={() => onAction('reconnect', node.id)}
            className="flex w-full items-center justify-center gap-2 rounded bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            <RefreshCw size={16} /> Reconnect Node
          </button>
        )}

        <button
          onClick={handleScan}
          disabled={scanning || node.status === 'offline'}
          className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {scanning ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Scanning…
            </>
          ) : (
            <>
              <Scan size={16} /> Scan Ports
            </>
          )}
        </button>

        <button
          onClick={() => setScanResult(`Logs for ${node.name}:\n- ${new Date().toISOString()} — status check\n- ${new Date(Date.now() - 60000).toISOString()} — heartbeat OK\n- ${new Date(Date.now() - 120000).toISOString()} — connection established`)}
          className="flex w-full items-center justify-center gap-2 rounded bg-gray-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-600"
        >
          <FileText size={16} /> View Logs
        </button>
      </div>

      {scanResult && (
        <div className="mt-3 max-h-40 overflow-y-auto rounded bg-black/60 p-2 font-mono text-xs text-green-300">
          <pre className="whitespace-pre-wrap">{scanResult}</pre>
        </div>
      )}
    </div>
  );
}
