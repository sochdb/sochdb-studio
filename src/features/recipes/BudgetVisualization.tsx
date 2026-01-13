import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BudgetVisualizationProps {
    data: { name: string; tokens: number; color?: string }[];
    totalBudget: number;
}

export const BudgetVisualization = ({ data, totalBudget }: BudgetVisualizationProps) => {
    const totalUsed = data.reduce((sum, item) => sum + item.tokens, 0);
    // const remaining = Math.max(0, totalBudget - totalUsed);

    // Prepare data for stacked bar or simple bar list
    // Let's us a list of bars for clarity

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-muted font-medium">Token Budget Usage</span>
                    <span className={`font-mono ${totalUsed > totalBudget ? 'text-red-400' : 'text-teal'}`}>
                        {totalUsed.toLocaleString()} / {totalBudget.toLocaleString()}
                    </span>
                </div>
                <div className="h-2 bg-background-muted rounded-full overflow-hidden flex">
                    {data.map((item, i) => (
                        <div
                            key={i}
                            style={{ width: `${(item.tokens / totalBudget) * 100}%`, backgroundColor: item.color || '#13bbaf' }}
                            className="h-full"
                        />
                    ))}
                    {/* Warning/Overflow indicator could be added here */}
                </div>
                {totalUsed > totalBudget && (
                    <p className="text-xs text-red-400 mt-1">Warning: Budget exceeded by {(totalUsed - totalBudget).toLocaleString()} tokens</p>
                )}
            </div>

            <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#888', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="tokens" radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || '#13bbaf'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend / Details */}
            <div className="mt-4 space-y-2 overflow-auto max-h-[200px] pr-2">
                {data.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-2 rounded hover:bg-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || '#13bbaf' }} />
                            <span className="text-text-default">{item.name}</span>
                        </div>
                        <span className="font-mono text-text-muted">{item.tokens.toLocaleString()} tok</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
