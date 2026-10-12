import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { createChart } from 'lightweight-charts';
import { getDemoAccount, saveDemoAccount } from '../demoAccount';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 74px);
  padding: 34px 24px 72px;
  background-color: #f5f7fb;
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;
  max-width: 1180px;

  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const ChartSection = styled.section`
  background: white;
  border: 1px solid #e8edf3;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 8px 28px rgba(27, 39, 58, 0.045);
  display: flex;
  flex-direction: column;
`;

const OrderSection = styled.section`
  background: white;
  border: 1px solid #e8edf3;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 8px 28px rgba(27, 39, 58, 0.045);
  display: flex;
  flex-direction: column;
`;

const ChartTitle = styled.h2`
  font-size: 21px;
  margin: 0 0 8px;
  letter-spacing: -.035em;
`;

const Tooltip = styled.div`
  font-size: 12px;
  color: #7b8798;
  margin-bottom: 8px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 430px;
  @media(max-width:680px){height:320px;}
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e7ebf2;
  background: #f7f9fb;

  .tab {
    flex: 1;
    text-align: center;
    font-weight: bold;
    padding: 14px 0;
    cursor: pointer;
    background: #f7f9fb;
    transition: 0.2s ease;

    &:hover {
      background: #edf2f5;
    }
  }

  .tab.active {
    background: #ffffff;
    border-bottom: 3px solid #188b75;
    color: #188b75;
  }
`;

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Label = styled.label`
  font-size: 12px;
  color: #667386;
  font-weight: 700;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e6ee;
  border-radius: 9px;
  color: #172033;
  background: #fff;
  outline: none;
  &:focus { border-color: #54b7a1; box-shadow: 0 0 0 3px rgba(84, 183, 161, .14); }
`;

const Button = styled.button`
  margin-top: 20px;
  padding: 0; /* padding 제거 */
  background-color: transparent; /* 배경 투명 */
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: inline-block;
  width: 100%;
  margin-top: 8px;
  padding: 10px 14px;
  background: #17856c;
  border-radius: 10px;
  transition: transform .15s, filter .15s;
  &:hover { transform: translateY(-1px); filter: brightness(.97); }
  &:disabled { cursor: not-allowed; opacity: .5; }
`;

const BuyButton = styled(Button)`
  background: #17856c;
  svg #shape {
    stroke: #2ecc71;
  }

  &:hover svg #shape {
    stroke: #27ae60;
  }

  #text a, #text span {
    color: white;
  }
`;

const SellButton = styled(Button)`
  background: #dc5964;
  svg #shape {
    stroke: #e74c3c;
  }

  &:hover svg #shape {
    stroke: #c0392b;
  }

  #text a, #text span {
    color: white;
  }
`;


const PriceBanner = styled.div`
  font-size: 29px;
  font-weight: 850;
  margin: 8px 0 22px;
  text-align: left;
  color: #172033;
  letter-spacing: -.04em;
`;

const SvgWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 22px;
  display: block;
  border-radius: 6px;
  svg { display: none; }

  #shape {
    stroke-width: 6px;
    fill: transparent;
    stroke-dasharray: 85 400;
    stroke-dashoffset: -220;
    transition: 1s all ease;
  }

  #text {
    margin-top: 0;
    text-align: center;
  }

  #text a, #text span {
    text-decoration: none;
    font-weight: bold;
    font-size: 16px;
  }

  &:hover #shape {
    stroke-dasharray: 50 0;
    stroke-width: 3px;
    stroke-dashoffset: 0;
  }
`;

const Notice = styled.div`
  margin-bottom: 18px; padding: 11px 12px; border-radius: 9px;
  background: #f1f7f6; color: #52766e; font-size: 11px; line-height: 1.6;
