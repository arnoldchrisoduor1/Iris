import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

// Custom tab bar icon component
const TabIcon = ({ focused, color, name }) => {
  return (
    <View className={`items-center justify-center`}>
      {/* We'd use actual icons in a real app, but for simplicity using text */}
      <Text className={`text-lg ${focused ? 'text-primary' : 'text-gray-500'}`}>
        {name === 'Home' ? '🏠' : name === 'Camera' ? '📷' : '📚'}
      </Text>
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabel: ({ focused, color }) => (
          <Text 
            className={`text-xs ${focused ? 'text-primary' : 'text-gray-500'}`}
            style={{ color }}
          >
            {name}
          </Text>
        ),
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} name="Home" />
          ),
        }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{
          tabBarLabel: 'Camera',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} name="Camera" />
          ),
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} name="History" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;