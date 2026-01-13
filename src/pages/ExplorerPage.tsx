import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Database, Search } from 'lucide-react';

export const ExplorerPage = () => {

    const [tables, setTables] = useState<string[]>([]);
    const [kvKeys, setKvKeys] = useState<string[]>([]);
    const [kvLoading, setKvLoading] = useState(false);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const [kvSearch, setKvSearch] = useState('');
    const [selectedTable, setSelectedTable] = useState<string>('');

    useEffect(() => {
        loadTables();
    }, []);

    const loadTables = async () => {
        try {
            const res: any = await invoke('mcp_call_tool', {
                toolName: 'sochdb_list_tables',
                arguments: {}
            });
            if (res && res.content) {
                const content = res.content[0]?.text || '';
                const lines = content.split('\n').filter((t: string) => t.trim());
                const dataLines = lines.filter((line: string) => !line.startsWith('results['));
                const tableNames = dataLines.map((line: string) => {
                    const parts = line.split(',');
                    return parts[0]?.trim() || '';
                }).filter((name: string) => name && name !== 'null');
                setTables(tableNames);
            }
        } catch (e) {
            console.error('Failed to load tables', e);
        }
    };

    const refreshKvExplorer = async (tableToScan?: string) => {
        const table = tableToScan || selectedTable;
        if (!table) {
            setKvKeys([]);
            return;
        }

        setKvLoading(true);
        setKvKeys([]);
        setSelectedKey(null);
        setSelectedValue(null);

        try {
            const scanRes: any = await invoke('mcp_call_tool', {
                toolName: 'sochdb_query',
                arguments: { query: `SELECT * FROM ${table}`, limit: 50, format: 'json' }
            });
            let keys: string[] = [];
            if (scanRes && scanRes.content) {
                const scanContent = scanRes.content[0]?.text || '';
                try {
                    const jsonData = JSON.parse(scanContent);
                    if (Array.isArray(jsonData)) {
                        for (const item of jsonData) {
                            if (item._path) keys.push(item._path);
                        }
                    }
                } catch {
                    const scanLines = scanContent.split('\n').filter((t: string) => t.trim());
                    for (const line of scanLines) {
                        if (line.startsWith('results[')) continue;
                        const firstField = line.split(',')[0]?.trim();
                        if (firstField && firstField.startsWith('/')) {
                            keys.push(firstField);
                        } else if (firstField && /^[a-zA-Z0-9_-]+$/.test(firstField)) {
                            keys.push(`/${table}/${firstField}`);
                        }
                    }
                }
            }
            setKvKeys(keys.length > 0 ? keys : [`No records in ${table}`]);
        } catch (e) {
            setKvKeys([`Error scanning ${table}`]);
        }
        setKvLoading(false);
    };

    const getKeyValue = async (key: string) => {
        setSelectedKey(key);
        try {
            const res: any = await invoke('mcp_call_tool', {
                toolName: 'sochdb_get',
                arguments: { path: key }
            });
            if (res && res.content) {
                setSelectedValue(res.content[0]?.text || JSON.stringify(res, null, 2));
            }
        } catch (e: any) {
            setSelectedValue(`Error: ${e?.message || e}`);
        }
    };

    const filteredKeys = kvKeys.filter(k => k.toLowerCase().includes(kvSearch.toLowerCase()));

    return (
        <div className="flex flex-col h-full animate-in p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-text-default mb-2">KV Explorer</h1>
                <p className="text-text-muted">Browse key-value pairs stored in SochDB</p>
            </header>
            <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex">
                <div className="w-1/3 border-r border-border-default flex flex-col">
                    <div className="h-12 border-b border-border-default bg-background-muted/50 flex items-center px-4 gap-2">
                        <select
                            value={selectedTable}
                            onChange={(e) => {
                                setSelectedTable(e.target.value);
                                if (e.target.value) refreshKvExplorer(e.target.value);
                                else setKvKeys([]);
                            }}
                            className="flex-1 bg-background-app border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-default outline-none focus:ring-1 focus:ring-teal/50"
                        >
                            <option value="">Select a table...</option>
                            {tables.map((t, i) => (
                                <option key={i} value={t}>{t}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => refreshKvExplorer()}
                            disabled={!selectedTable}
                            className="px-3 py-1.5 bg-teal hover:bg-teal/90 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {kvLoading ? '...' : 'Refresh'}
                        </button>
                    </div>
                    {selectedTable && (
                        <div className="h-10 border-b border-border-default bg-background-muted/30 flex items-center px-4">
                            <input
                                type="text"
                                value={kvSearch}
                                onChange={(e) => setKvSearch(e.target.value)}
                                placeholder="Filter keys..."
                                className="flex-1 bg-transparent text-sm text-text-default outline-none placeholder:text-text-muted/50"
                            />
                        </div>
                    )}
                    <div className="flex-1 overflow-auto">
                        {!selectedTable ? (
                            <div className="p-4 text-center text-text-muted opacity-60 h-full flex flex-col items-center justify-center">
                                <Database size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Select a table to browse</p>
                            </div>
                        ) : filteredKeys.length > 0 ? (
                            <div className="divide-y divide-border-default">
                                {filteredKeys.map((key, i) => (
                                    <button key={i} onClick={() => getKeyValue(key)}
                                        className={`w-full text-left px-4 py-3 text-sm font-mono hover:bg-background-muted/50 transition-colors ${selectedKey === key ? 'bg-teal/10 text-teal' : 'text-text-default'}`}>
                                        {key}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-text-muted opacity-60">
                                <p className="text-sm">{kvLoading ? 'Loading...' : `No records in ${selectedTable}`}</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="h-12 border-b border-border-default bg-background-muted/50 flex items-center px-4">
                        <span className="text-xs font-mono text-text-muted">
                            {selectedKey ? `Key: ${selectedKey}` : 'Select a key to view its value'}
                        </span>
                    </div>
                    <div className="flex-1 p-4 overflow-auto">
                        {selectedValue ? (
                            <pre className="text-sm font-mono text-text-default whitespace-pre-wrap bg-background-muted/30 rounded-lg p-4">
                                {selectedValue}
                            </pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                                <Search size={48} className="mb-4" />
                                <p>Select a key from the list</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
