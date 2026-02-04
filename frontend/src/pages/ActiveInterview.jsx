import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';

const ActiveInterview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [question, setQuestion] = useState(null);
    const [answer, setAnswer] = useState('');
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const intRes = await api.get(`/interviews/${id}`);
                setInterview(intRes.data);
                // Start by fetching next question
                await fetchNextQuestion();
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id]);

    const fetchNextQuestion = async () => {
        try {
            setLoading(true);
            setEvaluation(null);
            setAnswer('');
            setQuestion(null);
            const res = await api.post(`/interviews/${id}/next_question`);
            setQuestion(res.data);
        } catch (err) {
            console.error(err);
            // If max questions reached or completed, valid navigation might be needed
            // For now assume error means complete or done
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        setSubmitting(true);
        try {
            const res = await api.post(`/interviews/${id}/submit_answer`, {
                question_id: question._id,
                user_answer_text: answer
            });
            setEvaluation(res.data.ai_evaluation);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleComplete = async () => {
        await api.post(`/interviews/${id}/complete`);
        navigate(`/interview/${id}/result`);
    };

    if (loading && !question) return <Layout><div className="text-center mt-20 text-white">Loading Interface...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center text-gray-400 text-sm">
                    <span>Role: {interview?.role}</span>
                    <span>Difficulty: {interview?.difficulty}</span>
                </div>

                {/* Question Card */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h2 className="text-lg text-blue-400 font-semibold mb-2">Question {question?.order_index}</h2>
                    <p className="text-xl text-white leading-relaxed">{question?.question_text}</p>
                </div>

                {/* Answer Area */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <label className="block text-gray-300 mb-2 font-medium">Your Answer:</label>
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="w-full h-40 bg-slate-900 border border-slate-600 rounded-lg p-4 text-white resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Type your answer here..."
                        disabled={!!evaluation}
                    ></textarea>

                    {!evaluation ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !answer.trim()}
                            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50"
                        >
                            {submitting ? 'Analyzing...' : 'Submit Answer'}
                        </button>
                    ) : (
                        <div className="mt-6 animate-fade-in">
                            <div className={`p-4 rounded-lg border ${evaluation.score >= 7 ? 'bg-green-900/20 border-green-500/50' :
                                    evaluation.score >= 4 ? 'bg-yellow-900/20 border-yellow-500/50' :
                                        'bg-red-900/20 border-red-500/50'
                                }`}>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-lg text-white">AI Evaluation</h3>
                                    <span className="text-2xl font-bold text-white">{evaluation.score}/10</span>
                                </div>
                                <p className="text-gray-300 mb-2"><strong className="text-gray-100">Feedback:</strong> {evaluation.feedback}</p>
                                <div className="space-y-2 mt-4">
                                    <p className="text-sm text-green-400"><strong>Ideal Answer:</strong> {evaluation.ideal_answer}</p>
                                    <div>
                                        <p className="text-sm text-blue-400 font-semibold">Improvement Tips:</p>
                                        <ul className="list-disc list-inside text-sm text-gray-400">
                                            {evaluation.improvement_tips?.map((tip, i) => (
                                                <li key={i}>{tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-4">
                                <button
                                    onClick={handleComplete}
                                    className="px-6 py-2 text-red-400 hover:text-red-300 font-medium"
                                >
                                    End Interview
                                </button>
                                <button
                                    onClick={fetchNextQuestion}
                                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                                >
                                    Next Question &rarr;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ActiveInterview;
