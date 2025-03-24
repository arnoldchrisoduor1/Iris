import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

// Save an image to the device gallery
export const saveImageToGallery = async (fileUri) => {
  try {
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    return asset;
  } catch (error) {
    console.error('Error saving image to gallery:', error);
    throw error;
  }
};

// Resize an image to reduce file size
export const resizeImage = async (fileUri, width = 600, height = 800, quality = 0.7) => {
  try {
    // This is a simplified version - in a real app you would use a library like 'expo-image-manipulator'
    // For demo purposes we'll just return the original URI
    return fileUri;
  } catch (error) {
    console.error('Error resizing image:', error);
    return fileUri;
  }
};

// Get file info (size, type, etc)
export const getFileInfo = async (fileUri) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    return fileInfo;
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
};

// Generate a unique filename
export const generateUniqueFilename = (extension = 'jpg') => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `image_${timestamp}_${random}.${extension}`;
};