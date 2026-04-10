import axios from "axios";

// If using Vite proxy → use "/api/quizzes"
// If not using proxy → use "http://localhost:5000/api/quizzes"

const API_URL = "/api/quizzes";

const quizService = {

  /* ================= GET ALL QUIZZES ================= */
  getAllQuizzes: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  /* ================= GET QUIZ BY PLANT NAME ================= */
  getQuizByPlantName: async (plantName) => {
    const encoded = encodeURIComponent(plantName);
    const response = await axios.get(`${API_URL}/${encoded}`);
    return response.data;
  },

  /* ================= GET QUIZ BY ID ================= */
  getQuizById: async (id) => {
    const response = await axios.get(`${API_URL}/id/${id}`);
    return response.data;
  },

  /* ================= CREATE QUIZ ================= */
  createQuiz: async (quizData) => {
    const response = await axios.post(API_URL, quizData);
    return response.data;
  },

  /* ================= UPDATE QUIZ ================= */
  updateQuiz: async (id, quizData) => {
    const response = await axios.put(`${API_URL}/${id}`, quizData);
    return response.data;
  },

  /* ================= DELETE QUIZ ================= */
  deleteQuiz: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  /* ================= DELETE QUIZ BY PLANT NAME ================= */
  deleteQuizByPlantName: async (plantName) => {
    try {
      const encoded = encodeURIComponent(plantName);
      const quiz = await axios.get(`${API_URL}/${encoded}`);
      if (quiz.data?._id) {
        await axios.delete(`${API_URL}/${quiz.data._id}`);
      }
    } catch (err) {
      // If quiz doesn't exist → ignore
    }
  },

  /* ================= CREATE OR UPDATE QUIZ ================= */
  createOrUpdateQuiz: async (quizData) => {
    try {
      const encoded = encodeURIComponent(quizData.plantName);
      const existing = await axios.get(`${API_URL}/${encoded}`);

      if (existing.data?._id) {
        const response = await axios.put(
          `${API_URL}/${existing.data._id}`,
          quizData
        );
        return response.data;
      }

    } catch {
      const response = await axios.post(API_URL, quizData);
      return response.data;
    }
  }

};

export default quizService;