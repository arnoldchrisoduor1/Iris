import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getDetectionHistory, clearHistory } from '../services/storage';

const HistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  
  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getDetectionHistory();
      // Remove the filter to keep all items, even those without predictions
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );
  
  const confirmClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all detection history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistory();
              setHistory([]);
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear history');
            }
          }
        },
      ]
    );
  };
  
  const renderHistoryItem = ({ item }) => {
    // Safe access to prediction data with fallbacks
    const predictionClass = item.prediction?.class || 'Unknown';
    const confidence = item.prediction?.confidence 
      ? (item.prediction.confidence * 100).toFixed(1) 
      : '0';
    
    // Handle cases where imageUri might be missing
    const imageSource = item.imageUri 
      ? { uri: item.imageUri }
      : require('../assets/placeholder-image.png'); // Add a placeholder image

    return (
      <View className="flex-row p-4 border-b border-gray-200">
        <Image 
          source={imageSource}
          className="w-20 h-20 rounded-md mr-3"
        />
        <View className="flex-1 justify-center">
          <Text className="text-lg font-medium capitalize">{predictionClass}</Text>
          <Text className="text-gray-500 text-sm">
            {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown date'}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-700">Confidence: </Text>
            <Text className="font-medium">{confidence}%</Text>
          </View>
          {/* Show status for failed detections */}
          {!item.prediction && (
            <Text className="text-red-500 text-xs mt-1">Detection failed</Text>
          )}
        </View>
      </View>
    );
  };
  
  const renderEmptyList = () => {
    return (
      <View className="flex-1 justify-center items-center py-10">
        <Text className="text-gray-500 text-lg mb-4">No detection history</Text>
        <TouchableOpacity 
          className="bg-primary rounded-lg py-3 px-6"
          onPress={() => navigation.navigate('Camera')}
        >
          <Text className="text-white font-medium">Start Detecting</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-800">History</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={confirmClearHistory}>
              <Text className="text-red-500">Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* History List */}
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyList}
        onRefresh={loadHistory}
        refreshing={isLoading}
      />
    </View>
  );
};

export default HistoryScreen;