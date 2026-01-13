import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Play, Terminal, Trash2 } from 'lucide-react';

export const ToolPlayground = () => {
    const [toolName, setToolName] = useState('');
    const [argsJson, setArgsJson] = useState('{}');
    const [result, setResult] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

    const handleRun = async () => {
        if (!toolName) return;
        setStatus('running');
        setResult(null);
        try {
            const args = JSON.parse(argsJson);
            const res: any = await invoke('mcp_call_tool', {
                toolName,
                arguments: args
            });

            // Format output based on MCP response structure
            // Usually res.content is an array of TextContent | ImageContent
            if (res && res.content) {
                setResult(JSON.stringify(res.content, null, 2));
            } else {
                setResult(JSON.stringify(res, null, 2));
            }
            setStatus('success');
        } catch (e: any) {
            setResult(`Error: ${e?.message || e}`);
            setStatus('error');
        }
    };

    return (
        <div className="flex h-full gap-4">
            {/* Input Pane */}
            <div className="w-1/2 flex flex-col gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Tool Name</label>
                    <input
                        type="text"
                        value={toolName}
                        onChange={e => setToolName(e.target.value)}
                        placeholder="e.g. sochdb_list_tables"
                        className="w-full bg-background-muted/50 border border-border-default rounded-lg px-4 py-2.5 text-text-default text-sm focus:ring-2 focus:ring-teal/50 outline-none font-mono"
                    />
                </div>

                <div className="flex-1 flex flex-col space-y-2">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Arguments (JSON)</label>
                    <textarea
                        value={argsJson}
                        onChange={e => setArgsJson(e.target.value)}
                        className="flex-1 bg-background-muted/50 border border-border-default rounded-lg p-4 text-text-default text-sm focus:ring-2 focus:ring-teal/50 outline-none font-mono resize-none leading-relaxed"
                        spellCheck={false}
                    />
                </div>

                <button
                    onClick={handleRun}
                    disabled={status === 'running' || !toolName}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-teal hover:bg-teal/90 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal/20"
                >
                    {status === 'running' ? (
                        <>Running...</>
                    ) : (
                        <><Play size={18} /> Run Tool</>
                    )}
                </button>
            </div>

            {/* Output Pane */}
            <div className="w-1/2 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Output</span>
                    {result && (
                        <button onClick={() => { setResult(null); setStatus('idle'); }} className="text-xs text-text-muted hover:text-red-400 flex items-center gap-1 transition-colors">
                            <Trash2 size={12} /> Clear
                        </button>
                    )}
                </div>
                <div className={`flex-1 rounded-xl border border-border-default bg-black/40 p-4 font-mono text-sm overflow-auto ${status === 'error' ? 'border-red-500/30' :
                        status === 'success' ? 'border-teal/30' : ''
                    }`}>
                    {result ? (
                        <pre className={status === 'error' ? 'text-red-400' : 'text-text-default'}>{result}</pre>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-30">
                            <Terminal size={48} className="mb-4" />
                            <p>Run a tool to see output</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
