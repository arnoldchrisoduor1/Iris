import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for storing detection history
const HISTORY_KEY = 'detection_history';

export const saveDetection = async (detection) => {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    const history = historyJson ? JSON.parse(historyJson) : [];
    
    // Ensure prediction has proper structure
    const safePrediction = detection.prediction ? {
      class: detection.prediction.class || 'unknown',
      confidence: detection.prediction.confidence || 0,
      // add other prediction fields you expect
    } : null;
    
    const newDetection = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      imageUri: detection.imageUri,
      prediction: safePrediction,  // Use the safe version
      success: detection.success !== undefined ? detection.success : false,
      error: detection.error || null,
    };
    
    const updatedHistory = [newDetection, ...history];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    
    return newDetection;
  } catch (error) {
    console.error('Error saving detection:', error);
    throw error;
  }
};

export const getDetectionHistory = async () => {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error getting detection history:', error);
    return [];
  }
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
};

export default {
  saveDetection,
  getDetectionHistory,
  clearHistory
};