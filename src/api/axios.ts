import axios from "axios";

const api = axios.create({
  baseURL: `https://server-4jry.onrender.com/api`,
});

export default api;
