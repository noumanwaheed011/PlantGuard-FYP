import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { HARVEST_RECOMMENDATIONS } from '../constants/harvestRecommendations';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Recommendations() {
  return (
    <div className="page-shell page-bg-light">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-card mb-8"
        >
          <div className="inline-flex p-3 rounded-2xl bg-forest-100 text-forest-600 mb-6">
            <Sprout className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-forest-900 mb-3">Save Your Harvest</h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            General recommendations to keep your plants healthy, reduce disease risk, and protect
            your crop — no analysis required.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6"
        >
          {HARVEST_RECOMMENDATIONS.map(({ icon: Icon, title, tips }) => (
            <motion.div
              key={title}
              variants={item}
              className="page-card hover:shadow-card-hover transition-shadow"
            >
              <div className="inline-flex p-3 rounded-xl bg-forest-100 text-forest-600 mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-forest-900 mb-4">{title}</h2>
              <ul className="space-y-3">
                {tips.map((tip) => (
                  <li key={tip} className="flex gap-3 text-gray-600 text-sm sm:text-base leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-forest-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-forest-700 font-semibold hover:text-forest-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
