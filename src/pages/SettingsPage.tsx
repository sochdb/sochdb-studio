import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useOutletContext } from 'react-router-dom';
import { Moon, Sun, Copy, Check } from 'lucide-react';
import { LlmSettingsTab } from '../components/settings/LlmSettingsTab';

interface AppContext {
    theme: string;
    setTheme: (t: string) => void;
    connected: boolean;
}

export const SettingsPage = () => {
    // Cast context to any because some properties might be missing in initial render
    const { theme, setTheme, connected } = useOutletContext<AppContext>();
    const [copied, setCopied] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState('mcp');

    const mcpConfig = {
        mcpServers: {
            sochdb: {
                command: "/path/to/sochdb-mcp",
                args: ["--db", "/path/to/data"]
            }
        }
    };

    const copyConfig = async () => {
        await invoke('get_mcp_config').then((c: any) => {
            navigator.clipboard.writeText(JSON.stringify(c, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            navigator.clipboard.writeText(JSON.stringify(mcpConfig, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const tabs = ['General', 'Connection', 'LLM', 'MCP', 'About'];

    return (
        <div className="flex flex-col h-full animate-in p-8 overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-text-default mb-2">Settings</h1>
                <p className="text-text-muted">Application configuration and integrations</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-border-default mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveSettingsTab(tab.toLowerCase())}
                        className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeSettingsTab === tab.toLowerCase()
                            ? 'text-teal border-teal'
                            : 'text-text-muted border-transparent hover:text-text-default'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="space-y-6 max-w-4xl flex-1">
                {/* General Tab */}
                {activeSettingsTab === 'general' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-xl border border-border-default bg-background-muted/30">
                            <h3 className="text-lg font-semibold text-text-default mb-2">Theme</h3>
                            <p className="text-sm text-text-muted mb-4">Customize the look and feel of SochDB Studio</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${theme === 'light'
                                        ? 'bg-background-app text-text-default border-teal'
                                        : 'bg-background-muted text-text-muted border-border-default hover:border-text-muted'
                                        }`}
                                >
                                    <Sun size={16} /> Light
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${theme === 'dark'
                                        ? 'bg-background-app text-text-default border-teal'
                                        : 'bg-background-muted text-text-muted border-border-default hover:border-text-muted'
                                        }`}
                                >
                                    <Moon size={16} /> Dark
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Connection Tab */}
                {activeSettingsTab === 'connection' && (
                    <div className="p-6 rounded-xl border border-border-default bg-background-muted/30">
                        <h3 className="text-lg font-semibold text-text-default mb-2">Connection Status</h3>
                        <div className="flex items-center gap-3 mt-4">
                            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-teal' : 'bg-red-500'}`} />
                            <span className="text-text-default">{connected ? 'Connected to database' : 'Not connected'}</span>
                        </div>
                        <p className="text-sm text-text-muted mt-4">
                            {connected
                                ? 'Your database is active and ready to receive queries.'
                                : 'Connect to a database using the connection modal.'}
                        </p>
                    </div>
                )}

                {/* LLM Tab */}
                {activeSettingsTab === 'llm' && (
                    <LlmSettingsTab />
                )}

                {/* MCP Tab */}
                {activeSettingsTab === 'mcp' && (
                    <div className="rounded-xl border border-border-default bg-background-muted/30 overflow-hidden">
                        <div className="p-6 border-b border-border-default flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-text-default mb-1">MCP Configuration</h3>
                                <p className="text-sm text-text-muted">Connect SochDB to Claude, Cursor, or other AI agents.</p>
                            </div>
                            <button
                                onClick={copyConfig}
                                className="flex items-center gap-2 px-3 py-1.5 bg-teal hover:bg-teal/90 text-white text-xs font-medium rounded-md transition-all"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied!' : 'Copy Config'}
                            </button>
                        </div>
                        <div className="p-0 bg-background-app">
                            <pre className="p-6 text-xs font-mono text-text-muted overflow-x-auto">
                                {JSON.stringify(mcpConfig, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {/* About Tab */}
                {activeSettingsTab === 'about' && (
                    <div className="p-6 rounded-xl border border-border-default bg-background-muted/30">
                        <h3 className="text-lg font-semibold text-text-default mb-4">About SochDB Studio</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-text-muted">Version</span><span className="text-text-default font-mono">0.1.0-alpha</span></div>
                            <div className="flex justify-between"><span className="text-text-muted">Engine</span><span className="text-text-default font-mono">SochDB Core</span></div>
                            <div className="flex justify-between"><span className="text-text-muted">Build</span><span className="text-text-default font-mono">2024.12.08</span></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <div className="pt-8 border-t border-border-default flex justify-between text-xs text-text-muted mt-auto">
                <span>Version 0.1.0</span>
                <span className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-teal' : 'bg-red-500'}`} />
                    {connected ? 'Connected' : 'Disconnected'}
                </span>
            </div>
        </div>
    );
};
