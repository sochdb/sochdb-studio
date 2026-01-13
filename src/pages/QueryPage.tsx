import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Play, Bug, Terminal } from 'lucide-react';

export const QueryPage = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ columns: string[], rows: any[][] } | null>(null);
    const [queryError, setQueryError] = useState<string | null>(null);

    const runQuery = async () => {
        if (!query.trim()) return;
        setQueryError(null);
        try {
            const res: any = await invoke('execute_query', { query });
            // Handle both array format (columns, rows) and object format
            if (res.columns && res.rows) {
                setResults({ columns: res.columns, rows: res.rows });
            } else if (Array.isArray(res)) {
                // Legacy format: array of objects
                const cols = res.length > 0 ? Object.keys(res[0]) : [];
                const rows = res.map((r: any) => cols.map(c => r[c]));
                setResults({ columns: cols, rows: rows });
            } else {
                setResults({ columns: ['Result'], rows: [[JSON.stringify(res)]] });
            }
        } catch (e: any) {
            console.error(e);
            setQueryError(e?.message || 'Error executing query');
            setResults(null);
        }
    };

    return (
        <div className="flex flex-col h-full animate-in pr-3 pb-3 pt-3">
            <div className="glass-panel flex-1 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                <div className="h-12 border-b border-border-default bg-background-muted/50 flex items-center justify-between px-4">
                    <span className="text-xs font-mono text-text-muted">QUERY EDITOR</span>
                    <button onClick={runQuery} className="flex items-center gap-2 px-3 py-1.5 bg-teal hover:bg-teal/90 text-white text-xs font-semibold rounded transition-colors">
                        <Play size={12} /> Run
                    </button>
                </div>
                <div className="h-1/3 bg-background-app/50 relative">
                    <textarea
                        className="w-full h-full bg-transparent text-text-default font-mono text-sm p-4 outline-none resize-none code-editor placeholder:text-text-muted/30"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="SELECT * FROM users WHERE id = 1..."
                    />
                </div>
                <div className="flex-1 border-t border-border-default bg-background-default flex flex-col">
                    <div className="px-4 py-2 border-b border-border-default bg-background-muted/30 text-xs font-semibold text-text-muted">RESULTS</div>
                    <div className="flex-1 p-4 overflow-auto">
                        {queryError ? (
                            <div className="h-full flex flex-col items-center justify-center text-red-400">
                                <Bug size={48} className="mb-4" />
                                <p className="text-sm font-mono">{queryError}</p>
                            </div>
                        ) : results ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        {results.columns.map((col, i) => (
                                            <th key={i} className="p-2 text-xs font-mono text-text-muted border-b border-border-default">{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.rows.map((row, i) => (
                                        <tr key={i} className="hover:bg-white/5">
                                            {row.map((v: any, j: number) => (
                                                <td key={j} className="p-2 text-sm text-text-default border-b border-border-default/50 font-mono">{String(v)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                                <Terminal size={48} className="mb-4" />
                                <p>Execute a query to see results</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
