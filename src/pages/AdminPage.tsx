import { useState } from 'react';
// import { invoke } from '@tauri-apps/api/core';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

export const AdminPage = () => {
    const [confirming, setConfirming] = useState<string | null>(null);

    const handleAction = async (action: string) => {
        if (confirming !== action) {
            setConfirming(action);
            return;
        }

        try {
            // Placeholder for admin commands
            console.log(`Executing admin action: ${action}`);
            // await invoke('admin_action', { action });
        } catch (e) {
            console.error(e);
        }
        setConfirming(null);
    };

    return (
        <div className="flex flex-col h-full animate-in p-8 text-text-default">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldAlert size={32} className="text-red-500" />
                    <h1 className="text-3xl font-bold">Admin Console</h1>
                </div>
                <p className="text-text-muted">System-level controls and danger zone. Proceed with caution.</p>
            </header>

            <div className="max-w-3xl space-y-8">
                {/* System Controls */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 border-b border-border-default pb-2">System Controls</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 rounded-xl border border-border-default bg-background-muted/30 flex justify-between items-center">
                            <div>
                                <h3 className="font-medium">Restart Service</h3>
                                <p className="text-sm text-text-muted mt-1">Restart the core database engine</p>
                            </div>
                            <button
                                onClick={() => handleAction('restart')}
                                className="p-2 bg-background-app hover:bg-background-medium border border-border-default rounded-lg transition-colors"
                            >
                                <RefreshCcw size={20} className={confirming === 'restart' ? 'text-yellow-400' : 'text-text-muted'} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 border-b border-border-default pb-2 text-red-400">Danger Zone</h2>
                    <div className="border border-red-500/30 rounded-xl overflow-hidden divide-y divide-red-500/20 bg-red-500/5">
                        <div className="p-6 flex justify-between items-center">
                            <div>
                                <h3 className="font-medium text-text-default">Clear All Data</h3>
                                <p className="text-sm text-text-muted mt-1">Permanently delete all tables, vectors, and KV pairs.</p>
                            </div>
                            <button
                                onClick={() => handleAction('clear_all')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${confirming === 'clear_all'
                                        ? 'bg-red-500 text-white animate-pulse'
                                        : 'bg-background-app border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white'
                                    }`}
                            >
                                {confirming === 'clear_all' ? 'Click to Confirm' : 'Clear Data'}
                            </button>
                        </div>

                        <div className="p-6 flex justify-between items-center">
                            <div>
                                <h3 className="font-medium text-text-default">Drop Database</h3>
                                <p className="text-sm text-text-muted mt-1">Destroy the entire database instance and configuration.</p>
                            </div>
                            <button
                                onClick={() => handleAction('drop_db')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${confirming === 'drop_db'
                                        ? 'bg-red-500 text-white animate-pulse'
                                        : 'bg-background-app border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white'
                                    }`}
                            >
                                {confirming === 'drop_db' ? 'Click to Confirm' : 'Drop Database'}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
