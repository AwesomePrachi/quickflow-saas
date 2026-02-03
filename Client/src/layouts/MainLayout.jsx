import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    LogOut,
    Menu,
    X,
    Layers,
    BarChart3
} from 'lucide-react';
import { cn } from '../utils';
import logo from '../assets/logo.png';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Navigation items based on role
    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'My Tasks', path: '/tasks', icon: Layers },
        { name: 'Team', path: '/users', icon: Users, roles: ['Admin', 'Leader'] },
        { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['Admin'] },
    ].filter(item => {
        if (item.roles) {
            return item.roles.includes(user?.role);
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-100 font-sans selection:bg-indigo-500/30">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                        Quickflow
                    </span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-40 w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-200 lg:static lg:translate-x-0",
                        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="h-full flex flex-col">
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                                    Quickflow
                                </h1>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                                {user?.Organization?.name || 'Workspace'}
                            </p>
                        </div>

                        <nav className="flex-1 px-4 space-y-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                            isActive
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                                        )}
                                    >
                                        <item.icon size={20} className={cn(isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")} />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-zinc-800">
                            <div className="flex items-center gap-3 px-4 py-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-medium truncate">{user?.name}</p>
                                    <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors text-sm"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-zinc-950 relative">
                    {/* Background gradient blob */}
                    <div className="absolute top-0 left-0 w-full h-96 bg-indigo-900/20 blur-[120px] pointer-events-none" />

                    <div className="p-4 lg:p-8 relative z-10 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 lg:hidden z-30 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default MainLayout;
