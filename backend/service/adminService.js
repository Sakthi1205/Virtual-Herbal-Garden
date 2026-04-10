// src/services/adminService.js

import axios from "axios";

const API_URL = "/plants";

export const plantService = {
  getAllPlants: async () => {
    const response = await axios.get(API_URL);
    return response.data.plants || []; // 🔥 important fix
  },

  createPlant: async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data.plant;
  },

  updatePlant: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data.plant;
  },

  deletePlant: async (id) => {
    return await axios.delete(`${API_URL}/${id}`);
  },
};