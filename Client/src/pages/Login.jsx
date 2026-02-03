import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex font-sans">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-14 relative z-10">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-12">
                        <img src={logo} alt="Quickflow Logo" className="h-16 w-16 mb-6 rounded-xl shadow-lg shadow-indigo-500/20" />
                        <h1 className="text-4xl font-bold text-white tracking-tight mb-3">Welcome back</h1>
                        <p className="text-zinc-400 text-lg">Please enter your details to sign in.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm"
                                placeholder="you@company.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-indigo-500/50" />
                                <span className="text-sm text-zinc-400">Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    Log In <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-zinc-500">
                        Don't have an account?{' '}
                        <Link to="/register-org" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Sign up for free
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Visual Hero */}
            <div className="hidden lg:flex w-1/2 bg-[#0F0F16] relative overflow-hidden items-center justify-center p-12">
                {/* Abstract Shapes & Gradients */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-indigo-600/20 via-zinc-900 to-zinc-950 z-0" />
                <div className="absolute top-[10%] right-[10%] w-96 h-96 bg-indigo-500/30 rounded-full blur-[128px] pointer-events-none" />
                <div className="absolute bottom-[10%] left-[10%] w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] pointer-events-none" />

                {/* 3D-like Card/Illustration Container */}
                <div className="relative z-10 w-full max-w-lg aspect-square">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 transform rotate-[-6deg] translate-y-8 translate-x-4 shadow-2xl">
                        {/* Fake Dashboard Elements */}
                        <div className="w-full h-full flex flex-col gap-4 opacity-50">
                            <div className="w-1/2 h-8 bg-white/10 rounded-lg animate-pulse" />
                            <div className="w-full h-32 bg-white/5 rounded-xl border border-white/5" />
                            <div className="flex gap-4">
                                <div className="w-1/3 h-24 bg-indigo-500/20 rounded-xl" />
                                <div className="w-1/3 h-24 bg-violet-500/20 rounded-xl" />
                                <div className="w-1/3 h-24 bg-blue-500/20 rounded-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 transform rotate-[0deg] shadow-2xl flex flex-col justify-between">
                        <div>
                            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl mb-8 flex items-center justify-center shadow-lg">
                                <span className="text-3xl">✨</span>
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                                Seamless work <br />
                                <span className="text-indigo-400">experience.</span>
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                Everything you need to manage tasks, track productivity, and deliver projects on time, all in one place.
                            </p>
                        </div>

                        {/* Fake User Avatars */}
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                                        U{i}
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-zinc-400">
                                <span className="text-white font-semibold">1,000+</span> teams joined
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
