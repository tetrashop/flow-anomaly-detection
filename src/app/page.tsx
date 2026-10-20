'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricsOverview } from '@/components/dashboard/MetricsOverview';
import { NetworkVisualization } from '@/components/3d/NetworkVisualization';
import { AnomalyList } from '@/components/dashboard/AnomalyList';
import { AlarmPanel } from '@/components/dashboard/AlarmPanel';
import { FlowAnalytics } from '@/components/dashboard/FlowAnalytics';
import { dataGenerator } from '@/lib/data-generator';
import { NetworkTopology, AnomalyDetection, Alarm, DashboardMetrics } from '@/types';

export default function Dashboard() {
  const [topology, setTopology] = useState<NetworkTopology | null>(null);
  const [_anomalies, _setAnomalies] = useState<AnomalyDetection[]>([]);
  const [_alarms, _setAlarms] = useState<Alarm[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalFlows: 0,
    anomaliesDetected: 0,
    activeAlarms: 0,
    networkHealth: 95,
    throughput: { current: 0, average: 0, peak: 0 },
    latency: { current: 0, average: 0, p95: 0 },
    topTalkers: [],
  });
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const initializeData = () => {
      setTopology(dataGenerator.generateTopology());
      setMetrics(prev => ({
        ...prev,
        totalFlows: 1247,
        anomaliesDetected: 5,
        activeAlarms: 2,
        throughput: { current: 156.7, average: 142.3, peak: 289.1 },
        latency: { current: 12.4, average: 15.2, p95: 28.7 },
      }));
    };
    initializeData();
  }, []);

  if (!topology) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <p>در حال بارگذاری داشبورد...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <DashboardHeader
        onStartSimulation={() => setIsSimulating(true)}
        onStopSimulation={() => setIsSimulating(false)}
        onStartDDoSDemo={() => {}}
        isSimulating={isSimulating}
      />
      <div className="container mx-auto p-6 space-y-6">
        <MetricsOverview metrics={metrics} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <NetworkVisualization topology={topology} anomalies={anomalies} />
          </div>
          <div className="space-y-6">
            <AlarmPanel alarms={alarms} />
            <AnomalyList anomalies={anomalies} />
          </div>
        </div>
        <FlowAnalytics metrics={metrics} />
      </div>
    </div>
  );
}
