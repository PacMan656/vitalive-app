// app/triagem.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { WS_BASE_URL } from '../services/api';

export default function TelaTriagem() {
  const router = useRouter();
  const [wsConectado, setWsConectado] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(WS_BASE_URL);
    ws.current.onopen = () => setWsConectado(true);
    ws.current.onclose = () => setWsConectado(false);
    return () => ws.current?.close();
  }, []);

  const dispararSAMU = () => {
    if (wsConectado && ws.current) {
      ws.current.send(JSON.stringify({ type: 'EMERGENCIA_SAMU', timestamp: new Date() }));
      Alert.alert("🚨 SAMU Chamado", "Socorro a caminho. Redirecionando para triagem médica remota.");
      router.push('/telemedicina');
    } else {
      Alert.alert("Erro", "Falha de rede em tempo real. Disque imediatamente para o 192.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Do que você precisa agora?</Text>
      <TouchableOpacity style={styles.btnEmergencia} onPress={dispararSAMU}>
        <Text style={styles.txtBtn}>🚨 EMERGÊNCIA (SAMU)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnConsulta} onPress={() => router.push('/(tabs)/verificacao')}>
        <Text style={styles.txtBtn}>📅 AGENDAR CONSULTA</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F8F9FA' },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  btnEmergencia: { backgroundColor: '#DC3545', padding: 25, borderRadius: 16, marginBottom: 20, alignItems: 'center' },
  btnConsulta: { backgroundColor: '#007AFF', padding: 25, borderRadius: 16, alignItems: 'center' },
  txtBtn: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});