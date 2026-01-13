import { useState } from 'react';
import { McpRegistry } from './McpRegistry';
import { ToolPlayground } from './ToolPlayground';

export const McpToolsPage = () => {
    const [activeTab, setActiveTab] = useState<'registry' | 'playground'>('registry');
    // We could lift tool selection state here if we want to pre-fill the playground
    // But for now, let's keep it simple or implement a basic Context/Callback if needed.
    // To implement "Test in Playground", we'd need to pass a setter down to Registry 
    // and maybe render Playground with that initial value (which requires Playground to accept props).

    // Let's modify ToolPlayground to accept initialToolName if we want that feature.
    // But since I already wrote ToolPlayground without props, I'll stick to tabs first 
    // or quickly rewrite it if I want to be fancy. 
    // Ideally, for Phase 3, a simple switch is enough. 

    return (
        <div className="flex flex-col h-full animate-in p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-text-default mb-2">MCP Tools</h1>
                <p className="text-text-muted">Manage and test Model Context Protocol tools</p>
            </header>

            <div className="flex gap-1 bg-background-muted p-1 rounded-lg mb-6 w-fit">
                <button
                    onClick={() => setActiveTab('registry')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'registry'
                        ? 'bg-background-app text-text-default shadow-sm'
                        : 'text-text-muted hover:text-text-default'
                        }`}
                >
                    Registry
                </button>
                <button
                    onClick={() => setActiveTab('playground')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'playground'
                        ? 'bg-background-app text-text-default shadow-sm'
                        : 'text-text-muted hover:text-text-default'
                        }`}
                >
                    Playground
                </button>
            </div>

            <div className="flex-1 overflow-hidden">
                {activeTab === 'registry' && (
                    <McpRegistry onSelectTool={(_name) => {
                        // TODO: Implement pre-fill in playground
                        // For now just switch tab, user types name manually or we implement prop later
                        setActiveTab('playground');
                    }} />
                )}
                {activeTab === 'playground' && (
                    <ToolPlayground />
                )}
            </div>
        </div>
    );
};
