import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Activity, Clock, Play, VideoOff, Settings, AlertCircle, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Cameras = () => {
    const navigate = useNavigate();
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCameras();
    }, []);

    const fetchCameras = async () => {
        try {
            const response = await api.get('/api/admin/cameras');
            setCameras(response.data);
        } catch (err) {
            console.error("Failed to fetch cameras");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Camera Network</h1>
                    <p className="text-slate-400 text-sm">Monitor and manage all active traffic surveillance nodes</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {cameras.filter(c => c.status === 'active').length} Nodes Online
                    </span>
                    <button className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-slate-800 h-64 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cameras.map((cam, index) => (
                        <motion.div
                            key={cam.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className={`group relative overflow-hidden bg-slate-800 rounded-3xl border ${cam.status === 'active' ? 'border-slate-700 hover:border-blue-500/50' : 'border-red-900/40 opacity-75'} shadow-xl transition-all duration-300`}
                        >
                            {/* Camera Header */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${cam.status === 'active' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
                                            <Camera className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white tracking-tight">Node #{cam.id}</h3>
                                            <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{cam.ip_address}</p>
                                        </div>
                                    </div>
                                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${cam.status === 'active' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' : 'bg-red-500/5 text-red-500 border-red-500/20'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${cam.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                        {cam.status}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <MapPin className="w-4 h-4 text-slate-600" /> {cam.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-mono">
                                        <Clock className="w-4 h-4 text-slate-600" /> {cam.last_active}
                                    </div>
                                </div>

                                <button
                                    disabled={cam.status !== 'active'}
                                    onClick={() => navigate(`/admin/camera/${cam.id}/stream`)}
                                    className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold transition-all ${cam.status === 'active'
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                                            : 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-700'
                                        }`}
                                >
                                    {cam.status === 'active' ? <><Play className="w-4 h-4 fill-current" /> Initialize Live Stream</> : <><VideoOff className="w-4 h-4" /> Node Offline</>}
                                </button>
                            </div>

                            {/* Hover Decorative Element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </motion.div>
                    ))}

                    {/* Add Camera Placeholder if less than 6 */}
                    {cameras.length < 6 && (
                        <div className="bg-slate-800/20 border-2 border-dashed border-slate-700/50 rounded-3xl flex flex-col items-center justify-center p-6 text-slate-600 hover:border-blue-500/30 hover:text-blue-500/50 transition-all cursor-pointer">
                            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                            <p className="font-bold text-sm">Add Survelliance Node</p>
                            <p className="text-[10px] uppercase font-bold tracking-widest mt-1">Available slots: {6 - cameras.length}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Cameras;
