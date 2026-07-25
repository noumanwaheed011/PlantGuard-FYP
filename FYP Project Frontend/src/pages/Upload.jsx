import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analysisAPI } from '../services/api';
import AnimatedButton from '../components/AnimatedButton';
import PlantImagePicker from '../components/PlantImagePicker';
import AnalysisErrorAlert from '../components/AnalysisErrorAlert';

export default function Upload() {
  const navigate = useNavigate();
  const { addAnalysis } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisErrorCode, setAnalysisErrorCode] = useState('');

  const clearPreview = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
  }, [preview]);

  const handleImageSelect = useCallback(
    (selectedFile, previewUrl) => {
      if (preview) URL.revokeObjectURL(preview);
      setFile(selectedFile);
      setPreview(previewUrl);
      setAnalysisError('');
      setAnalysisErrorCode('');
    },
    [preview]
  );

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setProgress(0);
    setAnalysisError('');
    setAnalysisErrorCode('');

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return p + 4;
      });
    }, 120);

    try {
      const uploadResponse = await analysisAPI.uploadImage(file);

      if (!uploadResponse || !uploadResponse.filepath) {
        throw new Error('Image upload failed. Please try again.');
      }

      const analyzeResponse = await analysisAPI.analyzeImage({
        imagePath: uploadResponse.filepath,
      });

      if (!analyzeResponse || !analyzeResponse.result) {
        throw new Error('Analysis failed. Please try again.');
      }

      clearInterval(progressInterval);
      setProgress(100);

      const result = {
        ...analyzeResponse.result,
        imagePreview: preview,
      };

      try {
        await addAnalysis(analyzeResponse.result);
      } catch (err) {
        console.warn('Failed to refresh user data:', err);
      }

      setTimeout(() => navigate('/result', { state: { result } }), 400);
    } catch (error) {
      clearInterval(progressInterval);
      setAnalyzing(false);
      setProgress(0);
      setAnalysisError(
        error.message ||
          'Analysis failed. Please upload a clear photo of a mango, pumpkin, or sugarcane leaf.'
      );
      setAnalysisErrorCode(error.code || '');
    }
  };

  return (
    <div className="page-shell-centered page-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="page-card">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-forest-900 mb-1">Upload Plant Image</h1>
          <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8">
            Upload a clear close-up of a mango, pumpkin, or sugarcane leaf only.
            Photos of people, objects, or other plants will be rejected.
          </p>

          {analysisError && (
            <div className="mb-6">
              <AnalysisErrorAlert
                message={analysisError}
                code={analysisErrorCode}
                onDismiss={() => {
                  setAnalysisError('');
                  setAnalysisErrorCode('');
                }}
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            {!analyzing ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <PlantImagePicker
                  file={file}
                  preview={preview}
                  onSelect={handleImageSelect}
                  onClear={clearPreview}
                />

                <AnimatedButton
                  variant="primary"
                  fullWidth
                  onClick={handleAnalyze}
                  disabled={!file}
                  className={!file ? 'opacity-60 cursor-not-allowed' : ''}
                >
                  <ImageIcon className="w-5 h-5" />
                  Analyze Disease
                </AnimatedButton>
              </motion.div>
            ) : (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="inline-flex p-4 rounded-full bg-forest-100 text-forest-600 mb-6"
                >
                  <Loader2 className="w-12 h-12" />
                </motion.div>
                <h2 className="text-xl font-bold text-forest-900 mb-2">Analyzing image...</h2>
                <p className="text-gray-500 text-sm mb-6">AI is detecting potential diseases</p>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-forest-600 to-earth-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{progress}%</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
