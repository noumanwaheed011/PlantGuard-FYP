import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const from = location.state?.from?.pathname || '/account';
  const passwordResetSuccess = location.state?.passwordReset === true;

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  useEffect(() => {
    if (passwordResetSuccess) {
      const t = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: { from: location.state?.from } });
      }, 8000);
      return () => clearTimeout(t);
    }
  }, [passwordResetSuccess, navigate, location.pathname, location.state?.from]);

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
      navigate(response.user?.isAdmin ? '/admin' : from, { replace: true });
    } catch (error) {
      setErrors({ submit: error.message || 'Login failed. Please check your credentials.' });
      setLoading(false);
    }
  };

  return (
    <div className="page-shell-centered page-bg-light">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="w-full max-w-lg"
      >
        <div className="page-card">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-forest-600 to-earth-600 text-white text-base font-semibold mb-6"
          >
            <Sparkles className="w-5 h-5" />
            Welcome Back
          </motion.div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Login to PlantGuard AI</h1>
          <p className="text-gray-500 text-sm sm:text-base mb-8 sm:mb-10">
            Continue protecting your plants with AI-powered disease detection
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((e) => ({ ...e, email: null }));
                  }}
                  placeholder="you@example.com"
                  className={`w-full h-12 sm:h-14 pl-12 pr-4 rounded-2xl border-2 bg-gray-50/50 focus:bg-white text-base transition-all duration-200 outline-none ${
                    errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-400/30'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">{errors.email}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.28 }}
            >
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((e) => ({ ...e, password: null }));
                  }}
                  placeholder="Enter your password"
                  className={`w-full h-12 sm:h-14 pl-12 pr-14 rounded-2xl border-2 bg-gray-50/50 focus:bg-white text-base transition-all duration-200 outline-none ${
                    errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-400/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 min-w-10 min-h-10 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-inset"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5 shrink-0" /> : <Eye className="w-5 h-5 shrink-0" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500">{errors.password}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 text-sm sm:text-base"
            >
              <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-gray-300 text-forest-600 focus:ring-forest-500"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                state={{ from: location.state?.from, email: email.trim().toLowerCase() || undefined }}
                className="text-forest-600 hover:text-forest-700 font-medium"
              >
                Forgot password?
              </Link>
            </motion.div>

            {passwordResetSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-forest-50 border border-forest-200 text-sm text-forest-800"
              >
                Your password has been reset successfully. You can now sign in with your new password.
              </motion.div>
            )}

            {errors.submit && (
              <p className="text-sm text-red-500">{errors.submit}</p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <AnimatedButton
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Sign In
              </AnimatedButton>
            </motion.div>
          </form>

          <p className="mt-8 text-center text-base text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-forest-600 hover:text-forest-700">
              Sign up for free
            </Link>
          </p>
          <p className="mt-4 text-center text-sm text-gray-500">
            Administrator?{' '}
            <Link to="/admin/login" className="font-semibold text-amber-700 hover:text-amber-800">
              Admin login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
