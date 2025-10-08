import axios from 'axios';
import config from '../config';

const API_URL = `${config.backendUrl}/api/admin`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Plant related API calls
export const plantService = {
  // Get all plants
  getAllPlants: async () => {
    try {
      const response = await api.get('/plants');
      return response.data;
    } catch (error) {
      console.error('Error fetching plants:', error);
      throw error;
    }
  },

  // Get single plant by ID
  getPlantById: async (id) => {
    try {
      const response = await api.get(`/plants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching plant with id ${id}:`, error);
      throw error;
    }
  },

  // Create new plant
  createPlant: async (plantData) => {
    try {
      const response = await api.post('/plants', plantData);
      return response.data;
    } catch (error) {
      console.error('Error creating plant:', error);
      throw error;
    }
  },

  // Update plant
  updatePlant: async (id, plantData) => {
    try {
      const response = await api.put(`/plants/${id}`, plantData);
      return response.data;
    } catch (error) {
      console.error(`Error updating plant with id ${id}:`, error);
      throw error;
    }
  },

  // Delete plant
  deletePlant: async (id) => {
    try {
      const response = await api.delete(`/plants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting plant with id ${id}:`, error);
      throw error;
    }
  }
};

export default api;
