import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';

const Dashboard = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const res = await api.get('/interviews');
                setInterviews(res.data);
            } catch (err) {
                console.error("Failed to fetch interviews");
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
    }, []);

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <Link to="/interview/new" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2 transform transition hover:scale-105">
                        + New Interview
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 mt-10">Loading history...</div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {interviews.length === 0 ? (
                            <div className="col-span-full text-center py-20 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                                <p className="text-gray-400 text-lg">No interviews yet. Start one now!</p>
                            </div>
                        ) : (
                            interviews.map((interview) => (
                                <div key={interview._id} className="bg-slate-800/50 backdrop-blur border border-slate-700 p-6 rounded-xl hover:border-slate-500 transition shadow-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{interview.role}</h3>
                                            <p className={`text-sm mt-1 px-2 py-0.5 rounded-full inline-block ${interview.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' :
                                                interview.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-green-500/20 text-green-400'
                                                }`}>
                                                {interview.difficulty}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded border ${interview.status === 'Completed' ? 'border-green-500 text-green-400' : 'border-blue-500 text-blue-400'
                                            }`}>
                                            {interview.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Started: {new Date(interview.started_at).toLocaleDateString()}
                                    </p>

                                    {interview.status === 'Completed' ? (
                                        <Link to={`/interview/${interview._id}/result`} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                                            View Details &rarr;
                                        </Link>
                                    ) : (
                                        <Link to={`/interview/${interview._id}`} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                                            Resume Interview &rarr;
                                        </Link>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