`;


const ExchangeDetailPage = () => {
  const { market } = useParams();
  const chartRef = useRef(null);
  const tooltipRef = useRef(null);
  const chartInstance = useRef(null);
  const candleSeriesRef = useRef(null);
  const [marketName, setMarketName] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [tokenBalance, setTokenBalance] = useState('0');

  const [tab, setTab] = useState('buy');
  const [inputs, setInputs] = useState({
    'buy-price': '',
    'buy-amount': '',
    'buy-total': '',
    'sell-price': '',
    'sell-amount': '',
    'sell-total': '',
  });

  const refreshDemoBalances = useCallback(() => {
    const account = getDemoAccount();
    setTokenBalance(String(account.holdings[market]?.amount || 0));
  }, [market]);

  useEffect(() => {
    refreshDemoBalances();
    window.addEventListener('storage', refreshDemoBalances);
    window.addEventListener('sa-demo-account-updated', refreshDemoBalances);
    return () => {
      window.removeEventListener('storage', refreshDemoBalances);
      window.removeEventListener('sa-demo-account-updated', refreshDemoBalances);
    };
  }, [market, refreshDemoBalances]);

  const updateInput = (key, value) => {
    const type = key.split('-')[0];
  
    if (key === 'buy-total' || key === 'sell-total') {
      setInputs((prev) => ({
        ...prev,
        [key]: value
      }));
      return;
    }
  
    const totalKey = `${type}-total`;
  
    const price = key.includes('price') ? value : inputs[`${type}-price`];
    const amount = key.includes('amount') ? value : inputs[`${type}-amount`];
  
    const total = parseFloat(price) * parseFloat(amount);
  
    setInputs((prev) => ({
      ...prev,
      [key]: value,
      [totalKey]: isNaN(total) ? '' : total.toString(), // 자동 계산은 여기서만!
    }));
  };


  useEffect(() => {
    const fetchMarketName = async () => {
      try {
        const res = await fetch('https://api.upbit.com/v1/market/all?isDetails=true');
        const data = await res.json();
        const match = data.find((m) => m.market === market);
        setMarketName(match ? match.korean_name : market);
      } catch (err) {
        console.error('마켓 이름 가져오기 실패:', err);
        setMarketName(market);
      }
    };
    fetchMarketName();
  }, [market]);

  // setTime써서 차트 뛰우는거 가격이랑 
  useEffect(() => {
    const fetchPrice = async () => {
      const res = await fetch(`https://api.upbit.com/v1/ticker?markets=${market}`);
      // const res = await fetch(`https://api.upbit.com/v1/ticker?markets=${market}`);
      const [data] = await res.json();
      setCurrentPrice(data.trade_price); // ← 이 줄을 고쳐야 함!
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 3000);
    return () => clearInterval(interval);
  }, [market]);

  useEffect(() => {
    if (!currentPrice) return;

    setInputs((prev) => ({
      ...prev,
      ...(tab === 'buy' && !prev['buy-price'] && { 'buy-price': currentPrice.toString() }),
      ...(tab === 'sell' && !prev['sell-price'] && { 'sell-price': currentPrice.toString() }),
    }));
  }, [tab, currentPrice]);

  useEffect(() => {
    if (!chartRef.current || chartInstance.current) return;
  
    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: 'solid', color: '#ffffff' },
        textColor: '#111',
        fontSize: 12,
        fontFamily: 'Arial',
      },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      priceScale: { borderColor: '#bbb' },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        tickMarkFormatter: (time) => {
          const date = new Date(time * 1000);
          return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        },
      },
      crosshair: {
        vertLine: { labelVisible: false },
        horzLine: { labelVisible: true },
      },
    });
  
    chartInstance.current = chart;
    const candleSeries = chart.addCandlestickSeries();
    candleSeriesRef.current = candleSeries;
  
    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) {
        const { width, height } = chartRef.current.getBoundingClientRect();
        chart.resize(width, height);
      }
    });
    resizeObserver.observe(chartRef.current);
  
    const loadCandles = async () => {
      const res = await fetch(`https://api.upbit.com/v1/candles/minutes/1?market=${market}&count=60`);
      const data = await res.json();
      const formatted = data.reverse().map((item) => ({
        time: Math.floor(new Date(item.candle_date_time_kst).getTime() / 1000),
        open: item.opening_price,
        high: item.high_price,
        low: item.low_price,
        close: item.trade_price,
      }));
      candleSeries.setData(formatted);
      dataListRef.current = formatted; //초기 캔들 배열 저장
      chart.timeScale().fitContent();
    };
  
    chart.subscribeCrosshairMove((param) => {
      if (!param.point || !param.time || !param.seriesData) {
        tooltipRef.current.textContent = '가격: -';
        return;
      }
  
      const price = param.seriesData.get(candleSeries)?.close;
      const utc = new Date(param.time * 1000);
      const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
      const hour = kst.getHours().toString().padStart(2, '0');
      const minute = kst.getMinutes().toString().padStart(2, '0');
  
      if (tooltipRef.current) {
        tooltipRef.current.textContent = price
          ? `${hour}:${minute} - 가격: ${price.toLocaleString()} KRW`
          : '가격: -';
      }
    });
  
    loadCandles();
  
    return () => {
      resizeObserver.disconnect();
    };
  }, [market]);
  
  const liveCandleRef = useRef(null);
  const dataListRef = useRef([]);

  useEffect(() => {
    const ws = new WebSocket('wss://api.upbit.com/websocket/v1');
  
    ws.onopen = () => {
      console.log('📡 WebSocket 연결됨');
      ws.send(JSON.stringify([
        { ticket: 'chart-and-price' },
        { type: 'ticker', codes: [market] }
      ]));
    };
  
    ws.onmessage = (event) => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = JSON.parse(reader.result);
        const tradePrice = data.trade_price;
        setCurrentPrice(tradePrice);
  
        const now = new Date();
        const alignedTime = Math.floor(now.getTime() / 1000 / 60) * 60;
  
        const lastCandle = dataListRef.current[dataListRef.current.length - 1];
  
        // 새로운 캔들이 시작되면
        if (!liveCandleRef.current || liveCandleRef.current.time !== alignedTime) {
          // 이전 liveCandle을 마감 처리하고 리스트에 추가
          if (liveCandleRef.current && (!lastCandle || liveCandleRef.current.time > lastCandle.time)) {
            dataListRef.current.push(liveCandleRef.current);
          
            //중복된 time 제거 (Set으로 시간 필터링)
            const deduplicated = [];
            const seen = new Set();
          
            for (let i = 0; i < dataListRef.current.length; i++) {
              const item = dataListRef.current[i];
              if (!seen.has(item.time)) {
                deduplicated.push(item);
                seen.add(item.time);
              }
            }
          
            dataListRef.current = deduplicated;
          
            //60개 초과 시 앞에서 자르기
            if (dataListRef.current.length > 60) {
              dataListRef.current = dataListRef.current.slice(-60);
            }
          
            //복사본 넘김 (필수!)
            candleSeriesRef.current.setData([...dataListRef.current]);
          }
          // 새 캔들 시작
          liveCandleRef.current = {
            time: alignedTime,
            open: tradePrice,
            high: tradePrice,
            low: tradePrice,
            close: tradePrice
          };
        } else {
          // 현재 진행 중인 캔들 업데이트
          const candle = liveCandleRef.current;
          candle.high = Math.max(candle.high, tradePrice);
          candle.low = Math.min(candle.low, tradePrice);
          candle.close = tradePrice;
  
          candleSeriesRef.current.update(candle);
        }
      };
      reader.readAsText(event.data);
    };
  
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [market]);
  
  
  

    // 이게 업비트 socket 
    useEffect(() => {
      if (!candleSeriesRef.current) return;
    
      const ws = new WebSocket('wss://api.upbit.com/websocket/v1');
    
      ws.onopen = () => {
        ws.send(JSON.stringify([
          { ticket: 'chart-and-price' },
          { type: 'ticker', codes: [market] }
        ]));
      };
    
      ws.onmessage = (event) => {
        const reader = new FileReader();
        reader.onload = () => {
          const data = JSON.parse(reader.result);
          setCurrentPrice(data.trade_price);
    
          const tradePrice = data.trade_price;
          const now = new Date();
          const alignedTime = Math.floor(now.getTime() / 1000 / 60) * 60;
    
          if (!liveCandleRef.current || liveCandleRef.current.time !== alignedTime) {
            if (liveCandleRef.current) {
              dataListRef.current.push(liveCandleRef.current);
              candleSeriesRef.current.setData(dataListRef.current);
            }
    
            liveCandleRef.current = {
              time: alignedTime,
              open: tradePrice,
              high: tradePrice,
              low: tradePrice,
              close: tradePrice,
            };
          } else {
            const candle = liveCandleRef.current;
            candle.high = Math.max(candle.high, tradePrice);
            candle.low = Math.min(candle.low, tradePrice);
            candle.close = tradePrice;
    
            candleSeriesRef.current.update(candle);
          }
        };
        reader.readAsText(event.data);
      };
    
      return () => {
        ws.close();
      };
    }, [market]);
    
  
  //   ws.onmessage = (event) => {
  //     const blob = event.data;
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const text = reader.result;
  //       const data = JSON.parse(text);
  //       setCurrentPrice(data.trade_price); // 실시간 가격 반영
  //     };
  //     reader.readAsText(blob);
  //   };
  
  //   return () => {
  //     ws.close();
  //   };
  // }, [market]);


  // const tokenMap = {
  //   'KRW-BTC': '0x85b8C6d6a4958EB75bdde400876A135d716E7643',  
  // };


  const submitOrder = (type) => {
    const price = Number(inputs[`${type}-price`]);
    const amount = type === 'buy'
      ? Number(inputs['buy-total']) / price
      : Number(inputs['sell-amount']);
    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(amount) || amount <= 0) {
      window.alert('Check the price and quantity.');
      return;
    }

    const account = getDemoAccount();
    const position = account.holdings[market] || { amount: 0, averagePrice: 0 };
    const total = price * amount;
    const fee = total * 0.0005;
    if (type === 'buy') {
      if (total + fee > account.krwBalance) {
        window.alert('Not enough virtual KRW balance.');
        return;
      }
      const nextAmount = position.amount + amount;
      account.krwBalance -= total + fee;
      account.holdings[market] = {
        amount: nextAmount,
        averagePrice: ((position.amount * position.averagePrice) + total) / nextAmount,
      };
    } else {
      if (amount > position.amount + 1e-12) {
        window.alert('You cannot sell more than your holdings.');
        return;
      }
      account.krwBalance += total - fee;
      const remaining = Math.max(0, position.amount - amount);
      if (remaining < 1e-12) delete account.holdings[market];
      else account.holdings[market] = { ...position, amount: remaining };
    }
    account.orders.unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      market, type: type === 'buy' ? 'BUY' : 'SELL', amount, price, total, fee,
      createdAt: new Date().toISOString(),
    });
    saveDemoAccount(account);
    setInputs((previous) => ({ ...previous, [`${type}-amount`]: '', [`${type}-total`]: '' }));
    window.alert(`${type === 'buy' ? 'Buy' : 'Sell'} simulated order completed.`);
  };

  return (
    <Container>
      <ContentWrapper>
        <ChartSection>
          <ChartTitle>이름: {marketName}</ChartTitle>
          <PriceBanner>현재가: {currentPrice?.toLocaleString()} KRW</PriceBanner>
          <Tooltip ref={tooltipRef}>가격: -</Tooltip>
          <ChartContainer ref={chartRef} />
        </ChartSection>
        <OrderSection>
          <Notice>Live prices from Upbit. Simulated trades use virtual KRW, saved in this browser only. Fee: 0.05%. No real assets or blockchain are used.</Notice>
          <Tabs>
            <div className={`tab ${tab === 'buy' ? 'active' : ''}`} onClick={() => setTab('buy')}>매수</div>
            <div className={`tab ${tab === 'sell' ? 'active' : ''}`} onClick={() => setTab('sell')}>매도</div>
          </Tabs>
          {tab === 'buy' && (
                <TabContent>
                  <Label>매수가격 (KRW)</Label>
                  <Input
                    type="text"
                    value={inputs['buy-price']}
                    onChange={(e) => updateInput('buy-price', e.target.value)}
                  />

                  <Label>매수 금액 (KRW)</Label>
                  <Input
                    type="text"
                    value={inputs['buy-total']}
                    onChange={(e) => updateInput('buy-total', e.target.value)} 
                  />

                  <Label>예상 수량 ({market.split('-')[1]})</Label>
                  <Input
                    readOnly
                    value={
                      (() => {
                        const price = parseFloat(inputs['buy-price']);
                        const total = parseFloat(inputs['buy-total']);
                        if (isNaN(price) || isNaN(total) || price <= 0) return '';
                        return (total / price).toFixed(6);
                      })()
                    }
                  />

                  <BuyButton onClick={() => submitOrder('buy')}>
                      <SvgWrapper>
                        <svg height="40" width="150">
                          <rect id="shape" height="40" width="150"></rect>
                        </svg>
                        <div id="text">
                          <span>매수하기</span>
                        </div>
                      </SvgWrapper>
                    </BuyButton>
                </TabContent>
              )}



          {tab === 'sell' && (
            <TabContent>
              <Label>매도가격 (KRW)</Label>
              <Input
                type="text"
                value={inputs['sell-price']}
                onChange={(e) => updateInput('sell-price', e.target.value)}
              />

              <Label>
                수량 ({market})
                <span style={{ fontSize: '12px', color: '#888', marginLeft: '6px' }}>
                  (최대: {tokenBalance} 개)
                </span>
              </Label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                  type="text"
                  value={inputs['sell-amount']}
                  onChange={(e) => updateInput('sell-amount', e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => updateInput('sell-amount', tokenBalance)}
                  style={{
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    backgroundColor: '#eee',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  MAX
                </button>
              </div>

              <Label>총액 (KRW)</Label>
              <Input value={inputs['sell-total']} readOnly />

              <SellButton onClick={() => submitOrder('sell')}>
                  <SvgWrapper>
                    <svg height="40" width="150">
                      <rect id="shape" height="40" width="150"></rect>
                    </svg>
                    <div id="text">
                      <span>매도하기</span>
                    </div>
                  </SvgWrapper>
                </SellButton>
            </TabContent>
          )}

        </OrderSection>
      </ContentWrapper>
    </Container>
  );
};

export default ExchangeDetailPage;
