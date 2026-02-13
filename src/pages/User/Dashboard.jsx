import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, FileText, ArrowRight, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const navigate = useNavigate();

    const stats = [
        { title: 'Total Violations', value: '5', color: 'blue', icon: FileText },
        { title: 'Active Challans', value: '1', color: 'red', icon: AlertTriangle },
        { title: 'Paid Challans', value: '4', color: 'emerald', icon: CheckCircle },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">My Overview</h1>
                <p className="text-slate-400 text-sm">Welcome back, check your traffic compliance status.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 p-4 opacity-5`}>
                            <stat.icon className={`w-32 h-32 text-${stat.color}-500 transform -rotate-12`} />
                        </div>
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-400 mb-4`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-slate-400 font-medium uppercase text-sm tracking-wider">{stat.title}</h3>
                            <p className="text-4xl font-bold text-white mt-2">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Active Challan Alert */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-red-900/40 to-slate-800 border border-red-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-500/20 rounded-full text-red-500 animate-pulse">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Pending Violation Detected</h3>
                        <p className="text-slate-300 text-sm max-w-lg">
                            You have 1 pending challan for <span className="text-white font-medium">Speeding</span> detected on <span className="text-white">12 Feb 2024</span>.
                            Please pay immediately to avoid penalties.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/user/challans')}
                    className="whitespace-nowrap px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg shadow-lg shadow-red-600/20 transition-all flex items-center gap-2"
                >
                    <CreditCard className="w-4 h-4" /> Pay Now
                </button>
            </motion.div>

            {/* Recent History */}
            <div>
                <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    {[1, 2, 3].map((item, i) => (
                        <div key={i} className="p-4 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 transition-colors flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${i === 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                    {i === 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">{i === 0 ? 'Speeding Violation' : 'Challan Paid'}</p>
                                    <p className="text-slate-500 text-xs">1{i} Feb 2024 • MH 12 AB 1234</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-bold text-sm">₹ {i === 0 ? '2000' : '500'}</p>
                                <p className={`text-xs ${i === 0 ? 'text-yellow-500' : 'text-emerald-500'}`}>{i === 0 ? 'Pending' : 'Success'}</p>
                            </div>
                        </div>
                    ))}
                    <div className="p-3 bg-slate-800/50 text-center">
                        <button onClick={() => navigate('/user/challans')} className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center gap-1 transition-colors">
                            View All History <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
