import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';

const Results = () => {
    const { id } = useParams();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await api.get(`/interviews/${id}`);
                setInterview(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [id]);

    if (loading) return <Layout><div className="text-white text-center mt-20">Loading Results...</div></Layout>;
    if (!interview) return <Layout><div className="text-red-400 text-center mt-20">Results not found</div></Layout>;

    const report = interview.feedback_report || {};

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl font-bold text-green-400">
                            {report.overall_score || 0}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Interview Performance</h1>
                    <p className="text-gray-400 mt-2">Role: {interview.role} | Difficulty: {interview.difficulty}</p>
                </div>

                {/* Report Grid */}
                {report.overall_score !== undefined ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-xl font-bold text-green-400 mb-4">Strengths</h3>
                            <ul className="space-y-2">
                                {(report.strengths && report.strengths.length > 0) ? (
                                    report.strengths.map((s, i) => (
                                        <li key={i} className="flex items-start text-gray-300">
                                            <span className="text-green-500 mr-2">✓</span> {s}
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No specific strengths identified yet.</p>
                                )}
                            </ul>
                        </div>

                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-xl font-bold text-yellow-400 mb-4">Areas for Improvement</h3>
                            <ul className="space-y-2">
                                {(report.weak_areas && report.weak_areas.length > 0) ? (
                                    report.weak_areas.map((w, i) => (
                                        <li key={i} className="flex items-start text-gray-300">
                                            <span className="text-yellow-500 mr-2">!</span> {w}
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No specific weak areas found. Great job!</p>
                                )}
                            </ul>
                        </div>

                        <div className="col-span-full bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-xl font-bold text-blue-400 mb-2">Summary</h3>
                            <p className="text-white text-lg">{report.summary}</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center">
                        <p className="text-gray-400">No detailed report available for this session.</p>
                    </div>
                )}

                <Link to="/dashboard" className="block text-center py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition shadow-lg">
                    Back to Dashboard
                </Link>
            </div>
        </Layout>
    );
};

export default Results;
