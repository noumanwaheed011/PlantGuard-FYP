import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, CheckCircle, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnimatedButton from '../components/AnimatedButton';
import { APP_STATS } from '../constants/stats';

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(password)) return 'Password must contain at least one letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  return null;
};

export default function Signup() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signup } = useAuth();

  useEffect(() => {
    if (user) navigate('/account', { replace: true });
  }, [user, navigate]);

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => {
      const next = { ...e, [field]: null };
      if (field !== 'agreeTerms') delete next.submit;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(form.email)) newErrors.email = 'Please enter a valid email';
    if (!form.password) newErrors.password = 'Password is required';
    else {
      const pwErr = validatePassword(form.password);
      if (pwErr) newErrors.password = pwErr;
    }
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!form.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await signup({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        name: form.fullName.trim(),
        fullName: form.fullName.trim(),
      });
      // Redirect to OTP verification
      setLoading(false);
      navigate('/otp-verification', { state: { email: form.email.trim().toLowerCase() } });
    } catch (error) {
      setErrors({ submit: error.message || 'Signup failed. Please try again.' });
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forest-50">
        <div className="w-10 h-10 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Full-screen "Account Created Successfully" overlay
  if (signupSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 py-28 bg-gradient-to-br from-forest-50 via-white to-forest-100"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
            className="inline-flex p-6 rounded-full bg-forest-100 text-forest-600 mb-6"
          >
            <CheckCircle className="w-20 h-20" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-forest-900 mb-2"
          >
            Account Created Successfully
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600"
          >
            Redirecting to your account...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-shell-centered page-bg-light">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="w-full max-w-6xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-14 items-center">
          {/* Left - image card (hidden on small) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 80 }}
            className="hidden lg:block"
          >
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl shadow-card p-10 border border-forest-100"
            >
              <div className="w-full h-80 rounded-2xl mb-8 bg-gradient-to-br from-forest-500 via-earth-600 to-forest-800 flex items-center justify-center">
                <Leaf className="w-24 h-24 text-white/90" strokeWidth={1.25} />
              </div>
              <h3 className="text-2xl font-bold text-forest-900 mb-3">Smart Plant Care</h3>
              <p className="text-gray-600 text-base mb-8">
                Get started with advanced AI technology to monitor and protect your plants from diseases.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {APP_STATS.map(({ value, label }) => (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.03 }}
                    className="bg-forest-100 text-forest-800 rounded-2xl p-5 text-center"
                  >
                    <strong className="block text-xl">{value}</strong>
                    <span className="text-base">{label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right - form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 80 }}
            className="page-card"
          >
            <div className="inline-block px-4 py-2.5 rounded-full bg-gradient-to-r from-forest-600 to-earth-600 text-white text-base font-semibold mb-6">
              Get Started Free
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-500 text-base mb-10">
              Join our community and start protecting your plants today
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                    placeholder="John Doe"
                    className={`w-full h-14 pl-12 pr-4 rounded-2xl border-2 bg-gray-50/50 focus:bg-white text-base outline-none transition-all duration-200 ${
                      errors.fullName ? 'border-red-400' : 'border-gray-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-400/30'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-2 text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full h-14 pl-12 pr-4 rounded-2xl border-2 bg-gray-50/50 focus:bg-white text-base outline-none transition-all duration-200 ${
                      errors.email ? 'border-red-400' : 'border-gray-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-400/30'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="Create a password"
                    className={`w-full h-14 pl-12 pr-14 rounded-2xl border-2 bg-gray-50/50 focus:bg-white text-base outline-none transition-all duration-200 ${
                      errors.password ? 'border-red-400' : 'border-gray-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-400/30'
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
                <p className="mt-1.5 text-xs text-gray-500">At least 8 characters, one letter and one number</p>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => update('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className={`w-full h-14 pl-12 pr-14 rounded-2xl border-2 bg-gray-50/50 focus:bg-white text-base outline-none transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-400' : 'border-gray-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-400/30'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 min-w-10 min-h-10 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-inset"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5 shrink-0" /> : <Eye className="w-5 h-5 shrink-0" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer text-base text-gray-600">
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) => update('agreeTerms', e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-forest-600 focus:ring-forest-500"
                  />
                  <span>
                    By creating an account, I agree to the{' '}
                    <Link to="/terms" className="text-forest-600 font-semibold hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-forest-600 font-semibold hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="mt-2 text-sm text-red-500">{errors.agreeTerms}</p>
                )}
              </div>

              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-50 border border-red-200"
                >
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </motion.div>
              )}

              <AnimatedButton
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Create Account
              </AnimatedButton>
            </form>

            <p className="mt-8 text-center text-base text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-forest-600 hover:text-forest-700">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

