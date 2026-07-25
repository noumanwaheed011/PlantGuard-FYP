import { motion } from 'framer-motion';

/**
 * Reusable animated button with hover/tap effects.
 * @param {string} variant - 'primary' | 'outline' | 'ghost'
 * @param {React.ReactNode} children
 * @param {string} className - additional Tailwind classes
 * @param {boolean} fullWidth
 * @param {object} rest - spread to <button> or <motion.button>
 */
export default function AnimatedButton({
  variant = 'primary',
  children,
  className = '',
  fullWidth = false,
  loading = false,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none';

  const variants = {
    primary:
      'bg-gradient-to-r from-forest-600 to-earth-600 text-white shadow-lg shadow-forest-600/25 hover:shadow-green-glow hover:from-forest-500 hover:to-earth-700 active:scale-[0.98]',
    outline:
      'border-2 border-forest-600 text-forest-700 bg-transparent hover:bg-forest-50 hover:border-forest-500 active:scale-[0.98]',
    ghost:
      'text-forest-700 bg-forest-100/80 hover:bg-forest-200/80 active:scale-[0.98]',
  };

  const sizeClass = 'px-5 py-3 text-base min-h-[48px] sm:px-8 sm:py-4 sm:text-lg sm:min-h-[56px]';

  return (
    <motion.button
      type="button"
      className={`${base} ${variants[variant]} ${sizeClass} ${fullWidth ? 'w-full' : ''} ${className}`}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
      disabled={loading}
      {...rest}
    >
      {loading ? (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
