import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

// Replace with your actual Flask server URL
const API_URL = 'http://env2.eba-6ase3mni.eu-north-1.elasticbeanstalk.com';

const compressImage = async (imageUri) => {
  try {
    // Compress and resize the image
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }], // Resize to max width of 800
      { 
        compress: 0.7, // Reduce quality to 70%
        format: ImageManipulator.SaveFormat.JPEG 
      }
    );
    return manipResult.uri;
  } catch (error) {
    console.error('Image compression error:', error);
    return imageUri; // Fallback to original image if compression fails
  }
};

export const recognizeImage = async (imageUri) => {
  try {
    // Compress the image first
    const compressedImageUri = await compressImage(imageUri);
    
    // Prepare form data for image upload
    const formData = new FormData();
    
    // Get file name from URI
    const uriParts = compressedImageUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    // Add the compressed image to form data
    formData.append('image', {
      uri: compressedImageUri,
      name: fileName,
      type: 'image/jpeg',
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
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
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