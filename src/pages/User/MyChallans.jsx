import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, MapPin, Calendar, CreditCard, ChevronRight, X, Play, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const MyChallans = () => {
    const [challans, setChallans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChallan, setSelectedChallan] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchChallans();
    }, []);

    const fetchChallans = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/user/challans');
            setChallans(response.data);
        } catch (err) {
            setError("Failed to fetch challans.");
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (challanId) => {
        try {
            await api.post('/api/user/pay-challan', { challan_id: challanId });
            alert("Payment successful!");
            fetchChallans();
            setSelectedChallan(null);
        } catch (err) {
            alert(err.response?.data?.error || "Payment failed");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Challans</h1>
                    <p className="text-slate-500">Track and pay your traffic violations</p>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            ) : challans.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">No Challans Found</h3>
                    <p className="text-slate-500 mt-2">You don't have any recorded traffic violations. Drive safe!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challans.map((challan) => (
                        <motion.div
                            key={challan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                        >
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                        challan.status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                    )}>
                                        {challan.status}
                                    </div>
                                    <span className="text-slate-400 text-xs font-mono">#{challan.id}</span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-1">{challan.type}</h3>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <MapPin className="w-4 h-4" /> {challan.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <Calendar className="w-4 h-4" /> {challan.timestamp}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-semibold">Fine Amount</p>
                                        <p className="text-xl font-title font-bold text-slate-900">₹{challan.amount}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedChallan(challan)}
                                        className="p-2 bg-slate-50 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {challan.status !== 'paid' && (
                                <button
                                    onClick={() => handlePayment(challan.id)}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-colors uppercase text-sm tracking-widest"
                                >
                                    <CreditCard className="w-4 h-4" /> Pay Now
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {selectedChallan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedChallan(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">Violation Details</h2>
                                <button onClick={() => setSelectedChallan(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-slate-500" />
                                </button>
                            </div>

                            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="aspect-video bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative group">
                                        <img
                                            src={selectedChallan.image ? `http://localhost:5000/${selectedChallan.image}` : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80'}
                                            className="w-full h-full object-cover"
                                            alt="Violation"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white hover:bg-white/40 transition-all">
                                                <Play className="w-8 h-8 fill-current" />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-medium">
                                            Evidence Image
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                            <p className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Number Plate</p>
                                            <p className="text-2xl font-mono font-bold text-slate-900">{selectedChallan.vehicle_number}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-center">
                                            {selectedChallan.plate_crop ? (
                                                <img src={`http://localhost:5000/${selectedChallan.plate_crop}`} className="h-full object-contain mix-blend-multiply" alt="Plate Crop" />
                                            ) : (
                                                <div className="text-slate-400 text-xs italic">Plate Crop Pending</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl">
                                        <h3 className="text-blue-900 font-bold text-lg mb-4 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" /> Summary
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-blue-700/70 text-sm">Violation Type</span>
                                                <span className="text-blue-900 font-semibold">{selectedChallan.type}</span>
                                            </div>
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-blue-700/70 text-sm">Location</span>
                                                <span className="text-blue-900 font-semibold text-right max-w-[200px]">{selectedChallan.location}</span>
                                            </div>
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-blue-700/70 text-sm">Date & Time</span>
                                                <span className="text-blue-900 font-semibold">{selectedChallan.timestamp}</span>
                                            </div>
                                            <div className="pt-4 border-t border-blue-200 flex justify-between items-center">
                                                <span className="text-blue-900 font-bold text-lg">Total Fine</span>
                                                <span className="text-3xl font-bold text-blue-900">₹{selectedChallan.amount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-500 leading-relaxed italic">
                                            Note: You have 15 days from the date of issue to pay the fine. Failure to pay may result in increased fines or legal action.
                                        </p>
                                        {selectedChallan.status !== 'paid' ? (
                                            <button
                                                onClick={() => handlePayment(selectedChallan.id)}
                                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3"
                                            >
                                                <CreditCard className="w-5 h-5" /> Proceed to Secure Payment
                                            </button>
                                        ) : (
                                            <div className="w-full py-4 bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold rounded-2xl flex items-center justify-center gap-3">
                                                <CheckCircle className="w-5 h-5" /> Successfully Paid
                                            </div>
                                        )}
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

export default MyChallans;
