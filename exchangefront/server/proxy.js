// exchangefront/server/proxy.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const WebSocket = require('ws');

const app = express();
app.use(cors());

/* ============ REST Proxy ============ */

// 전체 마켓 조회
app.get('/api/upbit/marketall', async (req, res) => {
  try {
    const response = await fetch('https://api.upbit.com/v1/market/all?isDetails=true');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'marketall 실패', detail: err.message });
  }
});

// 현재가 조회
app.get('/api/upbit/ticker', async (req, res) => {
  const { markets } = req.query;
  try {
    const response = await fetch(`https://api.upbit.com/v1/ticker?markets=${markets}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'ticker 실패', detail: err.message });
  }
});

/* ============ WebSocket Proxy ============ */

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (client) => {
  console.log('🟢 프론트에서 WebSocket 연결됨');

  const upbitWs = new WebSocket('wss://api.upbit.com/websocket/v1');

  upbitWs.on('open', () => {
    upbitWs.send(JSON.stringify([
      { ticket: "proxy" },
      { type: "ticker", codes: ["KRW-BTC", "KRW-ETC", "KRW-CARV"] }
    ]));
  });

  upbitWs.on('message', (msg) => {
    client.emit('price', msg.toString());
  });

  client.on('disconnect', () => {
    console.log('❌ 프론트 연결 해제');
    upbitWs.close();
  });
});

/* ============ Start Server ============ */

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`🚀 프록시 서버 실행 중: http://localhost:${PORT}`);
});
