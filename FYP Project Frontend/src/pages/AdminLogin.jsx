import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout } = useAuth();
  const from = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (user?.isAdmin) {
      navigate('/admin', { replace: true });
    } else if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forest-50">
        <div className="w-10 h-10 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setErrors({});
    try {
      const response = await login({
        email: email.trim().toLowerCase(),
        password,
      });
      if (!response.user?.isAdmin) {
        logout();
        setErrors({
          submit: 'This account does not have admin access. Use the regular login for user accounts.',
        });
        setLoading(false);
        return;
      }
      navigate(from, { replace: true });
    } catch (error) {
      setErrors({ submit: error.message || 'Admin login failed. Check your credentials.' });
      setLoading(false);
    }
  };

  return (
    <div className="page-shell-centered page-bg-light">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="page-card border-amber-200/60">
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-amber-100 text-amber-800 text-base font-semibold mb-6">
            <Shield className="w-5 h-5" />
            Admin Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-500 text-sm sm:text-base mb-8">
            Sign in to manage users, view all detections, feedback, and database records.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Admin email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@plantguard.ai"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 outline-none"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
            </div>

            {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

            <AnimatedButton type="submit" variant="primary" fullWidth loading={loading}>
              Sign in as Admin
            </AnimatedButton>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Regular user?{' '}
            <Link to="/login" className="font-semibold text-forest-600 hover:text-forest-700">
              User login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
