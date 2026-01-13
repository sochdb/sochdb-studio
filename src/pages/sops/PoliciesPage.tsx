import { useState, useEffect } from 'react';
import { Shield, Activity, FileText, AlertTriangle, Edit2, Check } from 'lucide-react';
import { api, CommandPolicy } from '../../lib/api';

export const PoliciesPage = () => {
    const [activeTab, setActiveTab] = useState<'quotas' | 'guardrails' | 'audit'>('quotas');
    const [policy, setPolicy] = useState<CommandPolicy | null>(null);

    // Mock Data for Quotas (since policy api is just command allowlist for now)
    const [quotas, setQuotas] = useState([
        { id: 'q1', resource: 'Tokens / Minute', limit: 10000, current: 4500, editing: false },
        { id: 'q2', resource: 'Concurrent Queries', limit: 50, current: 12, editing: false },
        { id: 'q3', resource: 'Storage (GB)', limit: 5, current: 1.2, editing: false },
    ]);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const p = await api.admin.getPolicy();
                setPolicy(p);
            } catch (e) {
                console.error(e);
            }
        };
        fetchPolicy();
    }, []);

    const handleLimitChange = (id: string, newLimit: string) => {
        const num = parseInt(newLimit);
        if (!isNaN(num)) {
            setQuotas(prev => prev.map(q => q.id === id ? { ...q, limit: num } : q));
        }
    };

    const toggleEdit = (id: string) => {
        setQuotas(prev => prev.map(q => q.id === id ? { ...q, editing: !q.editing } : q));
    };

    return (
        <div className="flex flex-col h-full animate-in p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-text-default mb-2">Policies & Quotas</h1>
                <p className="text-text-muted">Manage usage limits, safety guardrails, and audit logs</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-border-default mb-8">
                {[
                    { id: 'quotas', label: 'Quotas', icon: Activity },
                    { id: 'guardrails', label: 'Guardrails', icon: Shield },
                    { id: 'audit', label: 'Audit Log', icon: FileText }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                            ? 'text-teal border-teal'
                            : 'text-text-muted border-transparent hover:text-text-default'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-auto">
                {activeTab === 'quotas' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quotas.map(quota => (
                            <div key={quota.id} className="p-6 rounded-xl border border-border-default bg-background-muted/30">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-semibold text-text-default">{quota.resource}</h3>
                                    <button onClick={() => toggleEdit(quota.id)} className="text-text-muted hover:text-teal transition-colors">
                                        {quota.editing ? <Check size={16} /> : <Edit2 size={16} />}
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="text-2xl font-mono text-text-default">
                                            {quota.editing ? (
                                                <input
                                                    type="number"
                                                    className="w-24 bg-background-app border border-border-default rounded px-2 py-1 text-sm outline-none focus:border-teal"
                                                    value={quota.limit}
                                                    onChange={(e) => handleLimitChange(quota.id, e.target.value)}
                                                />
                                            ) : (
                                                quota.limit.toLocaleString()
                                            )}
                                            <span className="text-sm text-text-muted ml-2 font-sans font-normal">limit</span>
                                        </div>
                                        <div className={`text-sm ${quota.current > quota.limit ? 'text-red-400' : 'text-teal'}`}>
                                            {Math.round((quota.current / quota.limit) * 100)}% used
                                        </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="h-2 bg-background-app rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${quota.current > quota.limit ? 'bg-red-500' : 'bg-teal'}`}
                                            style={{ width: `${Math.min(100, (quota.current / quota.limit) * 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-text-muted">Current usage: {quota.current.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'guardrails' && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-border-default bg-background-muted/30 flex items-start gap-4">
                            <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <h3 className="font-semibold text-text-default">Current Policy Mode</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-mono text-teal bg-teal/10 px-2 py-0.5 rounded">
                                            {policy?.mode || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-text-muted pt-2">
                                    Allowed commands: {policy?.allowed_commands.join(', ') || 'None'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="rounded-xl border border-border-default overflow-hidden">
                        <table className="w-full text-sm text-left">
                            {/* ... Keep audit mock for now ... */}
                            <thead className="bg-background-muted/50 text-text-muted font-medium">
                                <tr>
                                    <th className="px-4 py-3">Time</th>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Action</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-default">
                                {[
                                    { time: '10:42:01', user: 'admin', action: 'UPDATE_QUOTA', status: 'Success', details: 'Increased Token Limit' },
                                    { time: '10:41:55', user: 'system', action: 'AUTO_SCALE', status: 'Success', details: 'Added new node' },
                                ].map((log, i) => (
                                    <tr key={i} className="hover:bg-background-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-mono text-text-muted">{log.time}</td>
                                        <td className="px-4 py-3 text-teal">{log.user}</td>
                                        <td className="px-4 py-3 text-text-default font-medium">{log.action}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${log.status === 'Success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                }`}>{log.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-text-muted">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
