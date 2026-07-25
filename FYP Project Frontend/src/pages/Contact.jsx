import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { CONTACT } from '../constants/contact';

export default function Contact() {
  return (
    <div className="page-shell page-bg-light">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-card"
        >
          <div className="inline-flex p-3 rounded-2xl bg-forest-100 text-forest-600 mb-6">
            <MessageCircle className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-forest-900 mb-2">Contact Us</h1>
          <p className="text-gray-600 mb-8">
            Have questions about PlantGuard AI, your account, or our plant disease detection service?
            Reach out using the details below.
          </p>

          <div className="space-y-4">
            <a
              href={CONTACT.gmailLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-forest-50 border border-forest-100 hover:border-forest-300 transition-colors"
            >
              <span className="p-2 rounded-xl bg-forest-100 text-forest-600 shrink-0">
                <Mail className="w-5 h-5" />
              </span>
              <div>
                <p className="font-semibold text-forest-900">Email</p>
                <p className="text-forest-700 break-all">{CONTACT.email}</p>
              </div>
            </a>

            <a
              href={`tel:${CONTACT.phoneTel}`}
              className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-forest-50 border border-forest-100 hover:border-forest-300 transition-colors"
            >
              <span className="p-2 rounded-xl bg-forest-100 text-forest-600 shrink-0">
                <Phone className="w-5 h-5" />
              </span>
              <div>
                <p className="font-semibold text-forest-900">Phone</p>
                <p className="text-forest-700">{CONTACT.phoneDisplay}</p>
              </div>
            </a>

            <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-forest-50 border border-forest-100">
              <span className="p-2 rounded-xl bg-forest-100 text-forest-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </span>
              <div>
                <p className="font-semibold text-forest-900">Location</p>
                <p className="text-forest-700">{CONTACT.location}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center px-5 py-3 rounded-xl font-semibold text-white bg-forest-600 hover:bg-forest-700 transition-colors"
            >
              Create an account
            </Link>
            <Link
              to="/"
              className="inline-flex items-center px-5 py-3 rounded-xl font-semibold text-forest-700 bg-forest-100 hover:bg-forest-200 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
