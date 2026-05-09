import axios from 'axios';

const getBaseURL = () => {
  const { hostname, port } = window.location;
  
  // Mapping frontend ports to backend ports for EC2 environments
  if (port === '80' || port === '') return `http://${hostname}:8081/api`; // Main
  if (port === '81') return `http://${hostname}:8082/api`; // UAT
  if (port === '82') return `http://${hostname}:8083/api`; // Develop
  
  // Fallback for local development
  return 'http://localhost:8080/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
