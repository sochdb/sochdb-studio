import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Play,
    Database,
    Zap,
    Terminal,
    Settings,
    FileText, // For Recipes
    Activity, // For Observability
    Shield,   // For Policies
    Wrench    // For MCP Tools
} from 'lucide-react';
import { cn } from '../lib/utils';

// We'll pass connection state for now, but ideally this comes from a hook
export const Sidebar = ({ connected }: { connected: boolean }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/' },
        { id: 'query', label: 'Query Engine', icon: Play, path: '/query' },
        { id: 'explorer', label: 'KV Explorer', icon: Database, path: '/explorer' },
        { id: 'recipes', label: 'Context Recipes', icon: FileText, path: '/recipes' }, // New
        { id: 'assistant', label: 'AI Assistant', icon: Zap, path: '/assistant' },
        { id: 'mcp', label: 'MCP Tools', icon: Wrench, path: '/mcp' }, // New
        { id: 'observability', label: 'Observability', icon: Activity, path: '/observability' }, // New
        { id: 'policies', label: 'Policies', icon: Shield, path: '/policies' }, // New
        { id: 'console', label: 'Console', icon: Terminal, path: '/console' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <div className="w-64 flex flex-col h-full z-20 p-3 pt-6 bg-background-default border-r border-border-default">
            {/* Status Card */}
            <div className={cn(
                "p-4 rounded-xl border mb-6 transition-all duration-300",
                connected
                    ? "bg-background-muted border-teal/30"
                    : "bg-background-muted border-red-500/30"
            )}>
                <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                        <div className={cn("w-2.5 h-2.5 rounded-full", connected ? "bg-teal" : "bg-red-500")} />
                        {connected && <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-teal animate-ping opacity-75" />}
                    </div>
                    <span className={cn("text-xs font-semibold uppercase tracking-wider", connected ? "text-teal" : "text-red-400")}>
                        {connected ? 'System Online' : 'Disconnected'}
                    </span>
                </div>
                <div className="text-[10px] text-text-muted font-mono truncate">
                    0.1.0
                </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
                {menuItems.map((item, index) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                            isActive
                                ? "text-text-default bg-background-muted shadow-sm"
                                : "text-text-muted hover:text-text-default hover:bg-background-muted/50"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-teal rounded-r-sm" />
                                )}
                                <item.icon
                                    size={18}
                                    className={cn("transition-colors", isActive ? "text-teal" : "text-text-muted group-hover:text-text-default")}
                                />
                                <span>{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-2 px-2 pb-4 border-t border-border-default space-y-1">
                <NavLink
                    to="/admin"
                    className={({ isActive }) => cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                        isActive
                            ? "text-red-400 bg-red-500/10 shadow-sm"
                            : "text-text-muted hover:text-red-400 hover:bg-background-muted/50"
                    )}
                >
                    <Shield size={18} className="text-red-400/70 group-hover:text-red-400 transition-colors" />
                    <span>Admin</span>
                </NavLink>
                <div className="pt-2 text-[10px] text-center text-text-muted opacity-50">SochDB Studio © 2024</div>
            </div>
        </div>
    );
};
