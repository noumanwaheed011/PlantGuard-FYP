/** Shared mock analysis result (FR-05, FR-06). Replace with API later. */
export const MOCK_ANALYSIS_RESULT = {
  diseaseName: 'Tomato Early Blight',
  confidence: 94,
  description:
    'Early blight is a common fungal disease caused by Alternaria solani. It typically appears as dark concentric rings on lower leaves and can spread quickly in warm, humid conditions.',
  careSteps: [
    'Remove and destroy infected leaves to prevent spread.',
    'Apply copper-based fungicide every 7–10 days as directed.',
    'Water at the base of plants; avoid overhead watering.',
    'Improve air circulation and ensure proper spacing.',
    'Rotate crops next season to reduce soil-borne spores.',
  ],
  recommendations: {
    watering: 'Water at the base of the plant in the morning. Avoid overhead watering to reduce leaf wetness. Allow soil to dry slightly between waterings.',
    sunlight: 'Ensure 6–8 hours of direct sunlight. Good air circulation and spacing between plants help reduce humidity and disease spread.',
    fertilizer: 'Use a balanced, low-nitrogen fertilizer. Avoid excess nitrogen which promotes tender growth susceptible to infection.',
    treatment: 'Apply copper-based fungicide or chlorothalonil every 7–10 days. Remove and destroy infected leaves. Rotate crops next season.',
  },
};
