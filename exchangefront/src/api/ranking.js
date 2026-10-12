// src/api/ranking.js
import axios from 'axios';
import API_BASE_URL from './config';

export const getRanking = async () => {
  const res = await axios.get(`${API_BASE_URL}/ranking/all`);
  return res.data;
};
