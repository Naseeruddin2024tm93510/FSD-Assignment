import axios from 'axios';

const getBaseURL = () => {
  const { hostname, port } = window.location;
  
  // Mapping frontend ports to backend ports for EC2 environments
  if (port === '7000') return `http://${hostname}:7080/api`; // Main
  if (port === '6000') return `http://${hostname}:6080/api`; // UAT
  if (port === '5000') return `http://${hostname}:5080/api`; // Develop
  
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
