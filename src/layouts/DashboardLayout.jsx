import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Camera, AlertTriangle, FileText, BarChart2, LogOut, User, LifeBuoy, CreditCard, Menu } from 'lucide-react';
import clsx from 'clsx';

const DashboardLayout = ({ children, role }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminLinks = [
        { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Cameras', path: '/admin/cameras', icon: Camera },
        { name: 'Violations', path: '/admin/violations', icon: AlertTriangle },
        { name: 'Challans', path: '/admin/challans', icon: FileText },
        { name: 'Statistics', path: '/admin/stats', icon: BarChart2 },
    ];

    const userLinks = [
        { name: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
        { name: 'My Challans', path: '/user/challans', icon: FileText },
        { name: 'Payment History', path: '/user/payments', icon: CreditCard },
        { name: 'Profile', path: '/user/profile', icon: User },
        { name: 'Support', path: '/user/support', icon: LifeBuoy },
    ];

    const links = role === 'admin' ? adminLinks : userLinks;

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-slate-700 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <span className="font-bold text-white">TS</span>
                    </div>
                    <span className="font-bold text-lg tracking-wide text-slate-100">TrafficSentinel</span>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname.startsWith(link.path);
                            return (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group no-underline",
                                            isActive
                                                ? "bg-blue-600/10 text-blue-400 border-r-2 border-blue-500 bg-gradient-to-r from-transparent to-blue-900/20"
                                                : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                                        )}
                                    >
                                        <Icon className={clsx("w-5 h-5 transition-colors", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                                        <span className="font-medium">{link.name}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-700/50 bg-slate-800/50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold shadow-inner ring-1 ring-slate-500">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-400 truncate capitalize">{user?.role || 'Role'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-red-500/10 hover:text-red-400 text-slate-300 py-2 rounded-lg transition-all text-sm font-medium border border-transparent hover:border-red-500/20"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-900">
                <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 md:hidden z-20 shadow-md">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-white text-xs">TS</span>
                        </div>
                        <span className="font-bold text-lg tracking-wide text-white">Sentinel</span>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-slate-400"><LogOut className="w-5 h-5" /></button>
                </header>

                <main className="flex-1 overflow-y-auto p-6 relative">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
