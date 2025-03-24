import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  runOnJS
} from 'react-native-reanimated';

const RecognitionResults = ({ prediction, isVisible, onDismiss }) => {
  const translateY = useSharedValue(isVisible ? 0 : -100);
  
  React.useEffect(() => {
    if (isVisible) {
      translateY.value = withTiming(0, { 
        duration: 300, 
        easing: Easing.out(Easing.back(1.5)) 
      });
    } else {
      translateY.value = withTiming(-100, { 
        duration: 300, 
        easing: Easing.inOut(Easing.ease) 
      });
    }
  }, [isVisible]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });
  
  const getConfidenceColor = (confidence) => {
    const confValue = parseFloat(confidence);
    if (confValue >= 0.9) return 'text-green-500';
    if (confValue >= 0.7) return 'text-blue-500';
    if (confValue >= 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  if (!prediction) return null;
  
  const confidenceColor = getConfidenceColor(prediction.confidence);
  
  return (
    <Animated.View 
      className="absolute top-0 left-0 right-0 bg-black bg-opacity-80 p-4 mx-2 mt-12 rounded-lg"
      style={animatedStyle}
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-white text-xl font-bold capitalize mb-1">
            {prediction.class}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-white">Confidence: </Text>
            <Text className={`font-bold ${confidenceColor}`}>
              {(prediction.confidence * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          className="bg-white bg-opacity-20 rounded-full p-2"
          onPress={onDismiss}
        >
          <Text className="text-white">✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default RecognitionResults;