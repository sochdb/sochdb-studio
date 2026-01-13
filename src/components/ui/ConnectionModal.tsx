import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { SochIcon } from '../../layouts/TitleBar';
import { Database, ArrowRight, Folder, Globe, AlertCircle } from 'lucide-react';

interface ConnectionModalProps {
    onConnect: (path: string, mode?: string) => void;
    onCancel?: () => void;
}

type ConnectionMode = 'embedded' | 'remote';

export const ConnectionModal = ({ onConnect, onCancel }: ConnectionModalProps) => {
    const [mode, setMode] = useState<ConnectionMode>('embedded');
    const [dbPath, setDbPath] = useState('');
    const [remoteUrl, setRemoteUrl] = useState('');

    async function pickDir() {
        try {
            const selected = await open({ directory: true });
            if (selected) setDbPath(selected as string);
        } catch (e) {
            console.error(e);
        }
    }

    const handleConnect = () => {
        if (mode === 'embedded') {
            onConnect(dbPath, 'embedded');
        } else {
            onConnect(remoteUrl, 'remote');
        }
    };

    const isValid = mode === 'embedded' ? !!dbPath : !!remoteUrl;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-background-default border border-border-default rounded-2xl w-full max-w-4xl flex overflow-hidden shadow-2xl h-[500px]">
                {/* Sidebar */}
                <div className="w-72 bg-background-muted/50 border-r border-border-default p-6 flex flex-col gap-2">
                    <h2 className="text-lg font-bold text-text-default mb-6 flex items-center gap-2">
                        <SochIcon size={24} /> SochDB
                    </h2>
                    <button
                        onClick={() => setMode('embedded')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${mode === 'embedded'
                            ? 'bg-background-app border border-teal/50 text-text-default shadow-sm'
                            : 'hover:bg-background-muted text-text-muted'
                            }`}
                    >
                        <Database size={18} className={mode === 'embedded' ? 'text-teal' : ''} />
                        <div className="text-left">
                            <div className="text-sm font-semibold">Local Storage</div>
                            <div className="text-[10px] text-text-muted">Embedded LSM Engine</div>
                        </div>
                    </button>
                    <button
                        onClick={() => setMode('remote')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${mode === 'remote'
                            ? 'bg-background-app border border-orange-500/50 text-text-default shadow-sm'
                            : 'hover:bg-background-muted text-text-muted'
                            }`}
                    >
                        <Globe size={18} className={mode === 'remote' ? 'text-orange-400' : ''} />
                        <div className="text-left">
                            <div className="text-sm font-semibold">Remote Server</div>
                            <div className="text-[10px] text-text-muted">Connect via gRPC</div>
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 flex flex-col bg-mesh relative">
                    {mode === 'embedded' ? (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-text-default mb-2">Connect to Local Database</h1>
                                <p className="text-text-muted">Select a directory to initialize or load a SochDB instance.</p>
                            </div>

                            <div className="space-y-4 max-w-lg">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Data Directory</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={dbPath}
                                        onChange={(e) => setDbPath(e.target.value)}
                                        placeholder="/path/to/data"
                                        className="flex-1 bg-background-input border border-border-input rounded-lg px-4 py-2.5 text-text-default text-sm focus:ring-2 focus:ring-teal/50 outline-none transition-all placeholder:text-text-muted/50"
                                    />
                                    <button onClick={pickDir} className="px-4 py-2 bg-background-muted border border-border-default hover:bg-background-medium rounded-lg text-text-muted hover:text-text-default transition-colors">
                                        <Folder size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-text-default mb-2">Connect to Remote Server</h1>
                                <p className="text-text-muted">Enter the gRPC endpoint of a running SochDB server.</p>
                            </div>

                            <div className="space-y-4 max-w-lg">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Server URL</label>
                                <input
                                    type="text"
                                    value={remoteUrl}
                                    onChange={(e) => setRemoteUrl(e.target.value)}
                                    placeholder="http://localhost:50051"
                                    className="w-full bg-background-input border border-border-input rounded-lg px-4 py-2.5 text-text-default text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all placeholder:text-text-muted/50"
                                />

                                {/* Coming Soon Notice */}
                                <div className="mt-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                                    <AlertCircle size={18} className="text-orange-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-medium text-orange-300">Coming Soon</div>
                                        <div className="text-xs text-orange-200/70 mt-1">
                                            Remote gRPC connections are not yet fully implemented.
                                            Use local storage mode for now.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="mt-auto flex justify-end gap-3">
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                className="px-6 py-3 text-text-muted hover:text-text-default transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={handleConnect}
                            disabled={!isValid}
                            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'embedded'
                                ? 'bg-teal hover:bg-teal/90 text-white shadow-teal/20'
                                : 'bg-orange-500 hover:bg-orange-500/90 text-white shadow-orange-500/20'
                                }`}
                        >
                            Connect <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
