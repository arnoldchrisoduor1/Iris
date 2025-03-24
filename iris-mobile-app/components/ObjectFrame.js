import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';

const ObjectFrame = () => {
  // Animation for pulsing effect
  const opacity = useSharedValue(0.6);
  
  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.9, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1, // Infinite repeat
      true // Reverse
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });
  
  return (
    <View className="flex-1 justify-center items-center">
      <Animated.View 
        className="w-64 h-64 border-2 border-white rounded-lg border-dashed"
        style={animatedStyle}
      />
      <Text className="text-white text-center mt-2 font-light">Center object in frame</Text>
    </View>
  );
};

export default ObjectFrame;