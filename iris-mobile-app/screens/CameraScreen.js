import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Toast from 'react-native-toast-message';
import { mockRecognizeImage } from '../services/api';
import { saveDetection } from '../services/storage';

const CameraScreen = () => {
  const [facing, setFacing] = useState('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [isReady, setIsReady] = useState(false);
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastImage, setLastImage] = useState(null);
  const [lastPrediction, setLastPrediction] = useState(null);
  
  const cameraRef = useRef(null);

  useEffect(() => {
    // Verify permissions when component mounts
    (async () => {
      if (!mediaPermission?.granted) {
        await requestMediaPermission();
      }
    })();
  }, []);

  // Permission handling
  if (!cameraPermission || !mediaPermission) {
    return <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          We need camera permission to use this feature
        </Text>
        <TouchableOpacity 
          onPress={requestCameraPermission} 
          style={styles.permissionButton}
        >
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!mediaPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          We need media library permission to save photos
        </Text>
        <TouchableOpacity 
          onPress={requestMediaPermission} 
          style={styles.permissionButton}
        >
          <Text style={styles.buttonText}>Grant Media Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const captureImage = async () => {
    if (cameraRef.current && !isCapturing && isReady) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setLastImage(photo.uri);
        
        const result = await mockRecognizeImage(photo.uri);
        setLastPrediction(result.prediction);
        
        await saveDetection({
          imageUri: photo.uri,
          prediction: result.prediction,
        });
        
        Toast.show({
          type: 'success',
          text1: 'Object Detected',
          text2: `${result.prediction.class} (${(result.prediction.confidence * 100).toFixed(1)}%)`,
          position: 'top',
          visibilityTime: 3000,
        });
      } catch (error) {
        console.error('Error capturing image:', error);
        Toast.show({
          type: 'error',
          text1: 'Detection Failed',
          text2: 'Could not process the image',
          position: 'top',
        });
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const toggleCameraType = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleCameraReady = () => {
    setIsReady(true);
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        facing={facing}
        style={styles.camera}
        mode="picture"
        onCameraReady={handleCameraReady}
      >
        <View style={styles.overlay}>
          {/* Object frame guide */}
          <View style={styles.frameGuide}>
            <View style={styles.frame} />
            <Text style={styles.frameText}>Center object in frame</Text>
          </View>

          {/* Last prediction display */}
          {lastPrediction && (
            <View style={styles.predictionContainer}>
              <Text style={styles.predictionText}>
                {lastPrediction.class}
              </Text>
              <Text style={styles.predictionText}>
                Confidence: {(lastPrediction.confidence * 100).toFixed(1)}%
              </Text>
            </View>
          )}
          
          {/* Camera controls */}
          <View style={styles.controls}>
            <TouchableOpacity onPress={toggleCameraType} style={styles.controlButton}>
              <Text style={styles.controlIcon}>🔄</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={captureImage}
              disabled={isCapturing || !isReady} 
              style={[
                styles.captureButton,
                (isCapturing || !isReady) && styles.disabledButton
              ]}
            >
              {isCapturing ? (
                <ActivityIndicator size="large" color="#ffffff" />
              ) : (
                <View style={styles.captureInner} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              {lastImage ? (
                <Image 
                  source={{ uri: lastImage }} 
                  style={styles.thumbnail}
                />
              ) : (
                <View style={styles.thumbnailPlaceholder} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  frameGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 256,
    height: 256,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 8,
    borderStyle: 'dashed',
    opacity: 0.7,
  },
  frameText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '200',
  },
  predictionContainer: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
    borderRadius: 8,
  },
  predictionText: {
    color: 'white',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controlButton: {
    padding: 8,
  },
  controlIcon: {
    color: 'white',
    fontSize: 24,
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  captureInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  thumbnailPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: 'gray',
  },
  permissionText: {
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    color: 'white',
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
  },
});

export default CameraScreen;