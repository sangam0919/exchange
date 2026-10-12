// src/api/upbit.js
import axios from 'axios';
import API_BASE_URL from './config';

export const getMarketPrice = async (symbol = 'KRW-BTC') => {
  const res = await axios.get(`${API_BASE_URL}/main/price/${symbol}`);
  return res.data; // 백엔드에서 프록시한 가격
};
