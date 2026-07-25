import { AlertTriangle, X } from 'lucide-react';
import { motion } from 'framer-motion';

const TITLES = {
  NOT_A_LEAF: 'Not a leaf image',
  UNSUPPORTED_CROP: 'Unsupported plant',
  LOW_CONFIDENCE: 'Unable to identify',
};

export default function AnalysisErrorAlert({ message, code, onDismiss }) {
  if (!message) return null;

  const title = TITLES[code] || 'Not a valid leaf image';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5 flex gap-3"
      role="alert"
    >
      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-red-800 text-sm sm:text-base">{title}</p>
        <p className="text-red-700 text-sm sm:text-base mt-1 leading-relaxed">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-lg text-red-500 hover:bg-red-100 hover:text-red-700 shrink-0"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
