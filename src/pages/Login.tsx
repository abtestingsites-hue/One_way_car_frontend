import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { Lock, Mail, Car, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            login(response.data.token, response.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4 relative overflow-hidden">
            {/* Background Accent Gradients */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-800/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="bg-dark-900 border border-dark-800 p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md relative z-10 text-white">
                <div className="text-center mb-8">
                    {/* Brand Badge */}
                    <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-red-glow mx-auto mb-4 flex items-center justify-center border-2 border-red-600">
                        <Car size={36} className="text-red-600" />
                    </div>
                    <h1 className="text-2xl font-montserrat font-extrabold text-white tracking-tight flex items-center justify-center gap-1.5">
                        <span>ONE WAY</span>
                        <span className="text-red-600">CAR DECORS</span>
                    </h1>
                    <p className="text-silver-400 text-xs uppercase tracking-widest mt-1">
                        Billing & Inventory Management
                    </p>
                </div>

                {error && (
                    <div className="bg-red-950/60 border border-red-800 text-red-300 p-3 rounded-xl mb-5 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-silver-300 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-silver-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-dark-950 border border-dark-700 rounded-xl text-white placeholder-silver-500 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-sm"
                                placeholder="superadmin@gmail.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-silver-300 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-silver-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-dark-950 border border-dark-700 rounded-xl text-white placeholder-silver-500 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-red-glow flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
                    >
                        <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                        <ArrowRight size={18} />
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-silver-500">
                    One Way Car Decors Management System &copy; 2026
                </div>
            </div>
        </div>
    );
};

export default Login;
