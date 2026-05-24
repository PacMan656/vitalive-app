import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Alert,
  FlatList
} from 'react-native';

// Dados fictícios de exemplo para os especialistas
const ESPECIALISTAS_DATA = [
  {
    id: '1',
    nome: 'Dr. André Rocha',
    especialidade: 'Cardiologista',
    disponivelHoje: true,
    vagasRestantes: 3,
    totalPacientesDia: 15,
    diasAtendimento: ['Seg', 'Qua', 'Sex'],
    local: 'Clínica Central - Sala 4'
  },
  {
    id: '2',
    nome: 'Dra. Juliana Costa',
    especialidade: 'Pediatra',
    disponivelHoje: false,
    vagasRestantes: 0,
    totalPacientesDia: 20,
    diasAtendimento: ['Ter', 'Qui'],
    local: 'Hospital Regional - Ala B'
  }
];

export default function PainelPacienteScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  // Inicializa conexão WebSocket para o sistema de emergência
  useEffect(() => {
    // Substitua pelo IP/URL do seu servidor backend
    const serverUrl = 'ws://192.168.1.100:8080'; 
    ws.current = new WebSocket(serverUrl);

    ws.current.onopen = () => setIsConnected(true);
    ws.current.onclose = () => setIsConnected(false);
    ws.current.onerror = () => console.log('Erro WS: Falha na conexão');

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  // 1. Função do Botão de Emergência (SAMU)
  const dispararEmergenciaSAMU = () => {
    if (isConnected && ws.current) {
      const alertaEmergencia = {
        type: 'EMERGENCIA_SAMU',
        timestamp: new Date().toISOString(),
        pacienteId: 'paciente_999',
        localizacao: { latitude: -6.76, longitude: -43.02 }, // Exemplo coordenagem
        message: '🚨 ALERTA DE EMERGÊNCIA CRÍTICA DISPARADO PELO APP!'
      };

      ws.current.send(JSON.stringify(alertaEmergencia));
      Alert.alert(
        "🚨 SAMU Notificado!", 
        "Sua localização e dados foram enviados em tempo real. Por favor, permaneça onde está, o socorro está a caminho."
      );
    } else {
      // Fallback amigável caso o WebSocket caia na hora da emergência
      Alert.alert(
        "Erro de Conexão em Tempo Real",
        "Não foi possível conectar ao servidor. Deseja discar diretamente para o 192?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Ligar para o SAMU (192)", onPress: () => console.log('Discando 192...') }
        ]
      );
    }
  };

  // 2. Ações da Central do Paciente
  const handleAgendar = (medico: typeof ESPECIALISTAS_DATA[0]) => {
    if (medico.vagasRestantes === 0) {
      Alert.alert("Indisponível", "A agenda deste especialista para hoje está lotada.");
      return;
    }
    Alert.alert("Sucesso", `Consulta pré-agendada com ${medico.nome}!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER / STATUS */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portal do Paciente</Text>
        <Text style={[styles.statusText, isConnected ? styles.online : styles.offline]}>
          • {isConnected ? 'Canal de Emergência Ativo' : 'Emergência em modo Offline'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* SEÇÃO 1: EMERGÊNCIA (O botão solicitado) */}
        <View style={styles.sectionEmergency}>
          <Text style={styles.sectionTitle}>Necessita de Socorro Imediato?</Text>
          <TouchableOpacity 
            style={styles.btnEmergencia} 
            onPress={dispararEmergenciaSAMU}
            activeOpacity={0.8}
          >
            <Text style={styles.txtEmergencia}>🚨 ACIONAR SAMU</Text>
            <Text style={styles.subtxtEmergencia}>Toque para enviar sua localização atual</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* SEÇÃO 2: CENTRAL DO PACIENTE & AGENDAMENTOS */}
        <View style={styles.sectionPacientes}>
          <Text style={styles.sectionTitle}>Disponibilidade de Especialistas</Text>
          <Text style={styles.sectionSubtitle}>Confira horários, locais e painel de vagas diárias:</Text>

          {ESPECIALISTAS_DATA.map((medico) => (
            <View key={medico.id} style={styles.cardMedico}>
              {/* Nome e Especialidade */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.medicoNome}>{medico.nome}</Text>
                  <Text style={styles.medicoEspec}>{medico.especialidade}</Text>
                </View>
                <View style={[styles.badgeStatus, medico.disponivelHoje ? styles.badgeDisponivel : styles.badgeLotado]}>
                  <Text style={styles.badgeText}>
                    {medico.disponivelHoje ? 'Atendendo Hoje' : 'Indisponível Hoje'}
                  </Text>
                </View>
              </View>

              {/* Informações de Painel/Vagas e Localização */}
              <View style={styles.cardBody}>
                <Text style={styles.infoText}>
                  📍 <Text style={styles.boldText}>Onde atende:</Text> {medico.local}
                </Text>
                <Text style={styles.infoText}>
                  📅 <Text style={styles.boldText}>Dias de atendimento:</Text> {medico.diasAtendimento.join(', ')}
                </Text>
                <Text style={styles.infoText}>
                  📊 <Text style={styles.boldText}>Pacientes agendados para o dia:</Text> {medico.totalPacientesDia}
                </Text>
                <Text style={styles.infoText}>
                  🟢 <Text style={styles.boldText}>Vagas restantes hoje:</Text> {medico.vagasRestantes}
                </Text>
              </View>

              {/* Botão para Agendar */}
              <TouchableOpacity 
                style={[styles.btnAgendar, !medico.disponivelHoje && styles.btnAgendarDesabilitado]}
                onPress={() => handleAgendar(medico)}
                disabled={!medico.disponivelHoje}
              >
                <Text style={styles.txtAgendar}>
                  {medico.vagasRestantes > 0 ? 'Solicitar Agendamento' : 'Agenda Esgotada'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  online: { color: '#28A745' },
  offline: { color: '#DC3545' },
  scrollContent: {
    padding: 20,
  },
  /* Estilos da Área de Emergência */
  sectionEmergency: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#343A40',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 15,
  },
  btnEmergencia: {
    backgroundColor: '#DC3545',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC3545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 10,
  },
  txtEmergencia: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtxtEmergencia: {
    color: '#FFE3E3',
    fontSize: 13,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#DEE2E6',
    marginVertical: 25,
  },
  /* Estilos dos Cards dos Médicos */
  sectionPacientes: {
    flex: 1,
  },
  cardMedico: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    paddingBottom: 12,
    marginBottom: 12,
  },
  medicoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  medicoEspec: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
  },
  badgeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeDisponivel: { backgroundColor: '#D4EDDA' },
  badgeLotado: { backgroundColor: '#F8D7DA' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#155724' },
  cardBody: {
    marginBottom: 15,
  },
  infoText: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 6,
  },
  boldText: {
    fontWeight: '600',
  },
  btnAgendar: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnAgendarDesabilitado: {
    backgroundColor: '#CED4DA',
  },
  txtAgendar: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});