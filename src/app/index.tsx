// app/index.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function TelaSplashOnboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Vitalive 🩺</Text>
      <Text style={styles.tagline}>Sua saúde monitorada em tempo real e consultas a um toque de distância.</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.replace('/triagem')}>
        <Text style={styles.btnTxt}>Começar Atendimento</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#007AFF', padding: 30 },
  logo: { fontSize: 42, fontWeight: '900', color: '#FFF', marginBottom: 10 },
  tagline: { fontSize: 16, color: '#E3F2FD', textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  btn: { backgroundColor: '#FFF', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
  btnTxt: { color: '#007AFF', fontWeight: 'bold', fontSize: 16 }
});