import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import ActiveInterview from './pages/ActiveInterview';
import Results from './pages/Results';
import AIPlayground from './pages/AIPlayground';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return children; // Always allow access
};

const Home = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">AI Mock Interview</h1>
    <p className="text-xl text-gray-300 mb-8">Master your technical interviews with AI-driven feedback.</p>
    <div className="space-x-4">
      <a href="/login" className="px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition">Get Started</a>
      <a href="/playground" className="px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition">Try AI Playground</a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/interview/new" element={
            <PrivateRoute>
              <InterviewSetup />
            </PrivateRoute>
          } />
          <Route path="/interview/:id" element={
            <PrivateRoute>
              <ActiveInterview />
            </PrivateRoute>
          } />
          <Route path="/interview/:id/result" element={
            <PrivateRoute>
              <Results />
            </PrivateRoute>
          } />
          <Route path="/playground" element={<AIPlayground />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
