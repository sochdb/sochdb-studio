
interface RecipeEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export const RecipeEditor = ({ value, onChange }: RecipeEditorProps) => {
    return (
        <div className="h-full flex flex-col">
            <div className="bg-background-muted/50 border-b border-border-default px-4 py-2 flex justify-between items-center">
                <span className="text-xs font-mono text-text-muted">TOONQL EDITOR</span>
                <span className="text-xs text-text-muted opacity-50">Support variables like $user_id</span>
            </div>
            <textarea
                className="flex-1 bg-transparent p-4 font-mono text-sm text-text-default outline-none resize-none leading-relaxed"
                value={value}
                onChange={e => onChange(e.target.value)}
                spellCheck={false}
                placeholder="SELECT * FROM ..."
            />
        </div>
    );
};
