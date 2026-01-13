import { Outlet } from 'react-router-dom';
import { TitleBar } from './TitleBar';
import { Sidebar } from './Sidebar';

interface RootLayoutProps {
    connected: boolean;
    theme: string;
    setTheme: (theme: string) => void;
    onConnectClick: () => void;
}

export const RootLayout = ({ connected, theme, setTheme, onConnectClick }: RootLayoutProps) => {
    return (
        <div className={`flex flex-col h-screen overflow-hidden bg-background-app text-text-default selection:bg-teal selection:text-white ${theme}`}>
            <TitleBar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar connected={connected} />
                <main className="flex-1 overflow-auto relative bg-mesh">
                    <Outlet context={{ connected, theme, setTheme, onConnectClick }} />
                </main>
            </div>
        </div>
    );
};
