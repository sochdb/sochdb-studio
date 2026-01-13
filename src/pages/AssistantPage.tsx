import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Settings, Zap } from 'lucide-react';

export const AssistantPage = () => {
    const [messages, setMessages] = useState<{ role: string, content: string, toolResults?: { tool_name: string, result: string }[] }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        invoke('get_llm_config').then((config: any) => {
            setIsConfigured(config && config.api_key && config.api_key.length > 0);
        }).catch(() => {
            setIsConfigured(false);
        });
    }, []);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setError(null);
        setLoading(true);

        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);

        try {
            const apiMessages = [
                {
                    role: 'system',
                    content: `You are a helpful AI assistant with access to SochDB - an AI-native embedded database.
You can use the available tools to query the database, get/put/delete data, and help users manage their data.
When the user asks about data, use the appropriate tools. Always be helpful and explain what you're doing.`,
                },
                ...newMessages.map(m => ({ role: m.role, content: m.content || '' })),
            ];

            const response: any = await invoke('chat_completion', { messages: apiMessages });

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.message.content || '',
                toolResults: response.tool_results,
            }]);

        } catch (e: any) {
            console.error('Chat error:', e);
            setError(typeof e === 'string' ? e : (e?.message || 'Failed to send message'));
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full animate-in p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-text-default mb-2">AI Assistant</h1>
                <p className="text-text-muted">Chat with AI to query and manage your SochDB data</p>
            </header>

            <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden">
                <div className="flex-1 p-4 overflow-auto space-y-4">
                    {messages.length === 0 ? (
                        isConfigured === false ? (
                            <div className="h-full flex flex-col items-center justify-center text-text-muted">
                                <Settings size={48} className="mb-4 opacity-50" />
                                <p className="text-lg font-semibold text-text-default mb-2">LLM Not Configured</p>
                                <p className="text-sm mb-4 text-center max-w-md">To use the AI Assistant, please configure your LLM API key in Settings.</p>
                                <p className="text-xs text-text-muted mb-4">Settings → LLM → Enter API Key → Save</p>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                                <Zap size={48} className="mb-4" />
                                <p>Ask me anything about your data!</p>
                                <p className="text-sm mt-2">Try: "List all tables" or "Show me data in users/"</p>
                            </div>
                        )
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-xl px-4 py-3 ${msg.role === 'user'
                                    ? 'bg-teal text-white'
                                    : 'bg-background-muted border border-border-default text-text-default'
                                    }`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    {msg.toolResults && msg.toolResults.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-white/20">
                                            <p className="text-xs opacity-70 mb-2">🔧 Tools Used:</p>
                                            {msg.toolResults.map((tr, j) => (
                                                <div key={j} className="text-xs bg-black/20 rounded px-2 py-1 mt-1 font-mono">
                                                    <span className="text-teal">{tr.tool_name}</span>
                                                    <pre className="mt-1 whitespace-pre-wrap opacity-80 max-h-32 overflow-auto">{tr.result.slice(0, 500)}{tr.result.length > 500 ? '...' : ''}</pre>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-background-muted border border-border-default rounded-xl px-4 py-3">
                                <div className="flex items-center gap-2 text-text-muted text-sm">
                                    <div className="w-2 h-2 bg-teal rounded-full animate-pulse" />
                                    Thinking...
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {error && (
                    <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                <div className="border-t border-border-default bg-background-muted/30 p-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Ask about your data..."
                            className="flex-1 bg-background-app border border-border-default rounded-lg px-4 py-2.5 text-text-default text-sm focus:ring-2 focus:ring-teal/50 outline-none transition-all placeholder:text-text-muted/50"
                            disabled={loading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            className="px-6 py-2.5 bg-teal hover:bg-teal/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
