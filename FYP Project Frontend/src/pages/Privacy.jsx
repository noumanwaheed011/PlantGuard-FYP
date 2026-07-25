import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { CONTACT } from '../constants/contact';

export default function Privacy() {
  return (
    <div className="page-shell page-bg-light">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-card"
        >
          <div className="inline-flex p-3 rounded-2xl bg-forest-100 text-forest-600 mb-6">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-forest-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-forest-900 mb-2">Information we collect</h2>
              <p>
                When you create an account, we collect your name, email address, and password (stored securely
                using encryption). When you upload plant images for analysis, we store those images and the
                associated detection results linked to your account.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-forest-900 mb-2">How we use your information</h2>
              <p>
                We use your data to provide plant disease detection, save your analysis history, send account
                verification codes, and improve our AI service. We do not sell your personal information to third
                parties.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-forest-900 mb-2">Data security</h2>
              <p>
                We use industry-standard security measures including hashed passwords and secure API
                communication. Access to admin data is restricted to authorized administrators only.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-forest-900 mb-2">Your rights</h2>
              <p>
                You may update your profile, change your password, or request account-related assistance by
                contacting us at{' '}
                <a
                  href={CONTACT.gmailLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest-600 font-medium hover:underline"
                >
                  {CONTACT.email}
                </a>
                .
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-forest-900 mb-2">Contact</h2>
              <p>
                For privacy questions, email{' '}
                <a
                  href={CONTACT.gmailLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest-600 font-medium hover:underline"
                >
                  {CONTACT.email}
                </a>{' '}
                or call{' '}
                <a href={`tel:${CONTACT.phoneTel}`} className="text-forest-600 font-medium hover:underline">
                  {CONTACT.phoneDisplay}
                </a>
                .
              </p>
            </section>
          </div>

          <Link
            to="/"
            className="inline-block mt-8 text-forest-600 font-semibold hover:text-forest-700"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
