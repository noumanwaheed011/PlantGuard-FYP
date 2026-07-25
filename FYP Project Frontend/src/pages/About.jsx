import { motion } from 'framer-motion';
import { Sparkles, Target, Zap, BookOpen, Leaf, Crosshair, Lightbulb } from 'lucide-react';
import { APP_STATS } from '../constants/stats';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const whyUs = [
  {
    icon: Zap,
    title: 'AI Powered',
    description: '94% accurate disease detection using neural networks.',
  },
  {
    icon: Target,
    title: 'Instant Results',
    description: 'Get results in seconds to save your plants.',
  },
  {
    icon: BookOpen,
    title: 'Expert Knowledge',
    description: 'Developed with agricultural specialists.',
  },
];

const values = [
  { icon: Leaf, title: 'Sustainability', desc: 'Reducing pesticide waste.', emoji: '🌱' },
  { icon: Crosshair, title: 'Accuracy', desc: 'High quality AI results.', emoji: '🎯' },
  { icon: Lightbulb, title: 'Accessibility', desc: 'Easy for everyone.', emoji: '💡' },
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="relative min-h-[50vh] sm:min-h-[60vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 lg:pb-28 overflow-hidden hero-bg"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
          className="relative max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-gradient-to-r from-forest-600 to-earth-600 text-white text-base font-semibold shadow-xl shadow-forest-600/30 mb-8 animate-pulse-soft"
          >
            <Sparkles className="w-5 h-5" />
            About PlantGuard
          </motion.div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
            <span className="bg-gradient-to-r from-forest-800 via-earth-800 to-forest-700 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Revolutionizing Plant Disease Detection
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            We use AI and computer vision to help farmers and gardeners protect their plants from diseases.
          </p>
        </motion.div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Mission - 2 col */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center mb-16 sm:mb-20 lg:mb-28"
        >
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-forest-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg mb-4">
              We aim to provide fast and accurate plant disease detection for farmers and gardeners.
            </p>
            <p className="text-gray-600 text-lg">
              Early detection saves crops and improves food security.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl overflow-hidden shadow-card bg-gradient-to-br from-forest-500 via-earth-600 to-forest-800 h-80 flex items-center justify-center"
          >
            <Leaf className="w-28 h-28 text-white/90" strokeWidth={1.25} />
          </motion.div>
        </motion.section>

        {/* Why Choose PlantGuard */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl font-bold text-center text-forest-900 mb-16"
        >
          Why Choose PlantGuard AI?
        </motion.h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-16 sm:mb-20 lg:mb-28"
        >
          {whyUs.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={item}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-card border border-forest-100"
            >
              <motion.div
                className="inline-flex p-4 rounded-2xl bg-forest-100 text-forest-600 mb-5"
                whileHover={{ rotate: 12, scale: 1.1 }}
              >
                <Icon className="w-8 h-8" />
              </motion.div>
              <h3 className="text-2xl font-bold text-forest-900 mb-3">{title}</h3>
              <p className="text-gray-600 text-lg">{description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats strip */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-r from-forest-600 to-earth-600 text-white p-8 sm:p-12 lg:p-14 mb-28"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">What PlantGuard Delivers</h2>
          <p className="text-white/85 text-center text-base sm:text-lg mb-10 max-w-2xl mx-auto">
            Practical AI metrics — not inflated user counts.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 text-center">
            {APP_STATS.map(({ value, label, description, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="rounded-2xl bg-white/10 border border-white/20 p-6 sm:p-8"
              >
                <div className="inline-flex p-3 rounded-xl bg-white/15 mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-4xl sm:text-5xl font-bold block tabular-nums">{value}</span>
                <span className="text-white/90 text-base sm:text-lg font-medium mt-2 block">{label}</span>
                <p className="text-white/75 text-sm sm:text-base mt-3 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Values */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl font-bold text-center text-forest-900 mb-16"
        >
          Our Values
        </motion.h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10"
        >
          {values.map(({ icon: Icon, title, desc, emoji }) => (
            <motion.div
              key={title}
              variants={item}
              whileHover={{ y: -4 }}
              className="text-center p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-forest-50 border-2 border-forest-100"
            >
              <span className="text-4xl mb-3 block">{emoji}</span>
              <div className="inline-flex p-3 rounded-xl bg-forest-100 text-forest-600 mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-forest-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-lg">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
