// src/services/api.js
import axios from 'axios';

// Troque pelo IP da sua máquina ou URL de produção do seu Backend
const API_BASE_URL = 'http://192.168.1.100:3000'; 
export const WS_BASE_URL = 'ws://192.168.1.100:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export const VitaliveService = {
  getEspecialistas: () => api.get('/especialistas'),
  agendarConsulta: (dados: any) => api.post('/agendamentos', dados),
  getHistoricoConsultas: (pacienteId: string) => api.get(`/consultas/historico/${pacienteId}`),
  getReceitas: (pacienteId: string) => api.get(`/receitas/${pacienteId}`),
  getPerfil: (pacienteId: string) => api.get(`/pacientes/${pacienteId}`),
  updatePerfil: (pacienteId: string, dados: any) => api.put(`/pacientes/${pacienteId}`, dados),
};

export default api;