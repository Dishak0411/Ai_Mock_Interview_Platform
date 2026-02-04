import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';

const InterviewSetup = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('Data Scientist');
    const [difficulty, setDifficulty] = useState('Medium');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/interviews', { role, difficulty });
            navigate(`/interview/${res.data._id}`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto mt-10">
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-8 rounded-xl shadow-2xl">
                    <h1 className="text-3xl font-bold text-white mb-6">Start New Interview</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Select Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none"
                            >
                                <option>Data Scientist</option>
                                <option>Machine Learning Engineer</option>
                                <option>Backend Developer</option>
                                <option>Frontend Developer</option>
                                <option>Full Stack Developer</option>
                                <option>DevOps Engineer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty Level</label>
                            <div className="grid grid-cols-3 gap-4">
                                {['Easy', 'Medium', 'Hard'].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setDifficulty(level)}
                                        className={`py-3 rounded-lg font-medium transition-all ${difficulty === level
                                                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-lg font-bold rounded-lg shadow-lg transform transition hover:scale-[1.02]"
                        >
                            {loading ? 'Initializing Interface...' : 'Start Interview Session'}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default InterviewSetup;
