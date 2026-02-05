import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import logo from '../assets/logo.png';

const RegisterOrg = () => {
    const [formData, setFormData] = useState({
        orgName: '',
        userName: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { registerOrg } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        setIsLoading(true);
        try {
            await registerOrg(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        "Unlimited Tasks & Projects",
        "Real-time Analytics Dashboard",
        "Team Collaboration Tools",
        "Priority Support"
    ];

    return (
        <div className="min-h-screen bg-zinc-950 flex font-sans">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-8 xl:p-14 relative z-10 overflow-y-auto">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-10">
                        <img src={logo} alt="Quickflow Logo" className="h-16 w-16 mb-6 rounded-xl shadow-lg shadow-indigo-500/20" />
                        <h1 className="text-4xl font-bold text-white tracking-tight mb-3">Create Workspace</h1>
                        <p className="text-zinc-400 text-lg">Start your 14-day free trial. No credit card required.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-300">Organization Name</label>
                                <input
                                    type="text"
                                    name="orgName"
                                    required
                                    value={formData.orgName}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
                                    placeholder="Acme Inc."
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Your Full Name</label>
                            <input
                                type="text"
                                name="userName"
                                required
                                value={formData.userName}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Work Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                placeholder="john@acme.com"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={8}
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                placeholder="Min 8 characters"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    Create Account <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-zinc-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Features Hero */}
            <div className="hidden lg:flex w-1/2 bg-[#0F0F16] relative overflow-hidden items-center justify-center p-12">
                {/* Gradients */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950"></div>

                <div className="relative z-10 max-w-md">
                    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
                        <h3 className="text-2xl font-bold text-white mb-6">Included in your plan:</h3>
                        <div className="space-y-4">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                                        <CheckCircle2 size={20} className="text-indigo-400" />
                                    </div>
                                    <span className="text-zinc-200 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5">
                            <p className="text-zinc-400 text-sm italic">
                                "This platform completely transformed how our team handles sprints. Highly recommended!"
                            </p>
                            <div className="flex items-center gap-3 mt-4">
                                <div className="w-8 h-8 bg-zinc-700 rounded-full" />
                                <div className="text-xs">
                                    <p className="text-white font-semibold">Sarah Kapoor</p>
                                    <p className="text-zinc-500">CTO at TechFlow</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterOrg;
