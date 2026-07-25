import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Menu, X, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/signup', label: 'Signup' },
  { to: '/login', label: 'Login' },
];
const authLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/upload', label: 'Upload' },
  { to: '/account', label: 'Account' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navLinks = user ? authLinks : publicLinks;

  useEffect(() => {
    const close = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <motion.header
      initial={{ y: -120 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 22 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-xl shadow-forest-900/10 py-2 sm:py-3'
          : 'bg-transparent py-4 sm:py-6'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
          <motion.span
            whileHover={{ rotate: 18, scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-forest-600 to-earth-600 text-white shadow-lg shrink-0"
          >
            <Leaf className="w-6 h-6 sm:w-7 sm:h-7" />
          </motion.span>
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-forest-800 to-earth-800 bg-clip-text text-transparent group-hover:from-forest-600 group-hover:to-earth-600 transition-all truncate">
            PlantGuard
          </span>
        </Link>

        {/* Desktop nav — lg+ for comfortable spacing on tablets */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {user?.isAdmin && (
            <Link to="/admin" className="group/link">
              <motion.span
                className={`relative block px-3 xl:px-5 py-2.5 xl:py-3 rounded-xl font-semibold text-sm xl:text-base transition-colors ${
                  location.pathname === '/admin' ? 'text-forest-700' : 'text-amber-700 group-hover/link:text-amber-800'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Admin
              </motion.span>
            </Link>
          )}
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="group/link">
              <motion.span
                className={`relative block px-3 xl:px-5 py-2.5 xl:py-3 rounded-xl font-semibold text-sm xl:text-base transition-colors ${
                  location.pathname === to
                    ? 'text-forest-700'
                    : 'text-gray-600 group-hover/link:text-forest-700'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                {label}
                {location.pathname === to && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-forest-100 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {location.pathname !== to && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-forest-500 rounded-full w-0 group-hover/link:w-[80%] transition-all duration-200 -z-10" />
                )}
              </motion.span>
            </Link>
          ))}
          {user && (
            <div className="relative" ref={notifRef}>
              <motion.button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-3 rounded-xl text-gray-600 hover:bg-forest-100 hover:text-forest-700 transition-colors"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </motion.button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden rounded-2xl bg-white shadow-xl border border-forest-100 z-50"
                  >
                    <div className="p-3 border-b border-forest-100 flex items-center justify-between">
                      <span className="font-semibold text-forest-900">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-sm text-forest-600 hover:text-forest-800"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-gray-500 text-sm">No notifications.</p>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => markAsRead(n.id)}
                            className={`w-full text-left px-4 py-3 border-b border-forest-50 hover:bg-forest-50 transition-colors ${!n.read ? 'bg-forest-50/50' : ''}`}
                          >
                            <p className="font-medium text-forest-900 text-sm">{n.title}</p>
                            <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-gray-400 text-xs mt-1">{new Date(n.date).toLocaleDateString()}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {user && (
            <motion.button
              type="button"
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-base text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </motion.button>
          )}
        </div>

        {/* Mobile / tablet menu button */}
        <motion.button
          type="button"
          className="lg:hidden p-2.5 sm:p-3 rounded-xl text-gray-600 hover:bg-forest-100 hover:text-forest-700 transition-colors shrink-0"
          onClick={() => setMobileOpen((o) => !o)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </motion.button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden bg-white/98 backdrop-blur-xl border-b border-forest-100 max-h-[calc(100vh-4.5rem)] overflow-y-auto"
          >
            <div className="px-4 sm:px-5 py-4 sm:py-5 flex flex-col gap-2">
              {user?.isAdmin && (
                <Link to="/admin" className="block px-5 py-4 rounded-xl font-semibold text-amber-700 hover:bg-amber-50">
                  Admin
                </Link>
              )}
              {navLinks.map(({ to, label }, i) => (
                <motion.div
                  key={to}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
                >
                  <Link
                    to={to}
                    className={`block px-5 py-4 rounded-xl font-semibold text-base ${
                      location.pathname === to
                        ? 'bg-forest-100 text-forest-800'
                        : 'text-gray-600 hover:bg-forest-50'
                    }`}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
              {user && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                  >
                    <button
                      type="button"
                      onClick={() => setNotifOpen((o) => !o)}
                      className="relative w-full flex items-center gap-3 px-5 py-4 rounded-xl font-semibold text-base text-gray-600 hover:bg-forest-50"
                    >
                      <Bell className="w-5 h-5" />
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="ml-auto min-w-[20px] h-[20px] px-1.5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                    {notifOpen && (
                      <div className="mt-2 mx-5 rounded-2xl bg-white shadow-xl border border-forest-100 overflow-hidden">
                        <div className="p-3 border-b border-forest-100 flex items-center justify-between">
                          <span className="font-semibold text-forest-900">Notifications</span>
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={markAllAsRead}
                              className="text-sm text-forest-600 hover:text-forest-800"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="p-4 text-gray-500 text-sm">No notifications.</p>
                          ) : (
                            notifications.map((n) => (
                              <button
                                key={n.id}
                                type="button"
                                onClick={() => markAsRead(n.id)}
                                className={`w-full text-left px-4 py-3 border-b border-forest-50 hover:bg-forest-50 transition-colors ${!n.read ? 'bg-forest-50/50' : ''}`}
                              >
                                <p className="font-medium text-forest-900 text-sm">{n.title}</p>
                                <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-gray-400 text-xs mt-1">{new Date(n.date).toLocaleDateString()}</p>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => { logout(); setMobileOpen(false); navigate('/'); }}
                    className="block w-full text-left px-5 py-4 rounded-xl font-semibold text-base text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
