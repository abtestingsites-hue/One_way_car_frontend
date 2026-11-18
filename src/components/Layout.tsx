import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Package, 
    FileText, 
    List, 
    Users, 
    ShieldCheck,
    LogOut, 
    User, 
    Settings, 
    Menu, 
    X,
    Car,
    Sun,
    Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Inventory & Parts', path: '/products', icon: <Package size={18} /> },
        { name: 'Create Invoice', path: '/invoices/new', icon: <FileText size={18} /> },
        { name: 'Invoices History', path: '/invoices', icon: <List size={18} /> },
        { name: 'Customers & History', path: '/customers', icon: <Users size={18} /> },
        { name: 'Warranty & Claims', path: '/warranty', icon: <ShieldCheck size={18} /> },
    ];

    const currentTitle = navItems.find(i => i.path === location.pathname)?.name || 
        (location.pathname === '/profile' ? 'Profile' : location.pathname === '/settings' ? 'Settings' : 'One Way Car Decors');

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-dark-900 text-dark-950 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
            {/* Mobile Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300 lg:hidden ${
                    isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`} 
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Mathematically Standardized 256px Sidebar */}
            <aside 
                className={`w-64 bg-dark-950 text-white flex flex-col z-40 fixed inset-y-0 left-0 transition-transform duration-300 transform lg:static lg:translate-x-0 border-r border-dark-800 shadow-enterprise ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand Header */}
                <div className="h-20 px-6 flex items-center border-b border-dark-800 relative bg-gradient-to-b from-dark-900 to-dark-950">
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden absolute top-5 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-xs flex items-center justify-center border-2 border-red-600 shrink-0">
                            <Car size={22} className="text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-sm font-montserrat font-extrabold tracking-tight text-white flex items-center gap-1 leading-none">
                                <span>ONE WAY</span>
                                <span className="text-red-600">DECORS</span>
                            </h1>
                            <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-1">
                                POS & Billing Enterprise
                            </p>
                        </div>
                    </div>
                </div>

                {/* Standardized Navigation Stack (8-Point Grid: 4px gap, 40px item height) */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center h-10 px-3.5 rounded-xl text-xs font-semibold transition-all duration-150 relative ${
                                    isActive
                                        ? 'bg-red-600 text-white shadow-xs font-bold'
                                        : 'text-slate-300 hover:bg-dark-900 hover:text-white'
                                }`}
                            >
                                <span className={`mr-3 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                    {item.icon}
                                </span>
                                <span className="truncate">{item.name}</span>
                                {isActive && (
                                    <div className="absolute right-2 w-1.5 h-4 bg-white/80 rounded-full"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Account Panel */}
                <div className="p-3 border-t border-dark-800 bg-dark-900/60 space-y-1">
                    <Link to="/profile" className="flex items-center h-9 px-3 text-xs font-medium text-slate-400 hover:bg-dark-800 hover:text-white rounded-lg transition-colors">
                        <User size={16} className="mr-3 shrink-0" />
                        <span>Profile</span>
                    </Link>
                    <Link to="/settings" className="flex items-center h-9 px-3 text-xs font-medium text-slate-400 hover:bg-dark-800 hover:text-white rounded-lg transition-colors">
                        <Settings size={16} className="mr-3 shrink-0" />
                        <span>Settings</span>
                    </Link>
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center h-9 px-3 w-full text-xs font-semibold text-red-500 hover:bg-red-600/10 hover:text-red-400 rounded-lg transition-colors"
                    >
                        <LogOut size={16} className="mr-3 shrink-0" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Application Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Standardized 64px Header */}
                <header className="h-16 bg-white dark:bg-dark-950 border-b border-slate-200 dark:border-dark-800 px-6 sm:px-8 flex items-center justify-between z-20 shrink-0 transition-colors">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-dark-950 dark:text-white hover:bg-slate-100 dark:hover:bg-dark-900 rounded-lg transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h2 className="text-base sm:text-lg font-montserrat font-bold text-dark-950 dark:text-white leading-tight">
                                {currentTitle}
                            </h2>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Welcome back, {user?.name || 'Super Admin'}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Theme Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="h-10 w-10 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900 flex items-center justify-center text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors shadow-xs"
                            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {/* Standardized Super Admin Profile Pill (40px Height, Crisp Proportions) */}
                        <div className="flex items-center h-10 pl-1.5 pr-3.5 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-dark-800 shadow-xs">
                            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
                                {user?.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            <div className="ml-2.5 text-left hidden sm:flex flex-col justify-center">
                                <span className="text-xs font-bold text-dark-950 dark:text-white leading-tight">
                                    {user?.name || 'Super Admin'}
                                </span>
                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider leading-none mt-0.5">
                                    {user?.role || 'ADMIN'}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mathematically Padded Viewport Content Area (32px padding, 8-pt scale) */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-7 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
