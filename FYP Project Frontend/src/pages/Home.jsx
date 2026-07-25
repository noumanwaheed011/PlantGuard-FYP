import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ScanSearch, ClipboardCheck, Sprout, ArrowRight } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedCounter from '../components/AnimatedCounter';
import { APP_STATS } from '../constants/stats';
import { useAuth } from '../context/AuthContext';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.25 },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

const features = [
  {
    id: 'scan',
    icon: ScanSearch,
    title: 'AI Leaf Scan',
    description: 'Upload a leaf photo and get AI disease identification in seconds.',
    to: '/upload',
    cta: 'Start detection',
    gradient: 'from-emerald-400 via-forest-600 to-teal-800',
    badgeClass: 'from-emerald-100 to-forest-100 text-forest-700',
  },
  {
    id: 'treatment',
    icon: ClipboardCheck,
    title: 'Expert Treatment Plans',
    description: 'Every result includes symptoms, causes, and step-by-step treatment advice.',
    to: '/about',
    cta: 'View treatment info',
    gradient: 'from-lime-400 via-forest-600 to-earth-800',
    badgeClass: 'from-lime-100 to-forest-100 text-earth-800',
  },
  {
    id: 'harvest',
    icon: Sprout,
    title: 'Save Your Harvest',
    description: 'Follow practical tips on watering, pruning, nutrition, and disease prevention.',
    to: '/recommendations',
    cta: 'View recommendations',
    gradient: 'from-amber-300 via-forest-500 to-earth-700',
    badgeClass: 'from-amber-100 to-earth-100 text-earth-800',
  },
];

export default function Home() {
  const { user } = useAuth();

  const featureLinks = features.map((feature) => {
    if (feature.id === 'scan') {
      return { ...feature, to: user ? '/upload' : '/login', cta: user ? 'Analyze now' : 'Login to analyze' };
    }
    return feature;
  });
  return (
    <div className="min-h-screen">
      {/* Hero - larger, full impact */}
      <section
        className="relative min-h-[85vh] sm:min-h-[90vh] lg:min-h-[95vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-20 sm:pb-24 lg:pb-28 overflow-hidden hero-bg"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-full bg-gradient-to-r from-forest-600 to-earth-600 text-white text-sm sm:text-base font-semibold shadow-xl shadow-forest-600/30 mb-6 sm:mb-8 animate-pulse-soft"
          >
            <Sparkles className="w-5 h-5" />
            AI-Powered Plant Disease Detection
          </motion.div>
          <motion.h1
            variants={item}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 sm:mb-8 leading-[1.15] sm:leading-[1.1]"
          >
            <span className="bg-gradient-to-r from-forest-800 via-earth-800 to-forest-700 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Protect Your Plants
            </span>
            <br />
            <span className="text-gray-800">with Advanced Computer Vision</span>
          </motion.h1>
          <motion.p
            variants={item}
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2"
          >
            Upload a photo of your plant and get instant AI-powered disease identification
            with expert treatment recommendations.
          </motion.p>
          <motion.div variants={item} className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-5 justify-center w-full max-w-md sm:max-w-none mx-auto">
            <Link to="/signup" className="w-full sm:w-auto">
              <AnimatedButton variant="primary" fullWidth className="sm:w-auto">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </AnimatedButton>
            </Link>
            <Link to="/about" className="w-full sm:w-auto">
              <AnimatedButton variant="outline" fullWidth className="sm:w-auto">
                Learn More
              </AnimatedButton>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features - bigger cards, floating animation */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-forest-50/80">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-forest-900 mb-4 sm:mb-6"
          >
            Why PlantGuard AI?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center text-gray-600 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-12 sm:mb-16 lg:mb-20 px-2"
          >
            From detection to treatment—all in one place.
          </motion.p>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10"
          >
            {featureLinks.map(({ icon: Icon, title, description, to, cta, gradient, badgeClass }, i) => (
              <motion.div
                key={title}
                variants={item}
                transition={{ delay: i * 0.05 }}
                style={{ animationDelay: `${i * 0.2}s` }}
                className={`group relative bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 border border-forest-100 animate-float${i === 1 ? '-slow' : ''}`}
              >
                <Link to={to} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 rounded-3xl">
                  <div className={`aspect-[4/3] overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_55%)]" />
                    <div className="absolute top-6 right-6 w-20 h-20 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-8 left-8 w-16 h-16 rounded-full bg-black/10 blur-xl" />
                    <motion.div
                      className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-[1.75rem] bg-white/25 backdrop-blur-md border border-white/35 shadow-[0_12px_40px_rgba(0,0,0,0.15)] text-white"
                      whileHover={{ scale: 1.08, rotate: -4 }}
                    >
                      <Icon className="w-12 h-12 sm:w-14 sm:h-14" strokeWidth={1.35} />
                    </motion.div>
                  </div>
                  <div className="p-6 sm:p-8 lg:p-10">
                    <div className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${badgeClass} mb-4 shadow-sm group-hover:scale-105 transition-transform`}>
                      <Icon className="w-7 h-7" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-forest-900 mb-2 sm:mb-3 group-hover:text-forest-700 transition-colors">
                      {title}
                    </h3>
                    <p className="text-gray-600 text-base sm:text-lg mb-4">{description}</p>
                    <span className="inline-flex items-center gap-2 text-forest-700 font-semibold text-base group-hover:gap-3 transition-all">
                      {cta}
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats - real capabilities, not vanity metrics */}
      <motion.section
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-forest-600 via-earth-600 to-forest-600 text-white"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
              Built for Real Plant Care
            </h2>
            <p className="text-white/85 text-base sm:text-lg max-w-2xl mx-auto">
              Honest numbers from our AI pipeline — fast scans, accurate labels, and expert treatment guides.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 text-center">
            {APP_STATS.map(({ value, label, description, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 sm:p-8"
              >
                <div className="inline-flex p-3 rounded-xl bg-white/15 mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <AnimatedCounter value={value} label={label} delay={i * 0.1} />
                <p className="text-white/75 text-sm sm:text-base mt-3 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
