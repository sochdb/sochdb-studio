import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minimize, Maximize, X } from 'lucide-react';

export const SochIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#grad1)" />
        <path d="M7 8H17" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M7 16H12" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <defs>
            <linearGradient id="grad1" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#13bbaf" />
                <stop offset="1" stopColor="#5c98f9" />
            </linearGradient>
        </defs>
    </svg>
);

export const TitleBar = () => {
    return (
        <div className="h-10 w-full flex items-center justify-between select-none z-50 px-3 pt-3 cursor-default" data-tauri-drag-region>
            <div className="flex items-center gap-3 pointer-events-none">
                <SochIcon size={20} />
                <span className="text-sm font-medium text-text-muted tracking-wide">SochDB Studio</span>
                <span className="bg-background-muted text-text-muted text-[10px] px-2 py-0.5 rounded-full border border-border-default">BETA</span>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex bg-background-muted rounded-lg p-1 border border-border-default backdrop-blur-sm">
                    <button
                        onClick={() => getCurrentWindow().minimize()}
                        className="p-1 hover:bg-background-medium rounded text-text-muted hover:text-text-default transition-colors"
                    >
                        <Minimize size={14} />
                    </button>
                    <button
                        onClick={() => getCurrentWindow().toggleMaximize()}
                        className="p-1 hover:bg-background-medium rounded text-text-muted hover:text-text-default transition-colors"
                    >
                        <Maximize size={14} />
                    </button>
                    <button
                        onClick={() => getCurrentWindow().close()}
                        className="p-1 hover:bg-red-500/20 rounded text-text-muted hover:text-red-400 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
