import { io } from 'socket.io-client';
import API_BASE_URL from '../api/config';

const socket = io(API_BASE_URL, {
  withCredentials: true,
  transports: ['websocket'], // fallback 안 쓰고 순수 웹소켓만
});

export default socket;
