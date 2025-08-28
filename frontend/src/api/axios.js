// frontend/src/api/axios.js
import axios from 'axios';

export default axios.create({
  baseURL: 'http://localhost:8000/api', // Laravel API
});
