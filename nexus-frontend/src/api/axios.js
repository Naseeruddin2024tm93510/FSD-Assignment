import axios from 'axios';

const getBaseURL = () => {
  const { hostname, port } = window.location;
  
  // Mapping frontend ports to backend ports for EC2 environments
  if (port === '9000') return `http://${hostname}:9080/api`; // Main
  if (port === '9001') return `http://${hostname}:9081/api`; // UAT
  if (port === '9002') return `http://${hostname}:9082/api`; // Develop
  
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
