const express = require('express');
const router = express.Router();
const axios = require('axios');

// 첫 화면 접속 시 메인 UI만 보여줌 (시세 없이)
// router.get('/', (req, res) => {
//   res.render('main', { tickers: null });
// });

// 상세페이지
router.get('/exchangeDetail', (req, res) => {
  res.render('exchangeDetail');
});

// 시세 목록이 포함된 메인 페이지
router.get('/main', async (req, res) => {
  try {
    const marketRes = await axios.get('https://api.upbit.com/v1/market/all');
    const markets = marketRes.data.filter((m) => m.market.startsWith('KRW-'));
    const marketNames = markets.map((m) => m.market);

    const tickerRes = await axios.get('https://api.upbit.com/v1/ticker', {
      params: { markets: marketNames.join(',') }
    });

    const marketMap = {};
    markets.forEach((m) => {
      marketMap[m.market] = m.korean_name;
    });

    const tickers = tickerRes.data.map((item) => ({
      market: item.market,
      korean_name: marketMap[item.market],
      trade_price: item.trade_price.toLocaleString(),
      signed_change_rate: (item.signed_change_rate * 100).toFixed(2) + '%',
      acc_trade_price_24h: Math.floor(item.acc_trade_price_24h).toLocaleString()
    }));

    // ✅ 페이지네이션 처리
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 10;
    const totalPages = Math.ceil(tickers.length / itemsPerPage);
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pagedTickers = tickers.slice(start, end);

    res.render('main', { tickers: pagedTickers, currentPage: page, totalPages });
  } catch (err) {
    console.error(err);
    res.send('API 에러 발생');
  }
});

router.get('/exchangeDetail/:market', (req, res) => {
  const market = req.params.market; // ex: KRW-BTC
  res.render('exchangeDetail', { market });
});

module.exports = router;
