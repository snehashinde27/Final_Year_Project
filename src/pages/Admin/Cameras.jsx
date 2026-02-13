import React from 'react';
import { Camera, MapPin, Activity, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Cameras = () => {
    // Mock Camera Data
    const cameras = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        location: `Sector ${10 + i}, Main Junction`,
        status: i % 3 === 0 ? 'offline' : 'active',
        lastActive: '2 mins ago'
    }));

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Surveillance Cameras</h1>
                    <p className="text-slate-400 text-sm">Manage and monitor traffic cameras across the city.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <Activity className="w-4 h-4" /> System Health Check
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cameras.map((cam) => (
                    <motion.div
                        key={cam.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`bg-slate-800 rounded-xl border ${cam.status === 'active' ? 'border-emerald-500/30' : 'border-red-500/30'} overflow-hidden group hover:shadow-xl transition-all`}
                    >
                        <div className="relative h-48 bg-slate-900 flex items-center justify-center overflow-hidden">
                            {/* Placeholder generic traffic image or static */}
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-500"></div>

                            <div className="z-10 bg-slate-900/80 backdrop-blur-sm p-3 rounded-full border border-slate-700">
                                <Camera className={`w-8 h-8 ${cam.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`} />
                            </div>

                            <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${cam.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                {cam.status === 'active' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                                {cam.status}
                            </div>
                        </div>

                        <div className="p-5">
                            <h3 className="text-white font-bold text-lg mb-1">CAM-00{cam.id}</h3>
                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                                <MapPin className="w-4 h-4" /> {cam.location}
                            </div>

                            <button className={`w-full py-2 rounded-lg font-medium text-sm transition-colors border ${cam.status === 'active' ? 'bg-blue-600 hover:bg-blue-500 text-white border-transparent' : 'bg-transparent text-slate-500 border-slate-700 cursor-not-allowed'}`} disabled={cam.status !== 'active'}>
                                {cam.status === 'active' ? 'View Live Stream' : 'Offline - Check Connection'}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Cameras;
