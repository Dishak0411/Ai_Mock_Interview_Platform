import { useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

const AIPlayground = () => {
    // State for Generation
    const [role, setRole] = useState('Data Scientist');
    const [difficulty, setDifficulty] = useState('Medium');
    const [generatedQuestion, setGeneratedQuestion] = useState('');
    const [genLoading, setGenLoading] = useState(false);

    // State for Evaluation
    const [evalQuestion, setEvalQuestion] = useState('');
    const [userAnswer, setUserAnswer] = useState('');
    const [evaluation, setEvaluation] = useState(null);
    const [evalLoading, setEvalLoading] = useState(false);

    const handleGenerate = async () => {
        setGenLoading(true);
        setGeneratedQuestion('');
        try {
            const res = await api.post('/ai-debug/generate', { role, difficulty });
            setGeneratedQuestion(res.data.question);
            setEvalQuestion(res.data.question); // Auto-fill for evaluation part
        } catch (err) {
            alert("Generation failed: " + err.message);
        } finally {
            setGenLoading(false);
        }
    };

    const handleEvaluate = async () => {
        if (!evalQuestion || !userAnswer) return;
        setEvalLoading(true);
        setEvaluation(null);
        try {
            const res = await api.post('/ai-debug/evaluate', {
                role,
                question: evalQuestion,
                user_answer: userAnswer
            });
            setEvaluation(res.data);
        } catch (err) {
            alert("Evaluation failed: " + err.message);
        } finally {
            setEvalLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                        AI Model Playground
                    </h1>
                    <p className="text-gray-400 mt-2">Test the LLM capabilities interactively without logging in.</p>
                </div>

                {/* Section 1: Generation */}
                <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2">1. Test Question Generation</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-400 mb-1">Role</label>
                            <input
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-1">Difficulty</label>
                            <select
                                value={difficulty}
                                onChange={e => setDifficulty(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                            >
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={genLoading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                    >
                        {genLoading ? 'Generating...' : 'Generate Random Question'}
                    </button>

                    {generatedQuestion && (
                        <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-blue-500/30">
                            <p className="text-gray-400 text-sm uppercase tracking-wide mb-1">Output:</p>
                            <p className="text-lg text-white font-mono">{generatedQuestion}</p>
                        </div>
                    )}
                </div>

                {/* Section 2: Evaluation */}
                <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2">2. Test Answer Evaluation</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 mb-1">Question to Evaluate</label>
                            <textarea
                                value={evalQuestion}
                                onChange={e => setEvalQuestion(e.target.value)}
                                placeholder="Enter a question here (or generate one above)..."
                                className="w-full h-24 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-1">Candidate Answer</label>
                            <textarea
                                value={userAnswer}
                                onChange={e => setUserAnswer(e.target.value)}
                                placeholder="Type a mock answer here..."
                                className="w-full h-32 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            ></textarea>
                        </div>

                        <button
                            onClick={handleEvaluate}
                            disabled={evalLoading}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition"
                        >
                            {evalLoading ? 'Evaluating...' : 'Evaluate Answer'}
                        </button>
                    </div>

                    {evaluation && (
                        <div className="mt-6 p-6 bg-slate-900 rounded-lg border border-purple-500/30 animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white">Result</h3>
                                <span className={`text-2xl font-bold ${evaluation.score >= 7 ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {evaluation.score}/10
                                </span>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-gray-400">Feedback</p>
                                    <p className="text-white">{evaluation.feedback}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Correctness</p>
                                    <p className="text-white">{evaluation.correctness}</p>
                                </div>
                                <div className="col-span-full">
                                    <p className="text-sm text-gray-400">Ideal Answer</p>
                                    <p className="text-green-300 bg-green-900/10 p-2 rounded">{evaluation.ideal_answer}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AIPlayground;
