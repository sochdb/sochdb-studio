import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    Database,
    Wrench,
    Play,
    Plus,
    ArrowRight,
    Clock,
    AlertCircle
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { api, DatabaseStats, RecipeSummary } from '../lib/api';

export const Dashboard = () => {
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
    const [toolCount, setToolCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Initial empty state (no random mock data)
    const sparklineData = Array.from({ length: 20 }, (_, i) => ({
        i,
        val: 0
    }));

    const handleLoadSample = async () => {
        setError(null);
        setSuccessMsg(null);
        try {
            setLoading(true);

            // Seed Users (using direct KV puts via MCP)
            const users = [
                { id: 1, name: 'Alice', email: 'alice@sochdb.com', role: 'admin' },
                { id: 2, name: 'Bob', email: 'bob@sochdb.com', role: 'user' },
                { id: 3, name: 'Charlie', email: 'charlie@sochdb.com', role: 'viewer' }
            ];

            for (const user of users) {
                await api.mcp.callTool('sochdb_put', {
                    path: `/users/${user.id}`,
                    value: user
                });
            }

            // Seed Products
            const products = [
                { id: 101, name: 'SochDB Pro', price: 99.99 },
                { id: 102, name: 'SochDB Cloud', price: 29.99 }
            ];

            for (const product of products) {
                await api.mcp.callTool('sochdb_put', {
                    path: `/products/${product.id}`,
                    value: product
                });
            }

            // Refresh stats
            const statsData = await api.admin.getStats();
            setStats(statsData);
            setSuccessMsg("Sample data loaded successfully");
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (e) {
            console.error("Failed to load sample data", e);
            setError(typeof e === 'string' ? e : "Failed to load sample data");
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                // Parallel fetch for dashboard data
                const [statsData, recipesData, toolsData] = await Promise.all([
                    api.admin.getStats(),
                    api.context.listRecipes(),
                    api.mcp.listTools().catch(() => ({ tools: [] })) // Handle potential MCP failure gracefully
                ]);

                setStats(statsData);
                setRecipes(recipesData.recipes.slice(0, 5)); // Top 5 recent

                // Handle different tool list formats
                const tList = toolsData?.tools || (Array.isArray(toolsData) ? toolsData : []);
                setToolCount(tList.length);
            } catch (e) {
                console.error("Dashboard load failed", e);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return <div className="p-8 text-text-muted animate-pulse">Loading dashboard...</div>;
    }

    return (
        <div className="p-8 animate-in max-w-7xl mx-auto w-full relative">
            {error && (
                <div className="fixed top-4 right-4 z-50 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span className="font-medium">Error</span>
                        <span className="text-sm border-l border-red-500/30 pl-2 ml-1">{error}</span>
                    </div>
                </div>
            )}
            {successMsg && (
                <div className="fixed top-4 right-4 z-50 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Success</span>
                        <span className="text-sm border-l border-green-500/30 pl-2 ml-1">{successMsg}</span>
                    </div>
                </div>
            )}

            <header className="mb-8">
                <h1 className="text-3xl font-bold text-text-default mb-2">Overview</h1>
                <p className="text-text-muted">Welcome back. System is <span className="text-teal font-medium">Online</span>.</p>
            </header>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Tables"
                    value={stats?.total_tables.toString() || "0"}
                    icon={Database}
                    trend="Active"
                    color="text-blue-400"
                />
                <StatCard
                    label="Total Rows"
                    value={stats?.total_rows.toLocaleString() || "0"}
                    icon={Activity}
                    trend="+12/s"
                    color="text-teal"
                />
                <StatCard
                    label="MCP Tools"
                    value={toolCount.toString()}
                    icon={Wrench}
                    trend="Connected"
                    color="text-orange-400"
                />
                <StatCard
                    label="Uptime"
                    value={formatUptime(stats?.uptime_seconds || 0)}
                    icon={Clock}
                    trend="Stable"
                    color="text-green-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Sparkline */}
                    <section className="p-6 rounded-xl border border-border-default bg-background-muted/30">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-text-default">Query Volume (24h)</h3>
                            <div className="text-xs text-text-muted">Live</div>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparklineData}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        cursor={{ stroke: '#333' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="val"
                                        stroke="#14b8a6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorVal)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section>
                        <h3 className="font-semibold text-text-default mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/query" className="p-4 rounded-xl border border-border-default bg-background-muted/30 hover:bg-background-muted hover:border-teal/30 transition-all flex items-center gap-4 group">
                                <div className="p-3 bg-teal/10 rounded-lg text-teal group-hover:bg-teal group-hover:text-white transition-colors">
                                    <Play size={20} />
                                </div>
                                <div>
                                    <div className="font-medium text-text-default">New Query</div>
                                    <div className="text-xs text-text-muted">Execute SQL or Vector Search</div>
                                </div>
                            </Link>
                            <Link to="/recipes/new" className="p-4 rounded-xl border border-border-default bg-background-muted/30 hover:bg-background-muted hover:border-purple-500/30 transition-all flex items-center gap-4 group">
                                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                    <Plus size={20} />
                                </div>
                                <div>
                                    <div className="font-medium text-text-default">New Recipe</div>
                                    <div className="text-xs text-text-muted">Create a context configuration</div>
                                </div>
                            </Link>
                            <button onClick={handleLoadSample} className="p-4 rounded-xl border border-border-default bg-background-muted/30 hover:bg-background-muted hover:border-blue-400/30 transition-all flex items-center gap-4 group text-left">
                                <div className="p-3 bg-blue-400/10 rounded-lg text-blue-400 group-hover:bg-blue-400 group-hover:text-white transition-colors">
                                    <Database size={20} />
                                </div>
                                <div>
                                    <div className="font-medium text-text-default">Load Sample Data</div>
                                    <div className="text-xs text-text-muted">Seed database with test users</div>
                                </div>
                            </button>
                        </div>
                    </section>
                </div>

                {/* Sidebar (1/3) */}
                <div className="space-y-8">
                    {/* Recent Recipes */}
                    <section className="p-6 rounded-xl border border-border-default bg-background-muted/30 min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-text-default">Recent Recipes</h3>
                            <Link to="/recipes" className="text-xs text-teal hover:underline">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {recipes.length > 0 ? recipes.map(recipe => (
                                <Link key={recipe.id} to={`/recipes/${recipe.id}`} className="block p-3 rounded-lg bg-background-app hover:bg-background-muted/80 border border-border-default transition-all group">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-medium text-sm text-text-default group-hover:text-teal transition-colors">{recipe.name}</div>
                                        <ArrowRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="text-xs text-text-muted line-clamp-1">{recipe.description}</div>
                                    <div className="mt-2 flex gap-1">
                                        {recipe.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-background-muted text-text-muted border border-border-default">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </Link>
                            )) : (
                                <div className="text-center py-8 text-text-muted text-sm">No recipes found.</div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const StatCard = ({ label, value, icon: Icon, trend, color }: any) => (
    <div className="p-5 rounded-xl border border-border-default bg-background-muted/30 flex items-center gap-4 relative overflow-hidden group">
        <div className={`p-3 rounded-lg bg-background-app border border-border-default ${color}`}>
            <Icon size={24} />
        </div>
        <div>
            <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">{label}</div>
            <div className="text-2xl font-bold text-text-default mt-0.5">{value}</div>
        </div>
        <div className="absolute top-4 right-4 text-xs font-mono opacity-50">{trend}</div>
    </div>
);

function formatUptime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
}
