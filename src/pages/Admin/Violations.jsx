import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, Trash2, Filter, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Violations = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchViolations = async () => {
        try {
            const response = await api.get('/api/violations');
            setViolations(response.data);
        } catch (error) {
            console.error("Failed to fetch violations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchViolations();
        const interval = setInterval(fetchViolations, 5000); // Auto-refresh every 5s for real-time updates
        return () => clearInterval(interval);
    }, []);

    const filteredViolations = filter === 'all' ? violations : violations.filter(v => v.status === filter);

    if (loading && violations.length === 0) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-white">Traffic Violations Feed</h1>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder="Search Plate No." className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64" />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processed">Processed</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-700/50 text-slate-200 uppercase text-xs font-semibold">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Vehicle Plate</th>
                            <th className="p-4">Violation Type</th>
                            <th className="p-4">Location & Time</th>
                            <th className="p-4">Fine</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {filteredViolations.map((v) => (
                            <motion.tr
                                key={v.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-slate-700/30 transition-colors"
                            >
                                <td className="p-4 font-medium text-white">#{v.id}</td>
                                <td className="p-4 uppercase font-bold text-slate-200">{v.plate}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs border ${v.type === 'Speeding' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            v.type === 'Red Light' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                v.type === 'Processing...' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                        }`}>
                                        {v.type}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="text-white">{v.location}</div>
                                    <div className="text-xs text-slate-500">{v.timestamp}</div>
                                </td>
                                <td className="p-4 font-bold text-white">₹{v.fine || 0}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${v.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                            v.status === 'processed' ? 'bg-emerald-500/10 text-emerald-400' :
                                                'bg-blue-500/10 text-blue-400'
                                        }`}>
                                        {v.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors" title="View Evidence">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors" title="Delete Record">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                {filteredViolations.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        {loading ? 'Loading...' : 'No violations found.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Violations;
