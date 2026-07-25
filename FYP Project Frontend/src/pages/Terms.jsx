import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { CONTACT } from '../constants/contact';

export default function Terms() {
  return (
    <div className="page-shell page-bg-light">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-card"
        >
          <div className="inline-flex p-3 rounded-2xl bg-forest-100 text-forest-600 mb-6">
            <FileText className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-forest-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-forest-900 mb-2">Acceptance of terms</h2>
              <p>
                By accessing or using PlantGuard AI, you agree to these Terms of Service and our{' '}
                <Link to="/privacy" className="text-forest-600 font-medium hover:underline">
                  Privacy Policy
                </Link>
                . If you do not agree, please do not use the application.
              </p>
              <p className="mt-3">
                When you create an account, check the agreement box on the sign-up page, and complete
                registration, you confirm that you have read, understood, and accept these terms.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-forest-900 mb-2">Creating an account</h2>
              <p className="mb-3">
                To use features such as leaf analysis, saved results, and account settings, you must
                create a free PlantGuard AI account. By registering, you agree to the following:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  You must provide accurate information, including your full name and a valid email
                  address that you can access.
                </li>
                <li>
                  Your password must be at least 8 characters and include at least one letter and one
                  number. You are responsible for keeping your login details confidential.
                </li>
                <li>
                  After sign-up, you must verify your email using the one-time code (OTP) sent to your
                  registered address before your account becomes fully active.
                </li>
                <li>
                  Each email address may be used for one account only. You may not create accounts for
                  others without permission or use false identity information.
                </li>
                <li>
                  You are responsible for all activity that occurs under your account, including image
                  uploads, analyses, and feedback submitted through the platform.
                </li>
                <li>
                  Your analysis history, profile details, and related data will be stored and linked to
                  your account so you can view past results and manage your profile.
                </li>
                <li>
                  We may suspend or restrict accounts that violate these terms, misuse the service, or
                  attempt unauthorized access to the system.
                </li>
              </ul>
              <p className="mt-3">
                You may update your profile or change your password at any time from your account settings.
                For password recovery, use the forgot-password option on the login page.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-forest-900 mb-2">Use of the service</h2>
              <p>
                PlantGuard AI provides AI-assisted plant disease detection for informational and educational
                purposes. Results should not replace professional agricultural advice. You must provide accurate
                registration information and keep your account credentials secure.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-forest-900 mb-2">User content</h2>
              <p>
                You retain ownership of images you upload. By uploading content, you grant us permission to
                process those images for analysis and to store results associated with your account.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-forest-900 mb-2">Limitation of liability</h2>
              <p>
                PlantGuard AI is provided &quot;as is.&quot; We are not liable for crop loss, incorrect diagnoses,
                or decisions made based on AI output. Always consult qualified experts for critical agricultural
                decisions.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-forest-900 mb-2">Contact</h2>
              <p>
                Questions about these terms? Contact us at{' '}
                <a
                  href={CONTACT.gmailLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest-600 font-medium hover:underline"
                >
                  {CONTACT.email}
                </a>{' '}
                or{' '}
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
