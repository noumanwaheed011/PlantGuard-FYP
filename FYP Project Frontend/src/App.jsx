import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import PageTransition from './components/PageTransition';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OTPVerification from './pages/OTPVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Account from './pages/Account';
import Upload from './pages/Upload';
import Result from './pages/Result';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import AdminRoute from './components/AdminRoute';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import Recommendations from './pages/Recommendations';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/recommendations" element={<PageTransition><Recommendations /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/otp-verification" element={<PageTransition><OTPVerification /></PageTransition>} />
        <Route path="/account" element={<ProtectedRoute><PageTransition><Account /></PageTransition></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><PageTransition><Upload /></PageTransition></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><PageTransition><Result /></PageTransition></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><PageTransition><Admin /></PageTransition></AdminRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
        </Router>
      </NotificationsProvider>
    </AuthProvider>
  );
}
