import axios from "axios";

const API_URL = "http://localhost:5000/api/admin/plants";

export const plantService = {
  getAllPlants: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  createPlant: async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  updatePlant: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  deletePlant: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },
};