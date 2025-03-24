import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDetectionHistory } from '../services/storage';

const HomeScreen = () => {
  const [recentDetections, setRecentDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  
  useEffect(() => {
    loadRecentDetections();
    
    // Refresh when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadRecentDetections();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  const loadRecentDetections = async () => {
    setIsLoading(true);
    try {
      const history = await getDetectionHistory();
      setRecentDetections(history.slice(0, 5)); // Just the 5 most recent
    } catch (error) {
      console.error('Error loading recent detections:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-800">Iris AI</Text>
        <Text className="text-gray-500">Identify objects with AI</Text>
      </View>
      
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Quick Start */}
        <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <View className="bg-primary px-4 py-3">
            <Text className="text-white text-lg font-bold">Quick Start</Text>
          </View>
          <View className="p-4">
            <Text className="text-gray-600 mb-4">
              Ready to identify objects? Open the camera and point it at any object to get started.
            </Text>
            <TouchableOpacity 
              className="bg-primary rounded-lg py-3 px-4 items-center"
              onPress={() => navigation.navigate('Camera')}
            >
              <Text className="text-white font-medium">Open Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Recent Detections */}
        <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <View className="bg-gray-800 px-4 py-3 flex-row justify-between items-center">
            <Text className="text-white text-lg font-bold">Recent Detections</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text className="text-white text-sm">View All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="p-4">
            {isLoading ? (
              <Text className="text-gray-500 text-center py-4">Loading...</Text>
            ) : recentDetections.length > 0 ? (
              recentDetections.map((item) => (
                <View key={item.id} className="flex-row items-center py-2 border-b border-gray-100">
                  <Image 
                    source={{ uri: item.imageUri }} 
                    className="w-16 h-16 rounded-md mr-3"
                  />
                  <View className="flex-1">
                    <Text className="text-lg font-medium capitalize">{item.prediction.class}</Text>
                    <Text className="text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <Text className="text-gray-700 font-medium">
                    {(item.prediction.confidence * 100).toFixed(0)}%
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 text-center py-4">No recent detections</Text>
            )}
            
            {recentDetections.length > 0 && (
              <TouchableOpacity 
                className="mt-3 py-2"
                onPress={() => navigation.navigate('History')}
              >
                <Text className="text-primary text-center">View All History</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Tips */}
        <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <View className="bg-secondary px-4 py-3">
            <Text className="text-white text-lg font-bold">Tips</Text>
          </View>
          <View className="p-4">
            <View className="mb-2">
              <Text className="font-medium mb-1">Better Results</Text>
              <Text className="text-gray-600">
                Center the object in the frame and ensure good lighting for more accurate recognition.
              </Text>
            </View>
            <View>
              <Text className="font-medium mb-1">Multiple Objects</Text>
              <Text className="text-gray-600">
                For best results, focus on one object at a time.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;