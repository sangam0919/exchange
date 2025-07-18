const router = require('express').Router();

app.post('/api/order', (req, res) => { 
    const { type, market, price, amount, total } = req.body;
    console.log(`[${type.toUpperCase()}] ${market} ${amount}개 @ ${price} = ${total}`);
    
    // 여기에 DB에 기록하는 로직 추가 가능
    res.json({ message: '거래가 정상적으로 처리되었습니다.' });
  });


  module.exports = router;