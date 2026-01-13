import { useState, useSyncExternalStore } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Play, Cpu, Settings } from 'lucide-react';
import { recipeStore } from '../../stores/recipeStore';
import { RecipeEditor } from '../../features/recipes/RecipeEditor';
import { BudgetVisualization } from '../../features/recipes/BudgetVisualization';

export const RecipeDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const recipes = useSyncExternalStore(recipeStore.subscribe.bind(recipeStore), recipeStore.getRecipes.bind(recipeStore));
    const recipe = recipes.find(r => r.id === id);

    const [queryText, setQueryText] = useState(recipe?.query_text || '');
    // Mock simulation data
    const [explanationData, setExplanationData] = useState<{ name: string; tokens: number; color?: string }[]>([
        { name: 'System Prompt', tokens: 1500, color: '#f59e0b' },
        { name: 'Schema Context', tokens: 800, color: '#3b82f6' },
        { name: 'User Query Results', tokens: 1200, color: '#13bbaf' },
        { name: 'Vector Search', tokens: 500, color: '#a855f7' }
    ]);

    if (!recipe) {
        return <div className="p-8">Recipe not found</div>;
    }

    const handleSave = () => {
        recipeStore.updateRecipe(recipe.id, { query_text: queryText });
        // Show toast ideally
    };

    const handleExplain = () => {
        // Here we would call invoke('explain_context', ...)
        // For now we just shuffle mock data to simulate change
        const factor = 0.8 + Math.random() * 0.4;
        setExplanationData(prev => prev.map(p => ({ ...p, tokens: Math.floor(p.tokens * factor) })));
    };

    return (
        <div className="flex flex-col h-full animate-in">
            {/* Header */}
            <header className="h-14 border-b border-border-default bg-background-muted/30 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/recipes')} className="p-1.5 hover:bg-background-muted rounded-lg text-text-muted hover:text-text-default">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-text-default">{recipe.name}</h1>
                        <span className="text-xs font-mono text-text-muted">v{recipe.version}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExplain} className="flex items-center gap-2 px-3 py-1.5 bg-background-muted border border-border-default hover:bg-background-medium rounded-lg text-xs font-medium text-text-default transition-colors">
                        <Play size={14} /> Explain
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 bg-teal hover:bg-teal/90 text-white rounded-lg text-xs font-semibold transition-colors">
                        <Save size={14} /> Save
                    </button>
                    <button className="p-1.5 hover:bg-background-muted rounded-lg text-text-muted hover:text-text-default">
                        <Settings size={18} />
                    </button>
                </div>
            </header>

            {/* Content Split */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Pane */}
                <div className="flex-1 border-r border-border-default relative">
                    <RecipeEditor value={queryText} onChange={setQueryText} />
                </div>

                {/* Visualization Pane */}
                <div className="w-[400px] bg-background-muted/10 flex flex-col">
                    <div className="h-10 border-b border-border-default bg-background-muted/50 flex items-center px-4 justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
                            <Cpu size={14} /> Budget & Explain
                        </span>
                        <span className="text-xs font-mono text-text-muted">{recipe.token_budget} max</span>
                    </div>
                    <div className="flex-1 p-4 overflow-hidden">
                        <BudgetVisualization data={explanationData} totalBudget={recipe.token_budget} />
                    </div>
                    <div className="h-1/3 border-t border-border-default p-4 overflow-auto">
                        <h4 className="text-xs font-semibold text-text-default mb-2">Execution Plan</h4>
                        <div className="space-y-2 text-xs font-mono text-text-muted">
                            <div className="flex gap-2">
                                <span className="text-green-400">✓</span>
                                <span>Parse Query</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-green-400">✓</span>
                                <span>Resolve Parameters</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-blue-400">→</span>
                                <span>Vector Search (users/1)</span>
                            </div>
                            <div className="pl-5 opacity-60">Found 2 documents</div>
                            <div className="flex gap-2">
                                <span className="text-text-muted">○</span>
                                <span>Assemble Context</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
