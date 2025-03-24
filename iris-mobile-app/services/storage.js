import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for storing detection history
const HISTORY_KEY = 'detection_history';

export const saveDetection = async (detection) => {
  try {
    // Get existing history
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    const history = historyJson ? JSON.parse(historyJson) : [];
    
    // Add new detection with timestamp
    const newDetection = {
      ...detection,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    // Update history (newest first)
    const updatedHistory = [newDetection, ...history];
    
    // Save updated history
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