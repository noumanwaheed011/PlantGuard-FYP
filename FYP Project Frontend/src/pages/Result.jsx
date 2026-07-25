import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { CheckCircle2, Leaf, ArrowRight, Droplets, Sun, FlaskConical, Heart, FileDown, Star, Send, ArrowLeft } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';
import { useAuth } from '../context/AuthContext';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { submitFeedback, getMyFeedback } = useAuth();
  const result = location.state?.result;

  const [feedbackSent, setFeedbackSent] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [checkingFeedback, setCheckingFeedback] = useState(true);

  // Redirect to upload if no result data (should not happen)
  useEffect(() => {
    if (!result) {
      console.warn('No result data found, redirecting to upload');
      navigate('/upload', { replace: true });
    }
  }, [result, navigate]);

  useEffect(() => {
    if (!result?.id) {
      setCheckingFeedback(false);
      return;
    }

    let cancelled = false;

    const loadExistingFeedback = async () => {
      try {
        const mine = await getMyFeedback();
        const existing = mine.find((item) => item.analysisId === result.id);
        if (!cancelled && existing) {
          setFeedbackSent(true);
        }
      } catch (error) {
        console.error('Failed to check existing feedback:', error);
      } finally {
        if (!cancelled) {
          setCheckingFeedback(false);
        }
      }
    };

    loadExistingFeedback();

    return () => {
      cancelled = true;
    };
  }, [result?.id, getMyFeedback]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forest-50">
        <div className="w-10 h-10 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { diseaseName, confidence, description, careSteps, recommendations, imagePreview } = result;
  const rec = recommendations || {};

  const saveFeedback = async () => {
    const selectedRating = rating || hoverRating;
    if (!selectedRating) {
      setFeedbackError('Please select a rating before submitting.');
      return;
    }

    setSubmitting(true);
    setFeedbackError('');

    try {
      await submitFeedback({
        analysisId: result.id,
        diseaseName,
        rating: selectedRating,
        comment: comment.trim(),
      });
      setFeedbackSent(true);
      setRating(0);
      setHoverRating(0);
      setComment('');
    } catch (error) {
      setFeedbackError(error.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadReportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('PlantGuard – Analysis Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30);
    let y = 38;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text(`${diseaseName} (${confidence}% confidence)`, 14, y);
    y += 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text('Description', 14, y);
    y += 6;
    doc.setFontSize(10);
    const descLines = doc.splitTextToSize(description || '', 180);
    doc.text(descLines, 14, y);
    y += descLines.length * 5 + 8;
    if (Object.keys(rec).length > 0) {
      doc.setFont(undefined, 'bold');
      doc.text('Recommendations', 14, y);
      y += 6;
      doc.setFont(undefined, 'normal');
      ['watering', 'sunlight', 'fertilizer', 'treatment'].forEach((key) => {
        if (rec[key]) {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.setFont(undefined, 'bold');
          doc.text(key.charAt(0).toUpperCase() + key.slice(1) + ':', 14, y);
          y += 5;
          doc.setFont(undefined, 'normal');
          const lines = doc.splitTextToSize(rec[key], 180);
          doc.text(lines, 14, y);
          y += lines.length * 5 + 4;
        }
      });
      y += 4;
    }
    doc.setFont(undefined, 'bold');
    doc.text('Care steps', 14, y);
    y += 6;
    doc.setFont(undefined, 'normal');
    (careSteps || []).forEach((step) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const lines = doc.splitTextToSize(step, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 3;
    });
    doc.save(`plantguard-report-${diseaseName.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
  };

  return (
    <div className="page-shell page-bg">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="page-card overflow-hidden !p-0"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-forest-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-flex p-3 rounded-2xl bg-forest-100 text-forest-600 mb-6"
            >
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-forest-900 mb-2">Analysis Complete</h1>
            <p className="text-gray-500">Here are your analysis results and care recommendations.</p>
          </div>

          {/* Image preview if available */}
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-6 sm:p-8 border-b border-forest-100"
            >
              <img
                src={imagePreview}
                alt="Analyzed plant"
                className="w-full max-h-64 object-cover rounded-2xl"
              />
            </motion.div>
          )}

          {/* Disease name & confidence */}
          <div className="p-4 sm:p-6 lg:p-8 lg:p-10 space-y-5 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4"
            >
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-forest-100 text-forest-800 font-semibold text-sm sm:text-base">
                <Leaf className="w-5 h-5 shrink-0" />
                {diseaseName}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-forest-600">{confidence}% confidence</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-forest-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h2 className="text-lg font-semibold text-forest-900 mb-3">Suggested care steps</h2>
              <ul className="space-y-2">
                {(careSteps || []).map((step, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex gap-3 text-gray-600"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-forest-100 text-forest-700 text-sm font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {step}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* FR-06: Recommendations (watering, sunlight, fertilizer, treatment) */}
            {(rec.watering || rec.sunlight || rec.fertilizer || rec.treatment) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="rounded-2xl bg-forest-50 border border-forest-100 p-6 space-y-4"
              >
                <h2 className="text-lg font-semibold text-forest-900 mb-3">Care recommendations</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {rec.watering && (
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 p-2 rounded-xl bg-forest-100 text-forest-600">
                        <Droplets className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-forest-800 mb-1">Watering</h3>
                        <p className="text-sm text-gray-600">{rec.watering}</p>
                      </div>
                    </div>
                  )}
                  {rec.sunlight && (
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 p-2 rounded-xl bg-forest-100 text-forest-600">
                        <Sun className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-forest-800 mb-1">Sunlight</h3>
                        <p className="text-sm text-gray-600">{rec.sunlight}</p>
                      </div>
                    </div>
                  )}
                  {rec.fertilizer && (
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 p-2 rounded-xl bg-forest-100 text-forest-600">
                        <FlaskConical className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-forest-800 mb-1">Fertilizer</h3>
                        <p className="text-sm text-gray-600">{rec.fertilizer}</p>
                      </div>
                    </div>
                  )}
                  {rec.treatment && (
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 p-2 rounded-xl bg-forest-100 text-forest-600">
                        <Heart className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-forest-800 mb-1">Treatment</h3>
                        <p className="text-sm text-gray-600">{rec.treatment}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* FR-07: Download report PDF */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                type="button"
                onClick={downloadReportPDF}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-forest-700 bg-forest-100 hover:bg-forest-200 transition-colors"
              >
                <FileDown className="w-5 h-5" />
                Download report (PDF)
              </button>
            </motion.div>

            {/* FR-08: Feedback (accuracy & usability) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="pt-4 border-t border-forest-100"
            >
              <h2 className="text-lg font-semibold text-forest-900 mb-2">Feedback</h2>
              <p className="text-sm text-gray-500 mb-3">Rate accuracy and usability of this result.</p>
              {checkingFeedback ? (
                <p className="text-sm text-gray-500">Checking feedback status...</p>
              ) : feedbackSent ? (
                <p className="text-forest-600 font-medium">Thank you for your feedback!</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        disabled={submitting}
                        className={`p-1 focus:outline-none disabled:opacity-50 ${
                          (hoverRating || rating) >= star ? 'text-amber-400' : 'text-gray-300'
                        }`}
                      >
                        <Star
                          className="w-8 h-8"
                          fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'}
                          stroke="currentColor"
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Optional comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={submitting}
                    className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:ring-2 focus:ring-forest-500 focus:border-forest-500 text-gray-700 disabled:opacity-50"
                    rows={2}
                  />
                  {feedbackError && (
                    <p className="text-sm text-red-600">{feedbackError}</p>
                  )}
                  <button
                    type="button"
                    onClick={saveFeedback}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-forest-600 hover:bg-forest-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Sending...' : 'Send feedback'}
                  </button>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="pt-4 sm:pt-6 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
            >
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors w-full sm:w-auto"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Account
              </button>
              <Link to="/upload" className="w-full sm:w-auto">
                <AnimatedButton variant="primary" fullWidth className="sm:w-auto">
                  Analyze another image
                  <ArrowRight className="w-5 h-5" />
                </AnimatedButton>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
