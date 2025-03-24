import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

const DetectionHistoryItem = ({ item, onPress }) => {
  // Format the date for better readability
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show date and time
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get background color based on confidence
  const getConfidenceColor = (confidence) => {
    const confValue = parseFloat(confidence);
    if (confValue >= 0.9) return 'bg-green-100';
    if (confValue >= 0.7) return 'bg-blue-100';
    if (confValue >= 0.5) return 'bg-yellow-100';
    return 'bg-red-100';
  };
  
  const confidenceColor = getConfidenceColor(item.prediction.confidence);
  
  return (
    <TouchableOpacity 
      className="flex-row p-4 border-b border-gray-200 bg-white"
      onPress={() => onPress && onPress(item)}
    >
      <Image 
        source={{ uri: item.imageUri }}
        className="w-20 h-20 rounded-md mr-3"
      />
      <View className="flex-1 justify-center">
        <Text className="text-lg font-medium capitalize">{item.prediction.class}</Text>
        <Text className="text-gray-500 text-sm">
          {formatDate(item.timestamp)}
        </Text>
        <View className="flex-row items-center mt-1">
          <View className={`px-2 py-1 rounded-full ${confidenceColor} mr-2`}>
            <Text className="text-xs font-medium">
              {(item.prediction.confidence * 100).toFixed(0)}%
            </Text>
          </View>
          <Text className="text-gray-500 text-xs">{item.prediction.processingTime}s</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default DetectionHistoryItem;