import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(email, password, fullName);
            navigate('/dashboard');
        } catch (err) {
            console.error("Registration Error:", err);
            const msg = err.response?.data?.detail || 'Registration failed. Please check your connection.';
            setError(msg);
        }
    };

    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="w-full max-w-md p-8 space-y-6 bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 shadow-2xl">
                    <h2 className="text-3xl font-bold text-center text-white">Create Account</h2>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full mt-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mt-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-emerald-500/20">
                            Sign Up
                        </button>
                    </form>
                    <p className="text-center text-gray-400">
                        Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default Register;
