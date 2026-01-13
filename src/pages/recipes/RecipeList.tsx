import { useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom'; // Ensure react-router-dom is used
import { Search, Plus, Filter, MoreVertical, FileText, Tag, Cpu } from 'lucide-react';
import { recipeStore } from '../../stores/recipeStore';


export const RecipeList = () => {
    const navigate = useNavigate();
    const recipes = useSyncExternalStore(recipeStore.subscribe.bind(recipeStore), recipeStore.getRecipes.bind(recipeStore));
    const [search, setSearch] = useState('');

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-full animate-in p-8">
            <header className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-text-default mb-2">Context Recipes</h1>
                    <p className="text-text-muted">Manage prompt engineering templates and data contexts</p>
                </div>
                <button
                    onClick={() => navigate('/recipes/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-teal hover:bg-teal/90 text-white rounded-lg font-medium transition-colors shadow-lg shadow-teal/20">
                    <Plus size={16} /> New Recipe
                </button>
            </header>

            {/* Toolbar */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-background-muted/50 border border-border-default rounded-lg pl-9 pr-4 py-2.5 text-sm text-text-default focus:ring-2 focus:ring-teal/50 outline-none transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-background-muted border border-border-default hover:bg-background-medium rounded-lg text-text-muted hover:text-text-default transition-colors">
                    <Filter size={16} /> Filters
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRecipes.map(recipe => (
                    <div
                        key={recipe.id}
                        onClick={() => navigate(`/recipes/${recipe.id}`)}
                        className="group relative bg-background-app border border-border-default hover:border-teal/50 rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-black/20"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-teal/10 rounded-lg text-teal">
                                <FileText size={20} />
                            </div>
                            <button className="p-1 text-text-muted hover:text-text-default hover:bg-background-muted rounded opacity-0 group-hover:opacity-100 transition-all">
                                <MoreVertical size={16} />
                            </button>
                        </div>

                        <h3 className="text-lg font-semibold text-text-default mb-1 group-hover:text-teal transition-colors">{recipe.name}</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-mono text-text-muted bg-background-muted px-1.5 py-0.5 rounded">v{recipe.version}</span>
                            <span className="text-xs text-text-muted">•</span>
                            <span className="text-xs text-text-muted">Updated {new Date(recipe.updated_at).toLocaleDateString()}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {recipe.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 text-[10px] font-medium text-text-muted bg-background-muted px-2 py-1 rounded-full border border-border-default">
                                    <Tag size={10} /> {tag}
                                </span>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-border-default flex items-center justify-between text-xs text-text-muted">
                            <div className="flex items-center gap-1.5">
                                <Cpu size={12} />
                                <span>{recipe.token_budget.toLocaleString()} tokens</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-16 h-1 bg-background-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-teal w-3/4" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Create Card */}
                <button
                    onClick={() => navigate('/recipes/new')}
                    className="border-2 border-dashed border-border-default hover:border-teal/50 rounded-xl p-5 flex flex-col items-center justify-center text-text-muted hover:text-teal hover:bg-teal/5 transition-all gap-3 min-h-[200px]">
                    <div className="p-3 bg-background-muted rounded-full">
                        <Plus size={24} />
                    </div>
                    <span className="font-medium">Create New Recipe</span>
                </button>
            </div>
        </div>
    );
};
