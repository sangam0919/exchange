const express = require('express');
const router = express.Router();
const axios = require('axios');

// 메인 페이지
router.get('/', async (req, res) => {
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

router.get('/api/upbit/tickers', async (req, res) => {
  try {
    const marketsRes = await axios.get('https://api.upbit.com/v1/market/all');
    const markets = marketsRes.data.filter(m => m.market.startsWith('KRW-'));
    const marketMap = {};
    markets.forEach((m) => {
      marketMap[m.market] = m.korean_name;
    });

    const marketCodes = markets.map(m => m.market).join(',');
    const tickerRes = await axios.get('https://api.upbit.com/v1/ticker', {
      params: { markets: marketCodes }
    });

    const tickers = tickerRes.data.map(item => ({
      market: item.market,
      korean_name: marketMap[item.market],
      trade_price: item.trade_price,
      signed_change_rate: item.signed_change_rate,
      acc_trade_price_24h: item.acc_trade_price_24h
    }));

    res.json(tickers);
  } catch (err) {
    console.error('업비트 티커 API 오류:', err.message);
    res.status(500).json({ error: '티커 요청 실패' });
  }
});

// 상세 페이지
router.get('/exchangeDetail/:market', (req, res) => {
  const market = req.params.market;
  res.render('exchangeDetail', { market });
});

// ✅ 프론트에서 마켓 목록 요청할 때 쓰는 API
router.get('/price/:symbol', async (req, res) => {
  try {
    const result = await axios.get('https://api.upbit.com/v1/ticker', {
      params: { markets: req.params.symbol }
    });
    res.json(result.data[0] || null);
  } catch (err) {
    console.error('업비트 가격 API 오류:', err.message);
    res.status(500).json({ error: 'price 요청 실패' });
  }
});

router.get('/api/upbit/marketall', async (req, res) => {
  try {
    const result = await axios.get('https://api.upbit.com/v1/market/all?isDetails=true');
    res.json(result.data);
  } catch (err) {
    console.error('업비트 마켓 API 오류:', err.message);
    res.status(500).json({ error: '업비트 요청 실패' });
  }
});

module.exports = router;

