import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Trophy, Mail, Lock, User, ArrowRight, Zap, Target, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profile: {
      firstName: '',
      lastName: '',
      experience: 'beginner',
      targetRole: '',
      targetCompany: ''
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel – Branding */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-primary to-indigo-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-400 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center space-x-3">
          <div className="h-10 w-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">InterviewPrep</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
              Start your journey <br />
              <span className="text-cyan-300">to your dream job</span>
            </h1>
            <p className="mt-3 text-primary-100 leading-relaxed">
              Join thousands of engineers sharpening their skills every day.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: Zap, text: 'Instant coding environment' },
              { icon: Target, text: 'Role-based question sets' },
              { icon: Award, text: 'Real interview simulations' },
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

        <p className="relative z-10 text-white/40 text-xs">© 2025 InterviewPrep</p>
      </div>

      {/* Right Panel – Form */}
      <div className="flex-1 flex items-start justify-center bg-background px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-xl space-y-7">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center space-x-2">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">InterviewPrep</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Create your account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Already have one?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary-700 transition-colors duration-200">
                Sign in
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Two-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Account Info */}
              <div className="md:col-span-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 pb-2 border-b border-border">
                  Account Details
                </h3>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1.5">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input id="username" name="username" type="text" required
                    value={formData.username} onChange={handleChange}
                    className="input pl-10" placeholder="Choose a username" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input id="email" name="email" type="email" autoComplete="email" required
                    value={formData.email} onChange={handleChange}
                    className="input pl-10" placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} required
                    value={formData.password} onChange={handleChange}
                    className="input pl-10 pr-11" placeholder="Min 6 characters" />
                  <button type="button" tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required
                    value={formData.confirmPassword} onChange={handleChange}
                    className="input pl-10 pr-11" placeholder="Repeat password" />
                  <button type="button" tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Profile Info */}
              <div className="md:col-span-2 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 pb-2 border-b border-border">
                  Profile Information <span className="normal-case font-normal">(optional)</span>
                </h3>
              </div>

              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
                <input id="firstName" name="profile.firstName" type="text"
                  value={formData.profile.firstName} onChange={handleChange}
                  className="input" placeholder="Your first name" />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
                <input id="lastName" name="profile.lastName" type="text"
                  value={formData.profile.lastName} onChange={handleChange}
                  className="input" placeholder="Your last name" />
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-foreground mb-1.5">Experience Level</label>
                <select id="experience" name="profile.experience"
                  value={formData.profile.experience} onChange={handleChange}
                  className="input">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label htmlFor="targetRole" className="block text-sm font-medium text-foreground mb-1.5">Target Role</label>
                <input id="targetRole" name="profile.targetRole" type="text"
                  value={formData.profile.targetRole} onChange={handleChange}
                  className="input" placeholder="e.g., Software Engineer" />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="targetCompany" className="block text-sm font-medium text-foreground mb-1.5">Target Company</label>
                <input id="targetCompany" name="profile.targetCompany" type="text"
                  value={formData.profile.targetCompany} onChange={handleChange}
                  className="input" placeholder="e.g., Google, Microsoft, Amazon" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input id="agree-terms" name="agree-terms" type="checkbox" required
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer" />
              <label htmlFor="agree-terms" className="text-sm text-muted-foreground cursor-pointer">
                I agree to the{' '}
                <a href="#!" className="text-primary hover:text-primary-700 font-medium transition-colors duration-200">Terms</a>
                {' '}and{' '}
                <a href="#!" className="text-primary hover:text-primary-700 font-medium transition-colors duration-200">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" disabled={isLoading}
              className="btn btn-primary w-full py-3 text-sm font-semibold group disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
