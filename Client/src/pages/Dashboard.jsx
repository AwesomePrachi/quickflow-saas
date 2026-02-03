import { useEffect, useState } from 'react';
import api from '../api/api';
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    BarChart3,
    TrendingUp,
    MoreHorizontal,
    Download
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [risks, setRisks] = useState([]);
    const [productivity, setProductivity] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [taskRes, riskRes, prodRes, trendRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/insights/risks').catch(() => ({ data: [] })),
                api.get('/insights/productivity').catch(() => ({ data: [] })),
                api.get('/insights/trend').catch(() => ({ data: [] }))
            ]);
            setTasks(taskRes.data);
            setRisks(riskRes.data);
            setProductivity(prodRes.data);
            setTrendData(trendRes.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleExport = async () => {
        try {
            const response = await api.get('/reports/tasks/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'tasks_report.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Failed to download report");
        }
    };

    // Derived data for charts
    const statusCounts = {
        Completed: tasks.filter(t => t.status === 'Completed').length,
        InProgress: tasks.filter(t => t.status === 'In Progress').length,
        Open: tasks.filter(t => t.status === 'Open').length,
    };

    const stats = [
        {
            label: 'Total Tasks',
            value: tasks.length,
            icon: BarChart3,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            trend: '+12%',
            trendUp: true
        },
        {
            label: 'Completed',
            value: statusCounts.Completed,
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            trend: '+5%',
            trendUp: true
        },
        {
            label: 'Burnout Risks',
            value: risks.filter(r => r.type === 'Burnout Risk').length,
            icon: AlertCircle,
            color: 'text-rose-400',
            bg: 'bg-rose-400/10',
            trend: risks.length > 0 ? 'Action Needed' : 'Healthy',
            trendUp: false
        },
        {
            label: 'Avg Productivity',
            value: productivity.length > 0 ? Math.round(productivity.reduce((acc, p) => acc + p.score, 0) / productivity.length) + '%' : '0%',
            icon: Clock,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            trend: '+3%',
            trendUp: true
        }
    ];

    // Chart configuration
    const lineOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#18181b',
                titleColor: '#fff',
                bodyColor: '#a1a1aa',
                borderColor: '#3f3f46',
                borderWidth: 1,
                callbacks: {
                    label: (context) => {
                        const originalValue = trendData[context.dataIndex]?.count || 0;
                        return `Tasks Completed: ${originalValue > 10 ? '10+' : originalValue}`;
                    }
                }
            }
        },
        scales: {
            y: {
                grid: { color: '#27272a' },
                ticks: {
                    color: '#71717a',
                    stepSize: 1,
                    callback: (value) => value // Ensure integers
                },
                beginAtZero: true,
                min: 0,
                max: 10,
                suggestedMax: 10
            },
            x: {
                grid: { display: false },
                ticks: { color: '#71717a' }
            }
        }
    };

    // Real-time productivity trend
    const lineData = {
        labels: trendData.length > 0 ? trendData.map(d => d.day) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Tasks Completed',
            data: trendData.length > 0 ? trendData.map(d => Math.min(d.count, 10)) : [0, 0, 0, 0, 0, 0, 0],
            borderColor: '#818cf8',
            backgroundColor: 'rgba(129, 140, 248, 0.1)',
            tension: 0.4,
            fill: true,
        }],
    };

    const doughnutData = {
        labels: ['Completed', 'In Progress', 'Open'],
        datasets: [{
            data: [statusCounts.Completed, statusCounts.InProgress, statusCounts.Open],
            backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
            borderWidth: 0,
            hoverOffset: 4
        }],
    };

    const doughnutOptions = {
        cutout: '75%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#a1a1aa', usePointStyle: true, boxWidth: 6 }
            }
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-zinc-400">Overview of your team's performance.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl transition-colors font-medium text-sm"
                    >
                        <Download size={16} />
                        Export Report
                    </button>
                    <div className="text-sm text-zinc-500 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full flex items-center">
                        Last 7 Days
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-3xl backdrop-blur-sm hover:border-indigo-500/20 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <span className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-3xl font-bold text-white">{stat.value}</span>
                            <div className="flex items-center justify-between">
                                <h3 className="text-zinc-500 text-sm font-medium">{stat.label}</h3>
                                <span className={`text-xs font-medium ${stat.trend === 'Healthy' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Chart */}
                    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm">
                        <h2 className="text-lg font-bold text-white mb-6">Productivity Trend</h2>
                        <div className="h-[300px] w-full">
                            <Line options={lineOptions} data={lineData} />
                        </div>
                    </div>

                    {/* Activity List */}
                    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm">
                        <h2 className="text-lg font-bold text-white mb-4">Team Risks & Insights</h2>
                        {risks.length === 0 ? (
                            <div className="text-zinc-500 text-sm py-4 flex items-center gap-2">
                                <CheckCircle2 className="text-emerald-500" size={16} />
                                No immediate risks detected in your team.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {risks.map((risk, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl">
                                        <AlertCircle className="text-rose-400 shrink-0" size={18} />
                                        <div>
                                            <p className="text-zinc-200 text-sm font-medium">{risk.user} - {risk.type}</p>
                                            <p className="text-rose-400/80 text-xs">{risk.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Doughnut Chart */}
                    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm">
                        <h2 className="text-lg font-bold text-white mb-6">Task Distribution</h2>
                        <div className="h-[250px] relative flex items-center justify-center">
                            <Doughnut options={doughnutOptions} data={doughnutData} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-white">{tasks.length}</span>
                                <span className="text-xs text-zinc-500">Tasks</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Performers */}
                    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-sm">
                        <h2 className="text-lg font-bold text-white mb-4">Top Performers</h2>
                        <div className="space-y-4">
                            {productivity.slice(0, 3).map((p, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold border border-zinc-700 text-white">
                                            {p.name.charAt(0)}
                                        </div>
                                        <span className="text-zinc-300 text-sm">{p.name}</span>
                                    </div>
                                    <span className="text-emerald-400 font-bold text-sm">{p.score}%</span>
                                </div>
                            ))}
                            {productivity.length === 0 && <p className="text-zinc-500 text-xs">No data available yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
