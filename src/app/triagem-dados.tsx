// app/triagem-dados.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { VitaliveService, WS_BASE_URL } from '../services/api';

export default function TelaTriagemDados() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [wsConectado, setWsConectado] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  // Estados do Formulário de Triagem
  const [nome, setNome] = useState('');
  const [cartaoSus, setCartaoSus] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [alergias, setAlergias] = useState('');
  const [nivelDor, setNivelDor] = useState('Moderada'); // Leve, Moderada, Intensa

  // Conecta ao WebSocket para envio imediato após o preenchimento
  useEffect(() => {
    ws.current = new WebSocket(WS_BASE_URL);
    ws.current.onopen = () => setWsConectado(true);
    ws.current.onclose = () => setWsConectado(false);
    return () => ws.current?.close();
  }, []);

  const enviarTriagem = () => {
    // Validação básica de campos obrigatórios
    if (!nome.trim() || !cartaoSus.trim() || !sintomas.trim()) {
      Alert.alert("Campos Obrigatórios", "Por favor, preencha o Nome, Cartão SUS e os Sintomas Atuais.");
      return;
    }

    setLoading(true);

    const dadosTriagem = {
      pacienteId: 'paciente_felipe_123',
      nome,
      cartaoSus,
      sintomas,
      alergias,
      nivelDor,
      timestamp: new Date().toISOString()
    };

    // 1. Salva a triagem no banco de dados via requisição HTTP HTTP
    // (Simulando uma nova rota adicionada ao VitaliveService)
    VitaliveService.agendarConsulta({ type: 'REGISTRO_TRIAGEM', ...dadosTriagem }) 
      .then(() => {
        // 2. Se salvou no banco, envia o alerta imediato via WebSocket para a central médica (SAMU/Hospital)
        if (wsConectado && ws.current) {
          ws.current.send(JSON.stringify({
            type: 'ALERTA_TRIAGEM_EMERGENCIA',
            ...dadosTriagem
          }));
        }

        Alert.alert(
          "Triagem Concluída", 
          "Seus dados médicos foram transmitidos para a equipe de plantão. Entrando na sala de videoconferência..."
        );
        
        // 3. Redireciona o paciente direto para a Telemedicina com o médico
        router.replace('/telemedicina');
      })
      .catch(() => {
        Alert.alert("Erro de Conexão", "Não foi possível enviar a triagem para o servidor. Tente novamente.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitulo}>Ficha de Triagem Digital</Text>
      <Text style={styles.headerSub}>Essas informações adiantam o seu atendimento com a equipe médica.</Text>

      {/* Formulário */}
      <View style={styles.form}>
        <Text style={styles.label}>Nome Completo do Paciente *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Marcos Felipe dos Santos" 
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Número do Cartão do SUS *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="000 0000 0000 0000" 
          keyboardType="numeric"
          value={cartaoSus}
          onChangeText={setCartaoSus}
        />

        <Text style={styles.label}>O que você está sentindo? (Sintomas) *</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Descreva brevemente seus sintomas atuais (ex: Dor de cabeça forte, falta de ar...)" 
          multiline
          numberOfLines={4}
          value={sintomas}
          onChangeText={setSintomas}
        />

        <Text style={styles.label}>Possui alguma Alergia a Medicamentos?</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Dipirona, Penicilina (ou deixe em branco)" 
          value={alergias}
          onChangeText={setAlergias}
        />

        <Text style={styles.label}>Intensidade dos Sintomas / Dor</Text>
        <View style={styles.seletorDorContainer}>
          {['Leve', 'Moderada', 'Intensa'].map((nivel) => (
            <TouchableOpacity
              key={nivel}
              style={[
                styles.btnSeletor, 
                nivelDor === nivel && styles.btnSeletorAtivo,
                nivelDor === nivel && nivel === 'Intensa' && styles.btnSeletorCritico
              ]}
              onPress={() => setNivelDor(nivel)}
            >
              <Text style={[styles.txtSeletor, nivelDor === nivel && styles.txtSeletorAtivo]}>
                {nivel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Botão de Envio */}
      <TouchableOpacity 
        style={styles.btnEnviar} 
        onPress={enviarTriagem}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.btnEnviarTxt}>Enviar e Iniciar Atendimento</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancelar} onPress={() => router.back()}>
        <Text style={styles.btnCancelarTxt}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 24, paddingTop: 50 },
  headerTitulo: { fontSize: 24, fontWeight: 'bold', color: '#212529', marginBottom: 6 },
  headerSub: { fontSize: 14, color: '#6C757D', marginBottom: 25, lineHeight: 20 },
  form: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#495057', marginBottom: 6 },
  input: { 
    backgroundColor: '#FFF', 
    borderWidth: 1, 
    borderColor: '#CED4DA', 
    padding: 12, 
    borderRadius: 8, 
    fontSize: 15,
    marginBottom: 16,
    color: '#212529'
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  seletorDorContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 10 },
  btnSeletor: { flex: 1, backgroundColor: '#E9ECEF', padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  btnSeletorAtivo: { backgroundColor: '#007AFF' },
  btnSeletorCritico: { backgroundColor: '#DC3545' },
  txtSeletor: { fontSize: 14, color: '#495057', fontWeight: '500' },
  txtSeletorAtivo: { color: '#FFF', fontWeight: 'bold' },
  btnEnviar: { backgroundColor: '#28A745', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 15, elevation: 2 },
  btnEnviarTxt: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  btnCancelar: { padding: 15, alignItems: 'center', marginTop: 10 },
  btnCancelarTxt: { color: '#6C757D', fontSize: 14, fontWeight: '500' }
});