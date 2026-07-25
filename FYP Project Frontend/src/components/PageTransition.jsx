import { motion } from 'framer-motion';

/**
 * Wraps page content for consistent enter/exit animations with AnimatePresence.
 */
export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
