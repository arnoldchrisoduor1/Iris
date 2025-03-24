import * as Camera from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export const requestCameraPermissions = async () => {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting camera permissions:', error);
    return false;
  }
};

export const requestMediaLibraryPermissions = async () => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting media library permissions:', error);
    return false;
  }
};

export const checkPermissions = async () => {
  const cameraPermission = await requestCameraPermissions();
  const mediaPermission = await requestMediaLibraryPermissions();
  
  return {
    camera: cameraPermission,
    mediaLibrary: mediaPermission,
    allGranted: cameraPermission && mediaPermission
  };
};