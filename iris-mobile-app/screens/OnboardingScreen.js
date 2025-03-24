import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Dimensions, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to Object Detector',
    description: 'Identify objects around you with just your camera',
    image: require('../assets/onboarding/screen1.png'), // You'll need to add these images
  },
  {
    id: '2',
    title: 'Point & Recognize',
    description: 'Point your camera at any object and our AI will identify it',
    image: require('../assets/onboarding/screen2.png'),
  },
  {
    id: '3',
    title: 'View History',
    description: 'Keep track of all the objects you\'ve identified',
    image: require('../assets/onboarding/screen3.png'),
  },
];

const OnboardingScreen = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = (index) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index });
    }
  };

  const OnboardingItem = ({ item }) => {
    return (
      <View className="w-full h-full items-center justify-center px-4" style={{ width }}>
        <View className="flex-1 justify-center items-center">
          <Image 
            source={item.image} 
            className="w-64 h-64 mb-8"
            resizeMode="contain"
          />
        </View>
        <View className="mb-12">
          <Text className="text-center text-2xl font-bold text-dark mb-2">{item.title}</Text>
          <Text className="text-center text-base text-gray-600">{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-1 justify-center items-center">
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={({ item }) => <OnboardingItem item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          scrollEventThrottle={32}
        />
      </View>

      {/* Pagination */}
      <View className="flex-row justify-center mb-4">
        {slides.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={index}
              className="h-2 rounded-full mx-1 bg-primary"
              style={{ width: dotWidth, opacity }}
            />
          );
        })}
      </View>
      
      {/* Navigation buttons */}
      <View className="flex-row justify-between items-center px-4 mb-8">
        {currentIndex > 0 ? (
          <TouchableOpacity 
            className="py-3 px-6" 
            onPress={() => scrollTo(currentIndex - 1)}
          >
            <Text className="text-gray-600 text-base">Back</Text>
          </TouchableOpacity>
        ) : (
          <View className="py-3 px-6" />
        )}
        
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity 
            className="py-3 px-6 bg-primary rounded-full" 
            onPress={() => scrollTo(currentIndex + 1)}
          >
            <Text className="text-white text-base font-medium">Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            className="py-3 px-6 bg-primary rounded-full" 
            onPress={onComplete}
          >
            <Text className="text-white text-base font-medium">Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default OnboardingScreen;