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
import { NetworkGraph } from '@/components/network/NetworkGraph';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white">
            🌐 Flow Anomaly Detection — Network Control
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Real-time topology visualization with per-node control
          </p>
        </header>

        <NetworkGraph />
      </div>
    </main>
  );
}

export default function Dashboard() {
  const [topology, setTopology] = useState<NetworkTopology | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
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

  // Initialize dashboard data
  useEffect(() => {
    const initializeData = () => {
      // Generate initial topology
      const initialTopology = dataGenerator.generateTopology();
      setTopology(initialTopology);

      // Generate some initial anomalies and alarms
      const initialAnomalies: AnomalyDetection[] = [];
      const initialAlarms: Alarm[] = [];

      for (let i = 0; i < 5; i++) {
        const flow = dataGenerator.generateFlow(true);
        const anomaly = dataGenerator.generateAnomaly(flow);
        const alarm = dataGenerator.generateAlarm(anomaly);

        initialAnomalies.push(anomaly);
        initialAlarms.push(alarm);
      }

      setAnomalies(initialAnomalies);
      setAlarms(initialAlarms);

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        totalFlows: 1247,
        anomaliesDetected: initialAnomalies.length,
        activeAlarms: initialAlarms.filter(a => a.status === 'open').length,
        throughput: { current: 156.7, average: 142.3, peak: 289.1 },
        latency: { current: 12.4, average: 15.2, p95: 28.7 },
        topTalkers: [
          { ip: '192.168.1.100', bytes: 1024000, flows: 45 },
          { ip: '10.0.1.50', bytes: 856000, flows: 32 },
          { ip: '172.16.1.25', bytes: 743000, flows: 28 },
        ],
      }));
    };

    initializeData();
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Generate new flow and potentially an anomaly
      const isAnomalous = Math.random() < 0.1; // 10% chance of anomaly
      const flow = dataGenerator.generateFlow(isAnomalous);

      if (isAnomalous) {
        const anomaly = dataGenerator.generateAnomaly(flow);
        const alarm = dataGenerator.generateAlarm(anomaly);

        setAnomalies(prev => [anomaly, ...prev.slice(0, 19)]); // Keep last 20
        setAlarms(prev => [alarm, ...prev.slice(0, 19)]); // Keep last 20

        setMetrics(prev => ({
          ...prev,
          anomaliesDetected: prev.anomaliesDetected + 1,
          activeAlarms: prev.activeAlarms + 1,
        }));
      }

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        totalFlows: prev.totalFlows + 1,
        throughput: {
          ...prev.throughput,
          current: 120 + Math.random() * 80,
        },
        latency: {
          ...prev.latency,
          current: 10 + Math.random() * 20,
        },
      }));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isSimulating]);

  const startSimulation = () => setIsSimulating(true);
  const stopSimulation = () => setIsSimulating(false);

  const startDDoSDemo = () => {
    // Simulate DDoS attack
    const targetIp = '192.168.1.100';
    dataGenerator.generateDDoSAttack(targetIp, 60);

    // Generate multiple anomalies quickly
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const flow = dataGenerator.generateFlow(true);
        flow.destinationIp = targetIp;
        flow.bytes = 5000000 + Math.random() * 5000000; // Large volume

        const anomaly = dataGenerator.generateAnomaly(flow);
        anomaly.type = 'volume';
        anomaly.severity = 'critical';
        anomaly.description = `DDoS attack detected: Massive traffic volume to ${targetIp}`;

        const alarm = dataGenerator.generateAlarm(anomaly);
        alarm.title = 'CRITICAL: DDoS Attack Detected';
        alarm.severity = 'critical';

        setAnomalies(prev => [anomaly, ...prev]);
        setAlarms(prev => [alarm, ...prev]);
      }, i * 500); // Stagger the anomalies
    }
  };

  if (!topology) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing Network Topology...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        onStartSimulation={startSimulation}
        onStopSimulation={stopSimulation}
        onStartDDoSDemo={startDDoSDemo}
        isSimulating={isSimulating}
      />

      <div className="container mx-auto p-6 space-y-6">
        {/* Metrics Overview */}
        <MetricsOverview metrics={metrics} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network Visualization - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <NetworkVisualization topology={topology} anomalies={anomalies} />
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <AlarmPanel alarms={alarms} />
            <AnomalyList anomalies={anomalies.slice(0, 5)} />
          </div>
        </div>

        {/* Flow Analytics */}
        <FlowAnalytics metrics={metrics} />
      </div>
    </div>
  );
}
