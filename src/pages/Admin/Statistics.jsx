import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, AlertTriangle, CheckCircle, Camera, Users, ChevronRight, Activity } from 'lucide-react';
import api from '../../utils/api';

const Statistics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/api/admin/statistics');
                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-slate-500 font-medium animate-pulse">Aggregating system data...</p>
            </div>
        </div>
    );

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group"
        >
            <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity`}>
                <Icon className={`w-20 h-20 text-${color}-500 transform rotate-12`} />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 inline-block mb-4`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</h3>
                    <p className="text-3xl font-bold text-white mt-1">{value}</p>
                </div>
                <p className="text-slate-500 text-[10px] mt-4 font-mono uppercase tracking-tighter">{subtext}</p>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-8 pb-12">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">System Analytics</h1>
                    <p className="text-slate-500 text-sm">Real-time monitoring and violation trends</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-sm font-bold hover:bg-slate-700 transition-all">
                    Last 30 Days <ChevronRight className="w-4 h-4" />
                </button>
            </header>

            {/* Top Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Violations" value={stats.total} icon={AlertTriangle} color="blue" subtext="Cumulative System Feed" />
                <StatCard title="Today's Active" value={stats.today} icon={TrendingUp} color="orange" subtext="Live session count" />
                <StatCard title="Revenue Collected" value={`₹${stats.paid * 500}+`} icon={CheckCircle} color="emerald" subtext="Confirmed Transactions" />
                <StatCard title="Network Health" value={`${stats.active_cameras}/6`} icon={Camera} color="indigo" subtext="Online Optical Nodes" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Trend Line Chart (Simulated with SVG for premium feel without heavy d3) */}
                <div className="lg:col-span-2 bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white">Violation Velocity</h3>
                            <p className="text-xs text-slate-500">Daily violation count for current week</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-[10px] text-slate-400 font-bold uppercase">Trend</span></div>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-4 relative px-2">
                        {stats.daily_violations.map((day, idx) => {
                            const height = Math.max((day.count / (stats.total || 1)) * 100, 10);
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center group gap-3">
                                    <div className="relative w-full flex flex-col items-center">
                                        <div className="absolute bottom-full mb-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {day.count}
                                        </div>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            className="w-full max-w-[40px] bg-gradient-to-t from-blue-700 to-blue-400 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform cursor-pointer"
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{day.date}</span>
                                </div>
                            )
                        })}
                        {/* Static baseline */}
                        <div className="absolute left-0 right-0 bottom-9 h-[1px] bg-slate-700/50"></div>
                    </div>
                </div>

                {/* Status Breakdown Bar Chart */}
                <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-8">Payment Status</h3>

                    <div className="space-y-8 flex-1 flex flex-col justify-center">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                <span className="text-slate-400 flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> Paid</span>
                                <span className="text-white">{((stats.paid / (stats.total || 1)) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-4 bg-slate-900 rounded-full overflow-hidden p-1 shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stats.paid / (stats.total || 1)) * 100}%` }}
                                    className="h-full bg-emerald-500 rounded-full"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                <span className="text-slate-400 flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-amber-500" /> Unpaid</span>
                                <span className="text-white">{((stats.unpaid / (stats.total || 1)) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-4 bg-slate-900 rounded-full overflow-hidden p-1 shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stats.unpaid / (stats.total || 1)) * 100}%` }}
                                    className="h-full bg-amber-500 rounded-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-700 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>Success Rate</span>
                        <span className="text-emerald-400 font-mono">{((stats.paid / (stats.total || 1)) * 100).toFixed(0)}% OPTIMAL</span>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Vehicle Types */}
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl overflow-hidden group">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-indigo-500/10 rounded-lg"><Activity className="w-5 h-5 text-indigo-400" /></div>
                    <h3 className="text-lg font-bold text-white">Violations by Vehicle Category</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {stats.vehicle_type_stats && stats.vehicle_type_stats.length > 0 ? stats.vehicle_type_stats.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col items-center gap-2">
                            <p className="text-[10px] text-slate-500 font-bold uppercase text-center">{item.type || item[0]}</p>
                            <p className="text-2xl font-bold text-white">{item.count || item[1]}</p>
                            <div className="w-full h-1 bg-slate-800 rounded-full mt-2">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${((item.count || item[1]) / (stats.total || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-slate-500 col-span-full py-4 italic">No vehicle categorization data available yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Statistics;
