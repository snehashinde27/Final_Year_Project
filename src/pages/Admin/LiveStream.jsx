import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Wifi, MapPin, Minimize2, Cpu, BarChart, Settings, Share2, Camera } from 'lucide-react';
import api from '../../utils/api';

const LiveStream = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [streamData, setStreamData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStream = async () => {
            try {
                const response = await api.get(`/api/admin/camera/${id}/stream`);
                setStreamData(response.data);
            } catch (err) {
                console.error("Failed to fetch stream");
            } finally {
                setLoading(false);
            }
        };
        fetchStream();
    }, [id]);

    if (loading || !streamData) return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="flex flex-col items-center gap-4 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-active border-blue-600"></div>
                <p className="font-bold text-lg animate-pulse">Establishing Secure Stream Connection...</p>
                <p className="text-slate-500 text-sm">Node ID: CAM-{id}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/cameras')}
                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-all shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            Live Camera Stream <span className="px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-black rounded uppercase tracking-tighter">LIVE</span>
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {streamData.location}</span>
                            <span className="text-slate-700">•</span>
                            <span className="flex items-center gap-1.5"><Wifi className="w-4 h-4 text-emerald-500" /> Active Connection</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-700 transition-all"><BarChart className="w-5 h-5" /></button>
                    <button className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-700 transition-all"><Settings className="w-5 h-5" /></button>
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center gap-2">
                        <Share2 className="w-4 h-4" /> Broadcast
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Main Viewport */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="relative aspect-video bg-black rounded-[40px] border border-slate-700 shadow-2xl overflow-hidden group">
                        {/* Stream Mockup */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900 flex items-center justify-center">
                            <div className="text-center opacity-20">
                                <Camera className="w-32 h-32 text-blue-500 mx-auto mb-4" />
                                <p className="font-mono text-xl text-blue-400 tracking-[0.5em]">{streamData.stream_url}</p>
                            </div>
                        </div>

                        {/* Overlay Controls */}
                        <div className="absolute top-8 left-8 flex flex-col gap-2">
                            <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                                <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                                <span className="font-mono text-sm">BITRATE: 4.8MB/S</span>
                            </div>
                            <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                                <Cpu className="w-4 h-4 text-blue-500" />
                                <span className="font-mono text-sm">ENC: H.264 (NVENC)</span>
                            </div>
                        </div>

                        <div className="absolute bottom-8 right-8">
                            <button className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl transition-all">
                                <Minimize2 className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scanline Effect */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
                            <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">FPS Status</h4>
                            <p className="text-2xl font-black text-white">60.0 <span className="text-xs text-emerald-500">STABLE</span></p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
                            <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Latency</h4>
                            <p className="text-2xl font-black text-white">42ms <span className="text-xs text-blue-500">OPTIMAL</span></p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
                            <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Detection Logic</h4>
                            <p className="text-2xl font-black text-white">YOLOV8m <span className="text-xs text-indigo-500">ACTIVE</span></p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-slate-800 h-full p-8 rounded-[40px] border border-slate-700 shadow-xl overflow-y-auto">
                        <h3 className="text-lg font-bold text-white mb-6">Real-time Feed Metadata</h3>

                        <div className="space-y-6">
                            <div className="pb-6 border-b border-slate-700/50">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Hardware ID</label>
                                <p className="text-white font-mono text-sm mt-1">NODE-SRV-00{id}-X</p>
                            </div>
                            <div className="pb-6 border-b border-slate-700/50">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Geo Coordinates</label>
                                <p className="text-white font-mono text-sm mt-1">19.0760° N, 72.8777° E</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-4">Detections (Current Feed)</h4>
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 text-[11px] font-bold border border-slate-800 group hover:border-blue-500/50 transition-colors">
                                            <span className="text-slate-400 group-hover:text-white transition-colors">MH 04 ER 992{i}</span>
                                            <span className="text-emerald-500">TRUSTED</span>
                                        </div>
                                    ))}
                                    <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-[11px] font-bold text-red-400 flex justify-between animate-pulse">
                                        <span>UNIDENTIFIED OBJ</span>
                                        <span>WARNING</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6">
                                <button className="w-full py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white font-black rounded-2xl transition-all border border-red-500/30 text-xs uppercase tracking-widest outline-none">
                                    Emergency Override
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveStream;
