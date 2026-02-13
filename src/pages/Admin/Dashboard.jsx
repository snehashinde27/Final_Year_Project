import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Camera, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, subtext, icon: Icon, color, trend }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`bg-slate-800 p-6 rounded-xl border border-slate-700 relative overflow-hidden group`}
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
            <Icon className={`w-24 h-24 text-${color}-500 transform rotate-12`} />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-${color}-500/10 text-${color}-400`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
            </div>
            <p className="text-slate-500 text-xs mt-4 font-medium">{subtext}</p>
        </div>
    </motion.div>
);

const AdminDashboard = () => {
    const navigate = useNavigate();

    const stats = [
        { title: 'Total Violations', value: '1,240', subtext: 'Since system start', icon: AlertTriangle, color: 'blue', trend: 12 },
        { title: 'Today\'s Violations', value: '45', subtext: 'Updated 2 mins ago', icon: AlertTriangle, color: 'orange', trend: 5 },
        { title: 'Paid Challans', value: '850', subtext: '₹ 4.2L Collected', icon: CheckCircle, color: 'emerald', trend: 8 },
        { title: 'Active Cameras', value: '12/15', subtext: '3 Offline (Maintenance)', icon: Camera, color: 'indigo', trend: -2 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">System Overview</h1>
                <div className="text-sm text-slate-400">
                    Last updated: <span className="text-white font-medium">Just now</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-slate-800 p-6 rounded-xl border border-slate-700 relative overflow-hidden group`}
                    >
                        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                            <stat.icon className={`w-24 h-24 text-${stat.color}-500 transform rotate-12`} />
                        </div>

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-400`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    {stat.trend && (
                                        <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {stat.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {Math.abs(stat.trend)}%
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.title}</h3>
                                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                            </div>
                            <p className="text-slate-500 text-xs mt-4 font-medium">{stat.subtext}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Violations */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Recent Violations</h2>
                        <button onClick={() => navigate('/admin/violations')} className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">View All</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-700/50 text-slate-200 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="p-3 rounded-l-lg">ID</th>
                                    <th className="p-3">Vehicle No.</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Time</th>
                                    <th className="p-3 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-3 font-medium text-white">#V-{1000 + i}</td>
                                        <td className="p-3 uppercase">MH 12 AB {1230 + i}</td>
                                        <td className="p-3"><span className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs border border-red-500/20">Speeding</span></td>
                                        <td className="p-3">10:4{i} AM</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs border ${i % 2 === 0 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                                {i % 2 === 0 ? 'Pending' : 'Processed'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* System Health / Camera Status */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col"
                >
                    <h2 className="text-lg font-bold text-white mb-6">Camera Feed Status</h2>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {[1, 2, 3, 4, 5].map((cam) => (
                            <div key={cam} className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => navigate('/admin/cameras')}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${cam === 3 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-white">CAM-{100 + cam}</p>
                                        <p className="text-xs text-slate-500">Sector {cam}, Main Road</p>
                                    </div>
                                </div>
                                <div className="text-xs font-mono text-slate-500">Live</div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate('/admin/cameras')} className="mt-4 w-full py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-medium transition-all">
                        Manage Cameras
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
