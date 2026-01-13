import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

// Icon can be a LucideIcon or just a render prop/element if generic
interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string;
    sub: string;
    color: 'teal' | 'orange' | 'blue' | 'red';
}

export const StatCard = ({ icon: Icon, label, value, sub, color }: StatCardProps) => {
    const colorMap: Record<string, string> = {
        teal: 'text-teal bg-teal/10 border-teal/20',
        orange: 'text-orange bg-orange/10 border-orange/20',
        blue: 'text-text-info bg-background-info/10 border-border-info',
        red: 'text-text-danger bg-background-danger/10 border-border-danger',
    };

    const theme = colorMap[color] || colorMap['teal'];

    return (
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2.5 rounded-xl border", theme)}>
                    <Icon size={20} />
                </div>
                <span className="text-xs font-mono text-text-muted bg-background-muted px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    2s ago
                </span>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-text-default mb-1 tracking-tight">{value}</h3>
                <p className="text-sm text-text-muted font-medium">{label}</p>
                <p className="text-[10px] text-text-muted mt-2 opacity-60">{sub}</p>
            </div>
        </div>
    );
};
