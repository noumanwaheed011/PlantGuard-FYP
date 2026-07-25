import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Mail, MapPin, Phone } from 'lucide-react';
import { CONTACT } from '../constants/contact';

const footerLinks = {
  Product: [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/upload', label: 'Upload & Analyze' },
    { to: '/login', label: 'Login' },
    { to: '/signup', label: 'Sign Up' },
  ],
  Company: [
    { to: '/contact', label: 'Contact' },
    { to: '/about', label: 'About Us' },
    { to: '/admin/login', label: 'Admin Login' },
  ],
  Legal: [
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms of Service' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative z-10 bg-forest-950 text-forest-100 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-forest-600/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-40 sm:w-64 lg:w-80 h-40 sm:h-64 lg:h-80 bg-earth-600/20 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="lg:col-span-2"
          >
            <Link to="/" className="inline-flex items-center gap-3 mb-6 sm:mb-8">
              <motion.span
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="p-2.5 rounded-2xl bg-forest-600/30 text-forest-300"
              >
                <Leaf className="w-7 h-7" />
              </motion.span>
              <span className="text-xl sm:text-2xl font-bold text-white">PlantGuard AI</span>
            </Link>
            <p className="text-forest-300 max-w-md mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
              AI-powered plant disease detection. Protect your crops and gardens with
              instant, accurate diagnosis and expert treatment recommendations.
            </p>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-forest-400">
              <a
                href={CONTACT.gmailLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-forest-200 transition-colors break-all"
              >
                <Mail className="w-4 h-4 shrink-0" />
                {CONTACT.email}
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                {CONTACT.location}
              </p>
              <a
                href={`tel:${CONTACT.phoneTel}`}
                className="flex items-center gap-2 hover:text-forest-200 transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                {CONTACT.phoneDisplay}
              </a>
            </div>
          </motion.div>

          {Object.entries(footerLinks).map(([title, links], colIndex) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: colIndex * 0.1 }}
            >
              <h4 className="font-semibold text-white text-base sm:text-lg mb-4 sm:mb-5">{title}</h4>
              <ul className="space-y-3 sm:space-y-4">
                {links.map(({ to, label }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-forest-400 hover:text-forest-200 transition-colors text-sm sm:text-base inline-block"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 lg:mt-20 pt-8 sm:pt-10 border-t border-forest-800 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-5 text-center sm:text-left"
        >
          <p className="text-sm sm:text-base text-forest-500">
            © {new Date().getFullYear()} PlantGuard AI. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-sm sm:text-base">
            <Link to="/privacy" className="text-forest-500 hover:text-forest-300 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-forest-500 hover:text-forest-300 transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="text-forest-500 hover:text-forest-300 transition-colors">
              Contact
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
