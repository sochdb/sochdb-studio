import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const ConsolePage = () => {
    const [consoleInput, setConsoleInput] = useState('');
    const [consoleHistory, setConsoleHistory] = useState<{ type: 'input' | 'output' | 'error', text: string }[]>([
        { type: 'output', text: 'Welcome to SochDB Console. Type \'help\' for available commands.' }
    ]);

    const executeConsoleCommand = async () => {
        if (!consoleInput.trim()) return;

        const cmd = consoleInput.trim();
        setConsoleHistory(prev => [...prev, { type: 'input', text: `sochdb> ${cmd}` }]);
        setConsoleInput('');

        // Parse and execute command
        const parts = cmd.split(/\s+/);
        const command = parts[0].toLowerCase();

        try {
            let result = '';

            switch (command) {
                case 'help':
                    result = `Available commands:
  help              - Show this help
  list              - List all tables
  get <path>        - Get value at path
  put <path> <json> - Store value at path
  delete <path>     - Delete value at path
  describe <table>  - Show table schema
  query <sql>       - Execute a query
  create-sample     - Create sample data
  clear             - Clear console`;
                    break;

                case 'clear':
                    setConsoleHistory([{ type: 'output', text: 'Console cleared.' }]);
                    return;

                case 'list':
                    const listRes: any = await invoke('mcp_call_tool', {
                        toolName: 'sochdb_list_tables',
                        arguments: {}
                    });
                    const rawListOutput = listRes?.content?.[0]?.text || '';
                    // Parse toon format and format nicely
                    const listLines = rawListOutput.split('\n').filter((t: string) => t.trim());
                    const listDataLines = listLines.filter((line: string) => !line.startsWith('results['));
                    if (listDataLines.length > 0) {
                        result = 'Tables:\n' + listDataLines.map((line: string) => {
                            const tableName = line.split(',')[0]?.trim();
                            return `  • ${tableName}`;
                        }).join('\n');
                    } else {
                        result = 'No tables found. Try: create-sample';
                    }
                    break;

                case 'get':
                    if (parts.length < 2) {
                        result = 'Usage: get <path>';
                    } else {
                        const getRes: any = await invoke('mcp_call_tool', {
                            toolName: 'sochdb_get',
                            arguments: { path: parts[1] }
                        });
                        result = getRes?.content?.[0]?.text || 'Not found';
                    }
                    break;

                case 'put':
                    if (parts.length < 3) {
                        result = 'Usage: put <path> <json>';
                    } else {
                        const path = parts[1];
                        const valueStr = parts.slice(2).join(' ');
                        const value = JSON.parse(valueStr);
                        await invoke('mcp_call_tool', {
                            toolName: 'sochdb_put',
                            arguments: { path, value }
                        });
                        result = `✓ Stored at ${path}`;
                    }
                    break;

                case 'delete':
                    if (parts.length < 2) {
                        result = 'Usage: delete <path>';
                    } else {
                        await invoke('mcp_call_tool', {
                            toolName: 'sochdb_delete',
                            arguments: { path: parts[1] }
                        });
                        result = `✓ Deleted ${parts[1]}`;
                    }
                    break;

                case 'describe':
                    if (parts.length < 2) {
                        result = 'Usage: describe <table>';
                    } else {
                        const descRes: any = await invoke('mcp_call_tool', {
                            toolName: 'sochdb_describe',
                            arguments: { table: parts[1] }
                        });
                        result = descRes?.content?.[0]?.text || 'Table not found';
                    }
                    break;

                case 'query':
                    if (parts.length < 2) {
                        result = 'Usage: query <sql>';
                    } else {
                        const queryStr = parts.slice(1).join(' ');
                        const queryRes: any = await invoke('mcp_call_tool', {
                            toolName: 'sochdb_query',
                            arguments: { query: queryStr }
                        });
                        result = queryRes?.content?.[0]?.text || 'No results';
                    }
                    break;

                case 'create-sample':
                    // Create users table with sample data
                    await invoke('mcp_call_tool', {
                        toolName: 'sochdb_put',
                        arguments: { path: 'users/1', value: { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' } }
                    });
                    await invoke('mcp_call_tool', {
                        toolName: 'sochdb_put',
                        arguments: { path: 'users/2', value: { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' } }
                    });
                    await invoke('mcp_call_tool', {
                        toolName: 'sochdb_put',
                        arguments: { path: 'users/3', value: { id: 3, name: 'Carol', email: 'carol@example.com', role: 'user' } }
                    });
                    await invoke('mcp_call_tool', {
                        toolName: 'sochdb_put',
                        arguments: { path: 'products/1', value: { id: 1, name: 'Widget', price: 29.99, stock: 100 } }
                    });
                    await invoke('mcp_call_tool', {
                        toolName: 'sochdb_put',
                        arguments: { path: 'products/2', value: { id: 2, name: 'Gadget', price: 49.99, stock: 50 } }
                    });
                    result = "✓ Created sample data: users/1, users/2, users/3, products/1, products/2";
                    // Note: need to refresh tables potentially, but for now just output
                    break;

                default:
                    // Try as a query
                    const defaultRes: any = await invoke('mcp_call_tool', {
                        toolName: 'sochdb_query',
                        arguments: { query: cmd }
                    });
                    result = defaultRes?.content?.[0]?.text || 'Unknown command. Type "help" for available commands.';
            }

            setConsoleHistory(prev => [...prev, { type: 'output', text: result }]);

        } catch (e: any) {
            setConsoleHistory(prev => [...prev, { type: 'error', text: `Error: ${e?.message || e}` }]);
        }
    };

    return (
        <div className="flex flex-col h-full animate-in p-8">
            <header className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-text-default mb-2">Console</h1>
                    <p className="text-text-muted">Interactive SochQL REPL</p>
                </div>
            </header>
            <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden">
                {/* Output area */}
                <div className="flex-1 p-4 font-mono text-sm overflow-auto">
                    {consoleHistory.map((entry, i) => (
                        <div key={i} className={`mb-1 ${entry.type === 'input' ? 'text-teal' :
                            entry.type === 'error' ? 'text-red-400' :
                                'text-text-muted'
                            }`}>
                            <pre className="whitespace-pre-wrap">{entry.text}</pre>
                        </div>
                    ))}
                </div>
                {/* Input area */}
                <div className="border-t border-border-default bg-background-muted/30 p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-teal font-mono">sochdb&gt;</span>
                        <input
                            type="text"
                            value={consoleInput}
                            onChange={(e) => setConsoleInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    executeConsoleCommand();
                                }
                            }}
                            placeholder="Type a command... (try 'help')"
                            className="flex-1 bg-transparent outline-none text-text-default font-mono placeholder:text-text-muted/50"
                            autoFocus
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
