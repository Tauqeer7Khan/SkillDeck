import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Trophy, Mail, Lock, ArrowRight, Zap, Target, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel – Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-indigo-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-400 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">InterviewPrep</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Ace your next <br />
              <span className="text-cyan-300">tech interview</span>
            </h1>
            <p className="mt-4 text-primary-100 text-lg leading-relaxed">
              Practice curated DSA problems, track your progress, and land your dream job.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Zap, text: 'Timed practice sessions' },
              { icon: Target, text: 'Difficulty-based filtering' },
              { icon: Award, text: 'Progress tracking & streaks' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-cyan-300" />
                </div>
                <span className="text-primary-100 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/50 text-xs">© 2025 InterviewPrep. Built for engineers.</p>
        </div>
      </div>

      {/* Right Panel – Form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">InterviewPrep</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary-700 transition-colors duration-200">
                Sign up for free
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-10 pr-11"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:text-primary-700 transition-colors duration-200 bg-transparent border-none p-0 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3 text-sm font-semibold group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-background px-3">Demo credentials</span>
            </div>
          </div>

          <div className="bg-muted rounded-[12px] p-4 space-y-1">
            <p className="text-xs text-muted-foreground">
              Email: <code className="font-mono text-foreground font-medium">admin@interviewprep.com</code>
            </p>
            <p className="text-xs text-muted-foreground">
              Password: <code className="font-mono text-foreground font-medium">admin123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
