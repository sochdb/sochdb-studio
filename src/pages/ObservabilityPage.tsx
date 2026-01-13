import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Clock, Database, AlertCircle } from 'lucide-react';
import { api, DatabaseStats } from '../lib/api';

export const ObservabilityPage = () => {
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [history, setHistory] = useState<{ time: string; tables: number; rows: number }[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.admin.getStats();
                setStats(data);

                // Maintain a small history for charts
                setHistory(prev => {
                    const now = new Date();
                    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                    const newPoint = { time: timeStr, tables: data.total_tables, rows: data.total_rows };
                    // Keep last 20 points
                    return [...prev.slice(-19), newPoint];
                });
            } catch (e) {
                console.error("Failed to fetch stats", e);
            }
        };

        // Poll every 2 seconds
        fetchStats();
        const interval = setInterval(fetchStats, 2000);
        return () => clearInterval(interval);
    }, []);

    // Backend doesn't support traces yet
    const traceData: any[] = [];

    if (!stats) return <div className="p-8 text-text-muted">Loading stats...</div>;

    return (
        <div className="flex flex-col h-full animate-in p-8 overflow-y-auto">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-text-default mb-2">Observability</h1>
                <p className="text-text-muted">Monitor database performance (Realtime from Backend)</p>
            </header>

            {/* Matrix Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { title: 'Uptime', value: `${stats.uptime_seconds}s`, change: 'Running', icon: Clock, color: 'text-yellow-400' },
                    { title: 'Total Tables', value: stats.total_tables, change: 'Count', icon: Activity, color: 'text-teal' },
                    { title: 'Total Rows', value: stats.total_rows, change: 'Records', icon: Database, color: 'text-blue-400' },
                    { title: 'Version', value: stats.version, change: 'Build', icon: AlertCircle, color: 'text-green-400' },
                ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border-default bg-background-muted/30 flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-background-app border border-border-default ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-text-muted uppercase tracking-wider">{stat.title}</p>
                            <div className="flex items-end gap-2">
                                <span className="text-xl font-bold text-text-default">{stat.value}</span>
                                <span className="text-xs text-text-muted">{stat.change}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Tables Chart (Real) */}
                <div className="p-6 rounded-xl border border-border-default bg-background-muted/30">
                    <h3 className="font-semibold text-text-default mb-4">Total Rows (Live)</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorRows" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="step" dataKey="rows" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorRows)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Throughput Chart (Real Tables Count - Proxy) */}
                <div className="p-6 rounded-xl border border-border-default bg-background-muted/30">
                    <h3 className="font-semibold text-text-default mb-4">Total Tables (Live)</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="tables" fill="#13bbaf" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Traces */}
            <div className="flex-1 rounded-xl border border-border-default bg-background-muted/30 overflow-hidden flex flex-col min-h-[300px]">
                <div className="p-4 border-b border-border-default">
                    <h3 className="font-semibold text-text-default">Recent Traces</h3>
                </div>
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-background-muted/50 text-text-muted font-medium sticky top-0">
                            <tr>
                                <th className="px-4 py-3">Trace ID</th>
                                <th className="px-4 py-3">Timestamp</th>
                                <th className="px-4 py-3">Operation</th>
                                <th className="px-4 py-3">Duration</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-default">
                            {traceData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                                        No active traces available.
                                    </td>
                                </tr>
                            ) : (
                                traceData.map((trace, i) => (
                                    <tr key={i} className="hover:bg-background-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-mono text-teal">{trace.id}</td>
                                        <td className="px-4 py-3 text-text-muted">{trace.timestamp}</td>
                                        <td className="px-4 py-3 text-text-default font-mono">{trace.operation}</td>
                                        <td className="px-4 py-3 text-text-muted">{trace.duration}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${trace.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                }`}>{trace.status.toUpperCase()}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
