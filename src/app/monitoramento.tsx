// app/monitoramento.js
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { WS_BASE_URL } from '../services/api';

export default function TelaMonitoramentoViatura() {
  const router = useRouter();
  const ws = useRef<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 1. Localização fixa/simulada do paciente (Onde o socorro deve ir)
  const [localPaciente] = useState({
    latitude: -6.7622,
    longitude: -43.0225,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });

  // 2. Estado que guardará a posição da ambulância (começa um pouco distante)
  const [localViatura, setLocalViatura] = useState({
    latitude: -6.7750, 
    longitude: -43.0350,
  });

  const [statusViatura, setStatusViatura] = useState("Viatura a caminho...");
  const [tempoEstimado, setTempoEstimado] = useState("Calculando...");

  useEffect(() => {
    // Conecta ao canal do WebSocket
    ws.current = new WebSocket(WS_BASE_URL);

    ws.current.onopen = () => {
      console.log("Conectado ao canal de rastreamento.");
      setLoading(false);
      
      // Envia uma mensagem dizendo ao servidor que este é o paciente monitorando
      ws.current?.send(JSON.stringify({
        type: 'INICIAR_RASTREAMENTO_PACIENTE',
        pacienteId: 'paciente_felipe_123'
      }));
    };

    // 3. Ouvindo as atualizações de localização enviadas pelo Backend
    ws.current.onmessage = (event) => {
      try {
        const dados = JSON.parse(event.data);

        // Se o backend enviar um evento de atualização de GPS da viatura
        if (dados.type === 'ATUALIZACAO_GPS_SAMU') {
          setLocalViatura({
            latitude: dados.latitude,
            longitude: dados.longitude
          });
          setTempoEstimado(dados.tempoEstimado || "8 min");
          setStatusViatura(dados.status || "Viatura em deslocamento rápido");
        }
      } catch (e) {
        console.log("Erro ao processar dados de localização:", e);
      }
    };

    ws.current.onerror = () => {
      Alert.alert("Erro de Conexão", "Não foi possível rastrear em tempo real, mas o chamado continua ativo.");
    };

    // Fecha a conexão ao sair da tela para poupar bateria e dados do usuário
    return () => {
      ws.current?.close();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.containerLoading}>
        <ActivityIndicator size="large" color="#DC3545" />
        <Text style={styles.txtLoading}>Conectando ao sistema do SAMU...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* MAPA EM TEMPO REAL */}
      <MapView 
        style={styles.mapa}
        initialRegion={localPaciente}
        showsUserLocation={false}
      >
        {/* Marcador do Paciente */}
        <Marker 
          coordinate={localPaciente} 
          title="Você está aqui"
          description="Aguarde o socorro no local"
          pinColor="#007AFF"
        />

        {/* Marcador Móvel da Viatura do SAMU */}
        <Marker 
          coordinate={localViatura} 
          title="Viatura SAMU"
          description={statusViatura}
        >
          {/* Ícone customizado ou emoji para diferenciar a ambulância */}
          <View style={styles.iconeAmbulancia}>
            <Text style={{ fontSize: 24 }}>🚑</Text>
          </View>
        </Marker>
      </MapView>

      {/* PAINEL INFORMATIVO INFERIOR */}
      <View style={styles.painelInformacao}>
        <View style={styles.linhaStatus}>
          <Text style={styles.txtStatusTitulo}>Status do Socorro:</Text>
          <Text style={styles.txtStatusValor}>🚨 {statusViatura}</Text>
        </View>

        <View style={styles.linhaTempo}>
          <Text style={styles.txtTempoLabel}>Tempo Estimado de Chegada:</Text>
          <Text style={styles.txtTempoValor}>{tempoEstimado}</Text>
        </View>

        <Text style={styles.avisoCard}>
          ⚠️ Mantenha a calma. Seus dados de triagem e histórico médico já estão na tela do médico regulador.
        </Text>

        <TouchableOpacity 
          style={styles.btnTelemedicina}
          onPress={() => router.push('/telemedicina')}
        >
          <Text style={styles.btnTxt}>Falar com Médico por Vídeo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  containerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  txtLoading: { marginTop: 12, fontSize: 16, color: '#495057', fontWeight: '500' },
  mapa: { flex: 1 },
  iconeAmbulancia: {
    backgroundColor: '#FFF',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#DC3545',
    elevation: 4
  },
  painelInformacao: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 10,
  },
  linhaStatus: { marginBottom: 10 },
  txtStatusTitulo: { fontSize: 13, color: '#6C757D', fontWeight: '500' },
  txtStatusValor: { fontSize: 18, fontWeight: 'bold', color: '#212529', marginTop: 2 },
  linhaTempo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F3F5' },
  txtTempoLabel: { fontSize: 14, color: '#495057', fontWeight: '500' },
  txtTempoValor: { fontSize: 20, fontWeight: 'bold', color: '#DC3545' },
  avisoCard: { fontSize: 12, color: '#856404', backgroundColor: '#FFF3CD', padding: 10, borderRadius: 8, overflow: 'hidden', marginBottom: 15, lineHeight: 16 },
  btnTelemedicina: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnTxt: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});