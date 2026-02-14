import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Filter, Eye, Download, X, Calendar, MapPin, Clock, CreditCard, User, Car } from 'lucide-react';
import api from '../../utils/api';

const Challans = () => {
    const [challans, setChallans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedChallan, setSelectedChallan] = useState(null);

    useEffect(() => {
        fetchChallans();
    }, []);

    const fetchChallans = async () => {
        try {
            const response = await api.get('/api/admin/challans');
            setChallans(response.data);
        } catch (err) {
            console.error("Failed to fetch challans");
        } finally {
            setLoading(false);
        }
    };

    const filteredChallans = challans.filter(c => {
        const matchesSearch = c.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.owner_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Challan Management</h1>
                    <p className="text-slate-400 text-sm">Review and monitor all system-generated traffic violations</p>
                </div>
            </header>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search Vehicle or Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Unpaid / Pending</option>
                        <option value="paid">Paid / Success</option>
                    </select>
                </div>
                <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            {/* Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-700/50 text-slate-300 uppercase text-xs font-bold tracking-wider">
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Vehicle & Owner</th>
                                <th className="px-6 py-4">Violation</th>
                                <th className="px-6 py-4">Fine</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="px-6 py-8 text-center bg-slate-800/50">
                                            <div className="h-4 bg-slate-700 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredChallans.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                        No challans found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredChallans.map((c) => (
                                    <motion.tr
                                        key={c.id}
                                        layoutId={`row-${c.id}`}
                                        className="hover:bg-slate-700/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4 font-mono text-xs text-blue-400">#C-{c.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-white font-bold">{c.vehicle_number}</div>
                                            <div className="text-xs text-slate-500">{c.owner_name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-200 text-sm font-medium">{c.type}</span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white">₹{c.amount}</td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {c.timestamp}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${c.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                {c.status === 'paid' ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedChallan(c)}
                                                className="p-2 bg-slate-700 group-hover:bg-blue-600 text-slate-300 group-hover:text-white rounded-lg transition-all"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed Modal */}
            <AnimatePresence>
                {selectedChallan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedChallan(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-5xl bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                        >
                            {/* Evidence View */}
                            <div className="flex-1 bg-black flex items-center justify-center relative group min-h-[300px]">
                                <img
                                    src={`http://localhost:5000/${selectedChallan.image}`}
                                    alt="Violation"
                                    className="max-w-full max-h-full object-contain"
                                />
                                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> HIGH SPEED VIOLATION
                                </div>
                                <div className="absolute bottom-4 right-4 bg-black/60 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
                                    <p className="text-[10px] text-white/60 font-medium uppercase mb-1 leading-none">Cropped Plate</p>
                                    <img src={`http://localhost:5000/${selectedChallan.plate_crop}`} alt="Plate" className="h-10 border border-white/20 rounded" />
                                </div>
                            </div>

                            {/* Details Panel */}
                            <div className="w-full md:w-[400px] p-8 border-l border-slate-800 overflow-y-auto">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-500" /> Challan Details
                                    </h2>
                                    <button onClick={() => setSelectedChallan(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                            <Car className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase">Vehicle Number</p>
                                            <p className="text-lg font-mono font-bold text-white">{selectedChallan.vehicle_number}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Owner Name</p>
                                            <div className="flex items-center gap-2 text-slate-200 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                                                <User className="w-4 h-4 text-slate-600" /> {selectedChallan.owner_name}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Violation Type</p>
                                            <div className="flex items-center gap-2 text-slate-200 bg-slate-900 border border-slate-800 p-3 rounded-xl border-l-4 border-l-red-500">
                                                <AlertTriangle className="w-4 h-4 text-red-500" /> {selectedChallan.type}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Location & Time</p>
                                            <div className="space-y-2 text-sm text-slate-300 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                                                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-600" /> Sector 1, Mumbai-Pune Hwy</div>
                                                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-600" /> {selectedChallan.timestamp}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Fine Amount</p>
                                            <div className="text-2xl font-bold text-emerald-400 bg-emerald-400/5 border border-emerald-400/20 p-4 rounded-xl flex items-center justify-between">
                                                ₹{selectedChallan.amount}
                                                <span className={`text-[10px] px-2 py-1 rounded bg-white/10 uppercase tracking-widest font-bold ${selectedChallan.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                    {selectedChallan.status}
                                                </span>
                                            </div>
                                        </div>

                                        {selectedChallan.status === 'paid' && (
                                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex flex-col gap-2 shadow-inner">
                                                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                                                    <CreditCard className="w-4 h-4" /> Payment Confirmed
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-mono break-all">REF: TXN_88293102_E_MOCK</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button className="flex-1 h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all text-sm">
                                            Download Case
                                        </button>
                                        <button className="h-12 w-12 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center rounded-xl shadow-lg shadow-blue-600/20 transition-all">
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Challans;
