'use client';

import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { NetworkControlPanel, type NetworkNode, type NodeStatus, type NodeType } from './NetworkControlPanel';

// --- داده‌های اولیه شبکه ---
const INITIAL_NODES: NetworkNode[] = [
  { id: 'n1', name: 'Core Router', type: 'router', status: 'online', ip: '10.0.0.1', ports: [22, 80, 443], lastSeen: 'just now' },
  { id: 'n2', name: 'Edge Firewall', type: 'firewall', status: 'online', ip: '10.0.0.2', ports: [22, 443], lastSeen: 'just now' },
  { id: 'n3', name: 'Web Server A', type: 'server', status: 'online', ip: '10.0.1.10', ports: [80, 443], lastSeen: 'just now' },
  { id: 'n4', name: 'Web Server B', type: 'server', status: 'online', ip: '10.0.1.11', ports: [80, 443], lastSeen: '12s ago' },
  { id: 'n5', name: 'Database', type: 'server', status: 'online', ip: '10.0.1.20', ports: [5432], lastSeen: 'just now' },
  { id: 'n6', name: 'Switch 1', type: 'switch', status: 'online', ip: '10.0.2.1', ports: [22], lastSeen: 'just now' },
  { id: 'n7', name: 'Client 1', type: 'client', status: 'online', ip: '10.0.3.11', ports: [], lastSeen: '2s ago' },
  { id: 'n8', name: 'Client 2', type: 'client', status: 'online', ip: '10.0.3.12', ports: [], lastSeen: '5s ago' },
];

// --- یال‌های شبکه (ارتباطات) ---
const EDGES: Array<[string, string]> = [
  ['n1', 'n2'],
  ['n2', 'n3'],
  ['n2', 'n4'],
  ['n1', 'n5'],
  ['n1', 'n6'],
  ['n6', 'n7'],
  ['n6', 'n8'],
];

// موقعیت ثابت هر نود در فضای سه‌بعدی
const NODE_POSITIONS: Record<string, [number, number, number]> = {
  n1: [0, 0, 0],
  n2: [-3, 2, 0],
  n3: [-5, 4, 1],
  n4: [-5, 4, -1],
  n5: [3, 3, 0],
  n6: [3, -2, 0],
  n7: [5, -4, 1],
  n8: [5, -4, -1],
};

function nodeColor(status: NodeStatus): string {
  if (status === 'offline') return '#ef4444';
  if (status === 'scanning') return '#eab308';
  return '#22c55e';
}

// نود سه‌بعدی با کلیک‌پذیری
function NetworkNodeMesh({
  node,
  position,
  onClick,
  isSelected,
}: {
  node: NetworkNode;
  position: [number, number, number];
  onClick: () => void;
  isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  const scale = hovered ? 1.3 : isSelected ? 1.2 : 1;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        scale={scale}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial
          color={nodeColor(node.status)}
          emissive={nodeColor(node.status)}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      <Html distanceFactor={8} position={[0, 0.7, 0]} center>
        <div className="whitespace-nowrap rounded bg-black/70 px-2 py-0.5 text-xs text-white">
          {node.name}
        </div>
      </Html>
    </group>
  );
}

// یال بین دو نود
function NetworkEdge({
  start,
  end,
  active,
}: {
  start: [number, number, number];
  end: [number, number, number];
  active: boolean;
}) {
  const points = useMemo(
    () => [new THREE.Vector3(...start), new THREE.Vector3(...end)],
    [start, end]
  );

  return (
    <Line
      points={points}
      color={active ? '#3b82f6' : '#6b7280'}
      lineWidth={active ? 2 : 1}
      dashed={!active}
      dashSize={0.2}
      gapSize={0.1}
      transparent
      opacity={active ? 0.9 : 0.4}
    />
  );
}

export function NetworkGraph() {
  const [nodes, setNodes] = useState<NetworkNode[]>(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  const handleAction = (
    action: 'disconnect' | 'reconnect' | 'scan',
    nodeId: string
  ) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== nodeId) return n;
        if (action === 'disconnect') {
          return { ...n, status: 'offline' as NodeStatus, lastSeen: new Date().toLocaleTimeString() };
        }
        if (action === 'reconnect') {
          return { ...n, status: 'online' as NodeStatus, lastSeen: 'just now' };
        }
        return n;
      })
    );

    if (action === 'disconnect' || action === 'reconnect') {
      setSelectedNode((prev) =>
        prev && prev.id === nodeId
          ? { ...prev, status: action === 'disconnect' ? 'offline' : 'online' }
          : prev
      );
    }
  };

  const nodeMap = useMemo(() => {
    const m: Record<string, NetworkNode> = {};
    nodes.forEach((n) => (m[n.id] = n));
    return m;
  }, [nodes]);

  return (
    <div className="relative h-[600px] w-full rounded-lg border border-gray-800 bg-gradient-to-b from-slate-900 to-black">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

        {/* یال‌ها */}
        {EDGES.map(([from, to], i) => {
          const fromNode = nodeMap[from];
          const toNode = nodeMap[to];
          const active = fromNode?.status === 'online' && toNode?.status === 'online';
          return (
            <NetworkEdge
              key={`edge-${i}`}
              start={NODE_POSITIONS[from]}
              end={NODE_POSITIONS[to]}
              active={active}
            />
          );
        })}

        {/* نودها */}
        {nodes.map((node) => (
          <NetworkNodeMesh
            key={node.id}
            node={node}
            position={NODE_POSITIONS[node.id]}
            isSelected={selectedNode?.id === node.id}
            onClick={() => setSelectedNode(node)}
          />
        ))}

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* پنل کنترل */}
      {selectedNode && (
        <NetworkControlPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onAction={handleAction}
        />
      )}

      {/* راهنمای پایین */}
      <div className="pointer-events-none absolute bottom-4 left-4 rounded bg-black/60 px-3 py-2 text-xs text-gray-300">
        <p>🖱️ Drag to rotate · Scroll to zoom · Click node to control</p>
        <p className="mt-1">
          🟢 Online · 🔴 Offline · Total nodes: {nodes.length} · Online:{' '}
          {nodes.filter((n) => n.status === 'online').length}
        </p>
      </div>
    </div>
  );
}
