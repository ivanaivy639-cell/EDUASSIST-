import axios from "axios";

const api = axios.create({
  baseURL: "http://ton-backend.test/api", // ou IP locale
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;