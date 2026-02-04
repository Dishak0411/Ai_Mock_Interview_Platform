import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="w-full max-w-md p-8 space-y-6 bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 shadow-2xl">
                    <h2 className="text-3xl font-bold text-center text-white">Welcome Back</h2>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                        <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/20">
                            Login
                        </button>
                    </form>
                    <p className="text-center text-gray-400">
                        Don't have an account? <Link to="/register" className="text-blue-400 hover:underline">Sign up</Link>
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default Login;
