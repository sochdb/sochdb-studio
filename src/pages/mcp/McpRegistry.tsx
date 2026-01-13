import { useState, useEffect } from 'react';
import { Wrench, Package, ArrowRight, RefreshCw } from 'lucide-react';
import { api, McpTool } from '../../lib/api';

export const McpRegistry = ({ onSelectTool }: { onSelectTool?: (name: string) => void }) => {
    const [tools, setTools] = useState<McpTool[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadTools = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.mcp.listTools();
            // Try to extract tools array from potentially nested response
            const list = res?.tools || (Array.isArray(res) ? res : []) || [];

            if (Array.isArray(list) && list.length > 0) {
                setTools(list);
            } else {
                // Fallback if empty but success
                setTools([]);
            }
        } catch (e: any) {
            console.error("Failed to list tools:", e);
            // Fallback for UI visualization if backend fails
            if (import.meta.env.MODE === 'development') {
                setTools([
                    { name: 'sochdb_list_tables', description: 'List all tables (Fallback)' },
                    { name: 'sochdb_query', description: 'Execute a SQL query (Fallback)' },
                ]);
                setError("Could not fetch tools from backend (showing defaults)");
            } else {
                setError("Failed to load tools. Is the database connected?");
                setTools([]);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadTools();
    }, []);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-text-default">Available Tools</h3>
                <button onClick={loadTools} className="p-2 hover:bg-background-muted rounded-lg text-text-muted hover:text-text-default transition-colors">
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-200">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4">
                {tools.map((tool, i) => (
                    <div key={i} className="group bg-background-muted/30 border border-border-default hover:border-teal/50 rounded-xl p-4 transition-all hover:bg-background-muted/50 flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 bg-teal/10 rounded-lg text-teal">
                                <Wrench size={18} />
                            </div>
                            <div className="px-2 py-1 bg-background-app rounded text-[10px] font-mono text-text-muted border border-border-default">
                                mcp:sochdb
                            </div>
                        </div>
                        <h4 className="font-mono text-sm font-semibold text-text-default mb-2 group-hover:text-teal transition-colors">
                            {tool.name}
                        </h4>
                        <p className="text-xs text-text-muted flex-1 mb-4 line-clamp-2">
                            {tool.description || "No description provided."}
                        </p>

                        <button
                            onClick={() => onSelectTool?.(tool.name)}
                            className="flex items-center justify-between w-full px-3 py-2 bg-background-app hover:bg-teal hover:text-white rounded-lg text-xs font-medium text-text-muted transition-all group-hover:border-transparent border border-border-default"
                        >
                            <span>Test in Playground</span>
                            <ArrowRight size={12} />
                        </button>
                    </div>
                ))}

                {tools.length === 0 && !loading && !error && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-text-muted opacity-50">
                        <Package size={48} className="mb-4" />
                        <p>No tools found</p>
                    </div>
                )}
            </div>
        </div>
    );
};
