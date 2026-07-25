import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Camera, Lock, Eye, EyeOff, LogOut, FileDown, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { analysisAPI, userAPI } from '../services/api';
import AnimatedButton from '../components/AnimatedButton';
import PlantImagePicker from '../components/PlantImagePicker';
import AnalysisErrorAlert from '../components/AnalysisErrorAlert';

export default function Account() {
  const { user, updateProfile, logout, addAnalysis, changePassword } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password' | 'analyses' | 'analyze'

  // Upload & analyze (4th tab)
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisErrorCode, setAnalysisErrorCode] = useState('');

  // Change password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwErrors, setPwErrors] = useState({});
  const [pwSuccess, setPwSuccess] = useState(false);

  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    
    // Load analyses from backend
    const loadAnalyses = async () => {
      try {
        const response = await userAPI.getAnalyses();
        setAnalyses(response.analyses || []);
      } catch (error) {
        console.error('Failed to load analyses:', error);
        setAnalyses([]);
      }
    };
    
    loadAnalyses();
  }, [user, navigate]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await updateProfile({ profileImage: reader.result });
      } catch (error) {
        console.error('Failed to update profile:', error);
        alert('Failed to update profile picture. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const err = {};
    if (!currentPassword) err.current = 'Current password is required';
    if (!newPassword) err.new = 'New password is required';
    else if (newPassword.length < 6) err.new = 'At least 6 characters';
    if (newPassword !== confirmPassword) err.confirm = 'Passwords do not match';
    setPwErrors(err);
    if (Object.keys(err).length > 0) return;

    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (error) {
      setPwErrors({ current: error.message || 'Failed to change password. Please try again.' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const clearUploadPreview = useCallback(() => {
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    setUploadPreview(null);
    setUploadFile(null);
  }, [uploadPreview]);

  const handleUploadSelect = useCallback(
    (selectedFile, previewUrl) => {
      if (uploadPreview) URL.revokeObjectURL(uploadPreview);
      setUploadFile(selectedFile);
      setUploadPreview(previewUrl);
      setAnalysisError('');
      setAnalysisErrorCode('');
    },
    [uploadPreview]
  );

  const handleAnalyzeInAccount = async () => {
    if (!uploadFile) return;
    setAnalyzing(true);
    setAnalyzeProgress(0);
    setAnalysisError('');
    setAnalysisErrorCode('');
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalyzeProgress((p) => {
        if (p >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return p + 4;
      });
    }, 120);
    
    try {
      // Upload image
      const uploadResponse = await analysisAPI.uploadImage(uploadFile);
      
      if (!uploadResponse || !uploadResponse.filepath) {
        throw new Error('Image upload failed. Please try again.');
      }
      
      // Analyze image
      const analyzeResponse = await analysisAPI.analyzeImage({
        imagePath: uploadResponse.filepath,
      });
      
      if (!analyzeResponse || !analyzeResponse.result) {
        throw new Error('Analysis failed. Please try again.');
      }
      
      clearInterval(progressInterval);
      setAnalyzeProgress(100);
      
      const result = {
        ...analyzeResponse.result,
        imagePreview: uploadPreview,
      };
      
      // Refresh user data (analysis is saved by backend)
      try {
        await addAnalysis(analyzeResponse.result);
      } catch (err) {
        console.warn('Failed to refresh user data:', err);
      }
      
      setTimeout(() => navigate('/result', { state: { result } }), 400);
    } catch (error) {
      clearInterval(progressInterval);
      setAnalyzing(false);
      setAnalyzeProgress(0);
      setAnalysisError(
        error.message ||
          'Analysis failed. Please upload a clear photo of a mango, pumpkin, or sugarcane leaf.'
      );
      setAnalysisErrorCode(error.code || '');
    }
  };

  /** Download past analyses as PDF (direct download) */
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('PlantGuard – Past Disease Analyses', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Analyses: ${analyses.length}`, 14, 36);
    
    if (analyses.length === 0) {
      doc.setFontSize(12);
      doc.text('No analyses yet.', 14, 50);
    } else {
      let y = 48;
      analyses.forEach((a, i) => {
        // Check if we need a new page
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        
        // Analysis number and title
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Analysis #${i + 1}`, 14, y);
        y += 7;
        
        // Disease name and confidence
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`Disease: ${a.diseaseName}`, 14, y);
        y += 6;
        doc.setFont(undefined, 'normal');
        doc.text(`Confidence: ${a.confidence}%`, 14, y);
        y += 6;
        
        // Date and time
        doc.setFontSize(10);
        const analysisDate = new Date(a.date);
        doc.text(`Date: ${analysisDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, y);
        y += 5;
        doc.text(`Time: ${analysisDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`, 14, y);
        y += 6;
        
        // Description
        if (a.description) {
          doc.setFont(undefined, 'bold');
          doc.setFontSize(10);
          doc.text('Description:', 14, y);
          y += 5;
          doc.setFont(undefined, 'normal');
          const descLines = doc.splitTextToSize(a.description, 180);
          doc.text(descLines, 14, y);
          y += descLines.length * 5 + 4;
        }
        
        // Care steps
        if (a.careSteps && a.careSteps.length > 0) {
          if (y > 250) { doc.addPage(); y = 20; }
          doc.setFont(undefined, 'bold');
          doc.text('Care Steps:', 14, y);
          y += 5;
          doc.setFont(undefined, 'normal');
          a.careSteps.forEach((step, stepIdx) => {
            if (y > 270) { doc.addPage(); y = 20; }
            const stepLines = doc.splitTextToSize(`${stepIdx + 1}. ${step}`, 180);
            doc.text(stepLines, 14, y);
            y += stepLines.length * 5 + 2;
          });
          y += 2;
        }
        
        // Recommendations
        if (a.recommendations) {
          const rec = a.recommendations;
          if (y > 250) { doc.addPage(); y = 20; }
          doc.setFont(undefined, 'bold');
          doc.text('Recommendations:', 14, y);
          y += 5;
          doc.setFont(undefined, 'normal');
          
          if (rec.watering) {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFont(undefined, 'bold');
            doc.text('Watering:', 14, y);
            y += 5;
            doc.setFont(undefined, 'normal');
            const waterLines = doc.splitTextToSize(rec.watering, 180);
            doc.text(waterLines, 14, y);
            y += waterLines.length * 5 + 3;
          }
          
          if (rec.sunlight) {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFont(undefined, 'bold');
            doc.text('Sunlight:', 14, y);
            y += 5;
            doc.setFont(undefined, 'normal');
            const sunLines = doc.splitTextToSize(rec.sunlight, 180);
            doc.text(sunLines, 14, y);
            y += sunLines.length * 5 + 3;
          }
          
          if (rec.fertilizer) {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFont(undefined, 'bold');
            doc.text('Fertilizer:', 14, y);
            y += 5;
            doc.setFont(undefined, 'normal');
            const fertLines = doc.splitTextToSize(rec.fertilizer, 180);
            doc.text(fertLines, 14, y);
            y += fertLines.length * 5 + 3;
          }
          
          if (rec.treatment) {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFont(undefined, 'bold');
            doc.text('Treatment:', 14, y);
            y += 5;
            doc.setFont(undefined, 'normal');
            const treatLines = doc.splitTextToSize(rec.treatment, 180);
            doc.text(treatLines, 14, y);
            y += treatLines.length * 5 + 3;
          }
        }
        
        // Separator line between analyses
        if (i < analyses.length - 1) {
          y += 3;
          doc.setDrawColor(200, 200, 200);
          doc.line(14, y, 196, y);
          y += 5;
        }
      });
    }
    doc.save(`plantguard-analyses-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (!user) return null;

  const tabs = [
    { id: 'profile', label: 'Account Details' },
    { id: 'password', label: 'Change Password' },
    { id: 'analyze', label: 'Analyze Plant' },
    { id: 'analyses', label: 'Past Analyses' },
  ];

  return (
    <div className="page-shell page-bg-light">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-card overflow-hidden !p-0"
        >
          {/* Tabs */}
          <div className="grid grid-cols-2 sm:flex sm:overflow-x-auto border-b border-forest-100">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`sm:flex-shrink-0 px-3 sm:px-4 py-3 sm:py-4 font-semibold text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? 'text-forest-700 border-b-2 border-forest-600 bg-forest-50/50'
                    : 'text-gray-500 hover:text-forest-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Profile picture */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-forest-100 border-4 border-white shadow-lg">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-forest-400">
                          <User className="w-16 h-16" />
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 rounded-full bg-forest-600 text-white cursor-pointer shadow-lg hover:bg-forest-700 transition-colors">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500 mb-1">Profile photo</p>
                    <label className="text-forest-600 font-semibold cursor-pointer hover:underline">
                      Change photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Account details only */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-forest-50 border border-forest-100">
                    <User className="w-5 h-5 text-forest-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Full name</p>
                      <p className="font-semibold text-gray-900">{user.name || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-forest-50 border border-forest-100">
                    <Mail className="w-5 h-5 text-forest-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="font-semibold text-gray-900">{user.email || '—'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'password' && (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleChangePassword}
                className="space-y-5"
              >
                {pwSuccess && (
                  <p className="p-3 rounded-xl bg-forest-100 text-forest-700 font-medium text-center">
                    Password updated successfully.
                  </p>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className={`w-full h-12 pl-12 pr-12 rounded-xl border-2 bg-gray-50/50 focus:bg-white outline-none transition-all ${
                        pwErrors.current ? 'border-red-400' : 'border-gray-200 focus:border-forest-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 min-w-10 min-h-10 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-inset"
                      aria-label={showCurrent ? 'Hide password' : 'Show password'}
                    >
                      {showCurrent ? <EyeOff className="w-5 h-5 shrink-0" /> : <Eye className="w-5 h-5 shrink-0" />}
                    </button>
                  </div>
                  {pwErrors.current && <p className="mt-1 text-sm text-red-500">{pwErrors.current}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className={`w-full h-12 pl-12 pr-12 rounded-xl border-2 bg-gray-50/50 focus:bg-white outline-none transition-all ${
                        pwErrors.new ? 'border-red-400' : 'border-gray-200 focus:border-forest-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 min-w-10 min-h-10 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-inset"
                      aria-label={showNew ? 'Hide password' : 'Show password'}
                    >
                      {showNew ? <EyeOff className="w-5 h-5 shrink-0" /> : <Eye className="w-5 h-5 shrink-0" />}
                    </button>
                  </div>
                  {pwErrors.new && <p className="mt-1 text-sm text-red-500">{pwErrors.new}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm new password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className={`w-full h-12 pl-12 pr-12 rounded-xl border-2 bg-gray-50/50 focus:bg-white outline-none transition-all ${
                        pwErrors.confirm ? 'border-red-400' : 'border-gray-200 focus:border-forest-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 min-w-10 min-h-10 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-inset"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5 shrink-0" /> : <Eye className="w-5 h-5 shrink-0" />}
                    </button>
                  </div>
                  {pwErrors.confirm && <p className="mt-1 text-sm text-red-500">{pwErrors.confirm}</p>}
                </div>
                <AnimatedButton type="submit" variant="primary" fullWidth>
                  Update password
                </AnimatedButton>
              </motion.form>
            )}

            {activeTab === 'analyze' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <p className="text-gray-600 text-sm">
                  Upload from your device or capture a live photo with your camera. Use a clear close-up of a leaf only.
                </p>
                {analysisError && (
                  <AnalysisErrorAlert
                    message={analysisError}
                    code={analysisErrorCode}
                    onDismiss={() => {
                      setAnalysisError('');
                      setAnalysisErrorCode('');
                    }}
                  />
                )}
                <AnimatePresence mode="wait">
                  {!analyzing ? (
                    <motion.div
                      key="upload-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <PlantImagePicker
                        file={uploadFile}
                        preview={uploadPreview}
                        onSelect={handleUploadSelect}
                        onClear={clearUploadPreview}
                      />
                      <AnimatedButton
                        variant="primary"
                        fullWidth
                        onClick={handleAnalyzeInAccount}
                        disabled={!uploadFile}
                        className={!uploadFile ? 'opacity-60 cursor-not-allowed' : ''}
                      >
                        Analyze disease
                      </AnimatedButton>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="analyzing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-6 text-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="inline-flex p-3 rounded-full bg-forest-100 text-forest-600 mb-4"
                      >
                        <Loader2 className="w-10 h-10" />
                      </motion.div>
                      <p className="font-semibold text-forest-900 mb-2">Analyzing...</p>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-forest-600 to-earth-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${analyzeProgress}%` }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">{analyzeProgress}%</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'analyses' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <p className="text-gray-600 text-sm">
                  All plant disease analyses you have run appear here. Download as PDF with one click.
                </p>

                <motion.button
                  type="button"
                  onClick={downloadPDF}
                  disabled={analyses.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-forest-600 text-white font-semibold hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: analyses.length ? 1.02 : 1 }}
                  whileTap={{ scale: analyses.length ? 0.98 : 1 }}
                >
                  <FileDown className="w-5 h-5" />
                  Download PDF
                </motion.button>

                {/* List of past analyses */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-forest-900">History</h3>
                  {analyses.length === 0 ? (
                    <p className="p-6 rounded-2xl bg-forest-50 border border-forest-100 text-gray-500 text-center">
                      No analyses yet. Upload a plant image from the Upload page to get started.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {analyses.map((a) => (
                        <motion.li
                          key={a.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-2xl bg-forest-50 border border-forest-100"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-forest-900">{a.diseaseName}</span>
                            <span className="text-sm text-forest-600">{a.confidence}%</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(a.date).toLocaleString()}
                          </p>
                          {a.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{a.description}</p>
                          )}
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            )}

            {/* Logout */}
            <div className="mt-10 pt-8 border-t border-forest-100">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Log out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
