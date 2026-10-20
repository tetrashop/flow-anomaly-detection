import { useState } from 'react';
import { X, Power, RefreshCw, Scan, FileText, Loader2 } from 'lucide-react';

export type NodeStatus = 'online' | 'offline' | 'scanning';
export type NodeType = 'server' | 'router' | 'firewall' | 'client' | 'switch';

export interface NetworkNode {
  id: string;
  name: string;
  type: string;
  status: NodeStatus;
  ip?: string;
}

interface Props {
  node: NetworkNode;
  onClose: () => void;
  onAction: (action: 'disconnect' | 'reconnect' | 'scan', nodeId: string) => void;
}

export function NetworkControlPanel({ node, onClose, onAction }: Props) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    onAction('scan', node.id);
    await new Promise((r) => setTimeout(r, 2000));
    setScanResult('Port scan completed: 22/tcp open, 80/tcp open, 443/tcp open');
    setScanning(false);
  };

  return (
    <div className="fixed right-4 top-4 z-50 w-80 rounded-lg border border-gray-700 bg-gray-900/95 p-4 shadow-xl backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{node.name}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <div className="mb-4 space-y-1 text-sm text-gray-300">
        <p>Type: {node.type}</p>
        <p>IP: {node.ip ?? '—'}</p>
        <p>
          Status:{' '}
          <span className={node.status === 'online' ? 'text-green-400' : 'text-red-400'}>
            {node.status}
          </span>
        </p>
      </div>

      <div className="space-y-2">
        {node.status === 'online' ? (
          <button
            onClick={() => onAction('disconnect', node.id)}
            className="flex w-full items-center gap-2 rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
          >
            <Power size={16} /> Disconnect
          </button>
        ) : (
          <button
            onClick={() => onAction('reconnect', node.id)}
            className="flex w-full items-center gap-2 rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
          >
            <RefreshCw size={16} /> Reconnect
          </button>
        )}

        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex w-full items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {scanning ? <Loader2 size={16} className="animate-spin" /> : <Scan size={16} />}
          {scanning ? 'Scanning…' : 'Scan Ports'}
        </button>

        <button className="flex w-full items-center gap-2 rounded bg-gray-700 px-3 py-2 text-sm text-white hover:bg-gray-600">
          <FileText size={16} /> View Logs
        </button>
      </div>

      {scanResult && (
        <div className="mt-3 rounded bg-gray-800 p-2 text-xs text-gray-300">{scanResult}</div>
      )}
    </div>
  );
}
