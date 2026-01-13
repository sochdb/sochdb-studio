import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const LlmSettingsTab = () => {
    const [provider, setProvider] = useState('openai');
    const [apiKey, setApiKey] = useState('');
    const [endpoint, setEndpoint] = useState('');
    const [model, setModel] = useState('gpt-4o-mini');
    const [azureApiVersion, setAzureApiVersion] = useState('2024-02-01');
    const [testResult, setTestResult] = useState<string | null>(null);
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load config on mount
    useEffect(() => {
        invoke('get_llm_config').then((config: any) => {
            if (config) {
                setProvider(config.provider || 'openai');
                setApiKey(config.api_key || '');
                setEndpoint(config.endpoint || '');
                setModel(config.model || 'gpt-4o-mini');
                setAzureApiVersion(config.azure_api_version || '2024-02-01');
            }
        }).catch(() => { });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await invoke('save_llm_config', {
                config: {
                    provider,
                    api_key: apiKey,
                    endpoint: endpoint || null,
                    model,
                    azure_api_version: provider === 'azure' ? azureApiVersion : null,
                }
            });
            setTestResult('✓ Configuration saved');
        } catch (e: any) {
            setTestResult(`Error: ${e?.message || e}`);
        }
        setSaving(false);
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            // Save first, then test
            await invoke('save_llm_config', {
                config: {
                    provider,
                    api_key: apiKey,
                    endpoint: endpoint || null,
                    model,
                    azure_api_version: provider === 'azure' ? azureApiVersion : null,
                }
            });
            const result: string = await invoke('test_llm_connection');
            setTestResult(result);
        } catch (e: any) {
            setTestResult(`Error: ${e?.message || e}`);
        }
        setTesting(false);
    };

    const handleClear = async () => {
        try {
            await invoke('clear_llm_config');
            setProvider('openai');
            setApiKey('');
            setEndpoint('');
            setModel('gpt-4o-mini');
            setTestResult('Configuration cleared');
        } catch (e: any) {
            setTestResult(`Error: ${e?.message || e}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border-default bg-background-muted/30">
                <h3 className="text-lg font-semibold text-text-default mb-2">LLM Configuration</h3>
                <p className="text-sm text-text-muted mb-6">Configure AI assistant with OpenAI or compatible APIs.</p>

                {/* Provider Selection */}
                <div className="mb-4">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">Provider</label>
                    <div className="flex gap-2">
                        {['openai', 'azure', 'custom'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setProvider(p)}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${provider === p
                                    ? 'bg-teal/10 border-teal text-teal'
                                    : 'bg-background-muted border-border-default text-text-muted hover:text-text-default'
                                    }`}
                            >
                                {p === 'openai' ? 'OpenAI' : p === 'azure' ? 'Azure OpenAI' : 'Custom'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* API Key */}
                <div className="mb-4">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">API Key</label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={provider === 'azure' ? 'Azure API Key' : 'sk-...'}
                        className="w-full bg-background-app border border-border-default rounded-lg px-4 py-2.5 text-text-default text-sm focus:ring-2 focus:ring-teal/50 outline-none transition-all placeholder:text-text-muted/50"
                    />
                </div>

                {/* API Endpoint (optional - for proxies, compatible APIs, etc) */}
                <div className="mb-4">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">
                        {provider === 'azure' ? 'Azure Endpoint' : 'API Endpoint'}
                        {provider === 'openai' && <span className="text-text-muted/60 font-normal ml-1">(optional)</span>}
                    </label>
                    <input
                        type="text"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        placeholder={
                            provider === 'azure'
                                ? 'https://your-resource.openai.azure.com'
                                : provider === 'openai'
                                    ? 'Leave blank for api.openai.com, or enter custom URL'
                                    : 'http://localhost:11434/v1'
                        }
                        className="w-full bg-background-app border border-border-default rounded-lg px-4 py-2.5 text-text-default text-sm focus:ring-2 focus:ring-teal/50 outline-none transition-all placeholder:text-text-muted/50"
                    />
                    {provider === 'openai' && (
                        <p className="text-xs text-text-muted mt-1">Leave empty for default OpenAI, or enter a proxy/compatible API URL</p>
                    )}
                </div>

                {/* Azure API Version */}
                {provider === 'azure' && (
                    <div className="mb-4">
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">API Version</label>
                        <input
                            type="text"
                            value={azureApiVersion}
                            onChange={(e) => setAzureApiVersion(e.target.value)}
                            placeholder="2024-02-01"
                            className="w-full bg-background-app border border-border-default rounded-lg px-4 py-2.5 text-text-default text-sm focus:ring-2 focus:ring-teal/50 outline-none transition-all placeholder:text-text-muted/50"
                        />
                    </div>
                )}

                {/* Model */}
                <div className="mb-6">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">Model</label>
                    <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="e.g., gpt-4o-mini, llama3.2, claude-3-sonnet..."
                        className="w-full bg-background-app border border-border-default rounded-lg px-4 py-2.5 text-text-default text-sm focus:ring-2 focus:ring-teal/50 outline-none placeholder:text-text-muted/50"
                    />
                    <p className="text-xs text-text-muted mt-1">Enter the model name as expected by your API endpoint</p>
                </div>

                {/* Test Result */}
                {testResult && (
                    <div className={`mb-4 p-3 rounded-lg text-sm font-mono ${testResult.startsWith('✓') ? 'bg-teal/10 text-teal' : 'bg-red-500/10 text-red-400'
                        }`}>
                        {testResult}
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleTest}
                        disabled={!apiKey || testing}
                        className="px-4 py-2 bg-background-muted border border-border-default hover:bg-background-medium rounded-lg text-sm font-medium text-text-default transition-colors disabled:opacity-50"
                    >
                        {testing ? 'Testing...' : 'Test Connection'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!apiKey || saving}
                        className="px-4 py-2 bg-teal hover:bg-teal/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={handleClear}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
};
