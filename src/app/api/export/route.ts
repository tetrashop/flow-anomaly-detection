import { NextResponse } from 'next/server';
import crypto from 'crypto';

function sha256(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user') || 'guest';
  const date = new Date().toISOString().split('T')[0];

  const topology = { nodes: [], edges: [], timestamp: new Date().toISOString() };
  const anomalies = { count: 0, items: [], timestamp: new Date().toISOString() };

  const files: Record<string, { content: string; hash: string }> = {
    'network/topology.json': {
      content: JSON.stringify(topology, null, 2),
      hash: sha256(JSON.stringify(topology)),
    },
    'ai/anomalies.json': {
      content: JSON.stringify(anomalies, null, 2),
      hash: sha256(JSON.stringify(anomalies)),
    },
  };

  const manifest = {
    generated_at: new Date().toISOString(),
    user: userId,
    base_path: `exports/${userId}/${date}`,
    files: Object.fromEntries(
      Object.entries(files).map(([k, v]) => [k, { path: `exports/${userId}/${date}/${k}`, sha256: v.hash }])
    ),
  };

  const output: string[] = [
    '# CAT Export Bundle',
    `# User: ${userId}`,
    `# Date: ${date}`,
    `# Manifest hash: ${sha256(JSON.stringify(manifest))}`,
    '',
    '=== MANIFEST.json ===',
    JSON.stringify(manifest, null, 2),
    '',
  ];

  for (const [path, { content, hash }] of Object.entries(files)) {
    output.push(`=== exports/${userId}/${date}/${path} ===`);
    output.push(`SHA256: ${hash}`);
    output.push(content);
    output.push('');
  }

  return new NextResponse(output.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
