// app/(tabs)/_layout.js
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#6C757D',
      tabBarStyle: { height: 60, paddingBottom: 8 }
    }}>
      <Tabs.Screen 
        name="verificacao" 
        options={{ title: 'Médicos', tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 12 }}>Especialistas</Text> }} 
      />
      <Tabs.Screen 
        name="historico" 
        options={{ title: 'Consultas', tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 12 }}>Histórico</Text> }} 
      />
      <Tabs.Screen 
        name="receitas" 
        options={{ title: 'Receitas', tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 12 }}>Receitas</Text> }} 
      />
      <Tabs.Screen 
        name="perfil" 
        options={{ title: 'Perfil', tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 12 }}>Perfil</Text> }} 
      />
    </Tabs>
  );
}