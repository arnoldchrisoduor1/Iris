import * as FileSystem from 'expo-file-system';

// Replace with your actual Flask server URL
const API_URL = 'http://192.168.1.100:5000';

export const recognizeImage = async (imageUri) => {
  try {
    // Prepare form data for image upload
    const formData = new FormData();
    
    // Get file name from URI
    const uriParts = imageUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    // Add the image to form data
    formData.append('image', {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg', // Adjust as needed based on your image format
    });
    
    // Send the request to Flask backend
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error recognizing image:', error);
    throw error;
  }
};

// For local testing without a backend server
export const mockRecognizeImage = async (imageUri) => {
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock classification data
  return {
    success: true,
    prediction: {
      class: ['apple', 'banana', 'orange'][Math.floor(Math.random() * 3)],
      confidence: (Math.random() * 0.5 + 0.5).toFixed(4),
      processingTime: (Math.random() * 0.8 + 0.2).toFixed(2)
    }
  };
};