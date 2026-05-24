// app/_layout.js
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="triagem" />
      <Stack.Screen name="agendamento" />
      <Stack.Screen name="monitoramento" />
      <Stack.Screen name="triagem-dados" />
      <Stack.Screen name="localizador" />
      <Stack.Screen name="telemedicina" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}