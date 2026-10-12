//npm i express sequelize mysql2 dotenv cors cookie-parser axios jsonwebtoken socket.io ws
require("dotenv").config();
require('./models/index'); // Sequelize 연결
const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const WebSocket = require("ws");
const http = require("http");
const { Server } = require("socket.io");
const cron = require("node-cron");
const { handleBatchUserOps } = require("./controllers/entrypoint.controller");

const { Wallet, Ranking, User, Notification } = require("./models/index");

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:3000",
  ...(process.env.FRONTEND_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean),
];
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
};
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

// 미들웨어 설정
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(cors(corsOptions));

// 정적 파일 경로
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/upload")));

// EJS 뷰 엔진 설정
app.set("view engine", "ejs");

// 라우터 연결
app.use('/main', require('./routers/main.router'));
// app.use('/write', require('./routers/write.router'));
// app.use('/detail', require('./routers/detail.router'));
// app.use('/edit', require('./routers/edit.router'));
// app.use('/mypage', require('./routers/mypage.router'));
// app.use('/follow', require('./routers/follow.router'));
// app.use('/api/setting', require('./routers/settings.router'));
// app.use('/list', require('./routers/list.router'));
// app.use('/stats', require('./routers/stats.router'));
app.use('/login', require('./routers/login.router')); 
app.use('/order', require('./routers/order.router'));
app.use('/ranking', require('./routers/ranking.router'));
app.use('/wallet', require('./routers/wallet.router'));
app.use("/userOp", require('./routers/userOp.router'));

// socket.io 클라이언트 연결 감지
io.on("connection", (socket) => {
  console.log("소켓 연결됨:", socket.id);
});

// 업비트 WebSocket 설정
const MARKET = "KRW-BTC";
let lastPrice = 0;

const socket = new WebSocket("wss://api.upbit.com/websocket/v1");

socket.on("open", () => {
  const msg = [
    { ticket: "server-upbit-ticker" },
    {
      type: "ticker",
      codes: [MARKET]
    }
  ];
  socket.send(JSON.stringify(msg));
  console.log("업비트 WebSocket 연결됨");
});

socket.on("message", async (data) => {
  try {
    const json = JSON.parse(data.toString("utf8"));
    const currentPrice = parseFloat(json.trade_price);

    if (lastPrice === 0) {
      lastPrice = currentPrice;
      return;
    }

    const rate = ((currentPrice - lastPrice) / lastPrice) * 100;

    if (Math.abs(rate) >= 5) {
      console.log(`가격 변동 ${rate.toFixed(2)}% 발생`);

      const allRankings = await Ranking.findAll({
        include: [{ model: User }]
      });

      for (const rank of allRankings) {
        const type = rate > 0 ? "PROFIT" : "LOSS";
        const msg = `${rank.User.nickname}님 자산 기준 ${rate.toFixed(2)}% ${type === "PROFIT" ? "상승" : "하락"} 발생`;

        // 실시간 알림 전송
        io.emit("alert", {
          userId: rank.userId,
          message: msg,
          type
        });

        // 알림 DB 저장
        await Notification.create({
          userId: rank.userId,
          message: msg,
          type
        });

        console.log(`알림 처리 완료: ${msg}`);
      }

      lastPrice = currentPrice;
    }
  } catch (err) {
    console.error("업비트 WebSocket 처리 오류:", err.message);
  }
});

socket.on("error", (err) => {
  console.error("WebSocket 오류:", err.message);
});

socket.on("close", () => {
  console.warn("WebSocket 연결 종료됨");
});

cron.schedule("0 */1 * * *", async () => {
  console.log(" 1시간마다 handleOps 실행");
  await handleBatchUserOps();
}); 

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`서버 실행됨: http://localhost:${PORT}`);
});

