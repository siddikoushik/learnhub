import React, { useEffect, useState } from 'react';
import {
    Users,
    UserCheck,
    UserX,
    GraduationCap,
    TrendingUp,
    Activity,
    BookOpen,
    Clock
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import api from '../utils/api';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="p-8 rounded-[2.5rem] border shadow-sm flex justify-between items-center group hover:shadow-premium transition-all duration-500" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{title}</p>
            <h3 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>{value}</h3>
        </div>
        <div className={`h-16 w-16 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${colorClass}`}>
            <Icon size={28} />
        </div>
    </div>
);

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [growthData, setGrowthData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, activityRes] = await Promise.all([
                    api.get('/admin/dashboard-stats').catch(() => ({ data: { success: false } })),
                    api.get('/admin/activity').catch(() => ({ data: { success: false } }))
                ]);

                if (statsRes.data.success) {
                    setStats(statsRes.data.stats);
                    setGrowthData(statsRes.data.growthData || []);
                    setMonthlyData(statsRes.data.monthlyData || []);
                }

                if (activityRes.data.success) {
                    setActivities(activityRes.data.activity);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <div className="p-20 text-center">
            <div className="h-12 w-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronizing Data...</p>
        </div>
    );

    const pieData = [
        { name: 'Students', value: stats?.totalStudents || 0 },
        { name: 'Teachers', value: stats?.totalTeachers || 0 }
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-12 animate-fade-in-up pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-10" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                    <h1 className="text-5xl font-black tracking-tighter" style={{ color: 'var(--text-main)' }}>System Insights</h1>
                    <p className="text-sm font-bold text-slate-500 mt-3 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity size={16} className="text-indigo-600" />
                        Real-time Node Monitoring
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-2 px-6 rounded-full border" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">All Modules Online</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard title="Total Registry" value={stats?.totalUsers || 0} icon={Users} colorClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20" />
                <StatCard title="Active Nodes" value={stats?.activeUsers || 0} icon={UserCheck} colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" />
                <StatCard title="Student Base" value={stats?.totalStudents || 0} icon={BookOpen} colorClass="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" />
                <StatCard title="Faculty Count" value={stats?.totalTeachers || 0} icon={GraduationCap} colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 p-10 rounded-[3.5rem] border shadow-sm transition-all duration-500" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Growth trajectory</h2>
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                            <TrendingUp size={14} /> +12% this cycle
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="_id" hide />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12, fontWeight: 900}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-premium)', padding: '15px' }}
                                    itemStyle={{ color: 'var(--text-main)', fontWeight: 900 }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-10 rounded-[3.5rem] border shadow-sm transition-all duration-500" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                    <h2 className="text-2xl font-black tracking-tight mb-10" style={{ color: 'var(--text-main)' }}>Node Distribution</h2>
                    <div className="h-[350px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="value" stroke="none">
                                    {pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={10} />)}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-premium)', padding: '15px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                            <p className="text-4xl font-black" style={{ color: 'var(--text-main)' }}>{stats?.totalUsers || 0}</p>
                        </div>
                    </div>
                    <div className="mt-8 space-y-4">
                        {pieData.map((d, i) => (
                            <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{d.name}</span>
                                </div>
                                <span className="text-sm font-black" style={{ color: 'var(--text-main)' }}>{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
