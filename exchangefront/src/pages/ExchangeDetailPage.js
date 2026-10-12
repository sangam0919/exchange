import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { createChart } from 'lightweight-charts';
import { CheckCircle2, X } from 'lucide-react';
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
    border: 0;
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
const Feedback = styled.div`
  margin: 0 0 16px;
  padding: 11px 13px;
  border-radius: 9px;
  color: ${({ $success }) => ($success ? '#187e6c' : '#a9434b')};
  background: ${({ $success }) => ($success ? '#edf8f5' : '#fff0f1')};
  font-size: 12px;
  line-height: 1.6;
`;
const OrderSummary = styled.div`
  display: grid;
  gap: 9px;
  margin-top: 2px;
  padding: 13px 14px;
  border: 1px solid #edf0f5;
  border-radius: 10px;
  background: #fafbfd;
  div { display: flex; justify-content: space-between; gap: 12px; color: #758195; font-size: 12px; }
  strong { color: #273246; font-size: 12px; text-align: right; }
`;
const HoldingNotice = styled.div`
  padding: 12px;
  border-radius: 9px;
  background: #fff7e8;
  color: #8b6525;
  font-size: 12px;
  line-height: 1.6;
`;
const ModalBackdrop = styled.div`
  position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center;
  padding: 20px; background: rgba(17, 25, 39, .58); backdrop-filter: blur(4px);
`;
const Modal = styled.div`
  width: min(100%, 440px); padding: 25px; border: 1px solid #e8edf3; border-radius: 20px;
  background: #fff; box-shadow: 0 24px 80px rgba(15, 23, 42, .25);
`;
const ModalTop = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  h2 { margin: 0; color: #172033; font-size: 21px; letter-spacing: -.04em; }
  p { margin: 7px 0 0; color: #778397; font-size: 12px; line-height: 1.6; }
  button { display: grid; place-items: center; width: 32px; height: 32px; flex: 0 0 auto; border: 0; border-radius: 9px; background: #f2f4f7; color: #667386; cursor: pointer; }
`;
const ModalCoin = styled.div`
  display: flex; align-items: center; justify-content: space-between; margin: 22px 0 14px;
  padding: 16px; border-radius: 13px; background: #f6f8fb;
  strong { color: ${({ $sell }) => ($sell ? '#d94f5d' : '#16836d')}; font-size: 18px; }
  span { color: #68768a; font-size: 12px; }
`;
const ModalRows = styled.div`
  display: grid; gap: 11px; padding: 2px 2px 18px;
  div { display: flex; justify-content: space-between; gap: 14px; color: #778397; font-size: 12px; }
  strong { color: #273246; text-align: right; }
`;
const ModalNote = styled.div`
  margin-bottom: 18px; padding: 11px 12px; border-radius: 10px;
  background: #fff7e8; color: #8b6525; font-size: 11px; line-height: 1.6;
`;
const ModalActions = styled.div`
  display: flex; gap: 9px;
  button { flex: 1; min-height: 44px; border: 0; border-radius: 11px; font-size: 13px; font-weight: 800; cursor: pointer; }
  .cancel { background: #f0f2f5; color: #586579; }
  .confirm { background: ${({ $sell }) => ($sell ? '#dc5964' : '#17856c')}; color: #fff; }
`;
const SuccessIcon = styled.div`
  display: grid; place-items: center; width: 54px; height: 54px; margin: 0 auto 16px;
  border-radius: 50%; background: #e8f8f3; color: #16836d;
`;
const formatKrw = (value) => `${Number(value || 0).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원`;
const formatCoin = (value) => Number(value || 0).toLocaleString('ko-KR', { maximumFractionDigits: 8 });


const ExchangeDetailPage = () => {
  const { market } = useParams();
  const chartRef = useRef(null);
  const tooltipRef = useRef(null);
  const chartInstance = useRef(null);
  const candleSeriesRef = useRef(null);
  const [marketName, setMarketName] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [quoteError, setQuoteError] = useState('');
  const [orderMessage, setOrderMessage] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

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

    if (key === 'buy-price') {
      setInputs((prev) => ({ ...prev, [key]: value }));
      setOrderMessage(null);
      return;
    }
  
    if (key === 'buy-total' || key === 'sell-total') {
      setInputs((prev) => ({
        ...prev,
        [key]: value
      }));
      setOrderMessage(null);
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
    setOrderMessage(null);
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
      try {
        const res = await fetch(`https://api.upbit.com/v1/ticker?markets=${market}`);
        if (!res.ok) throw new Error('시세를 가져오지 못했습니다.');
        const [data] = await res.json();
        if (!data || !Number.isFinite(Number(data.trade_price))) throw new Error('시세 데이터가 올바르지 않습니다.');
        setCurrentPrice(data.trade_price);
        setQuoteError('');
      } catch (error) {
        console.error('시세 조회 실패:', error);
        setQuoteError('실시간 시세를 불러오지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.');
      }
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
      setOrderMessage({ success: false, text: '가격과 수량을 0보다 큰 숫자로 입력해 주세요.' });
      return;
    }

    const total = price * amount;
    const fee = total * 0.0005;
    const account = getDemoAccount();
    const position = account.holdings[market] || { amount: 0, averagePrice: 0 };
    if (type === 'buy') {
      if (total + fee > account.krwBalance) {
        setOrderMessage({ success: false, text: '가상 잔고가 부족해요. 주문 금액과 수수료를 확인해 주세요.' });
        return;
      }
    } else {
      if (amount > position.amount + 1e-12) {
        setOrderMessage({ success: false, text: '보유 수량보다 많이 매도할 수 없어요.' });
        return;
      }
    }

    setOrderMessage(null);
    setPendingOrder({ type, market, name: marketName || market, price, amount, total, fee });
  };

  const confirmOrder = () => {
    if (!pendingOrder) return;
    const { type, price, amount, total, fee } = pendingOrder;
    const account = getDemoAccount();
    const position = account.holdings[market] || { amount: 0, averagePrice: 0 };
    if (type === 'buy') {
      if (total + fee > account.krwBalance) {
        setPendingOrder(null);
        setOrderMessage({ success: false, text: '잔고가 변경되어 주문할 수 없어요. 주문 내용을 다시 확인해 주세요.' });
        return;
      }
      const nextAmount = position.amount + amount;
      account.krwBalance -= total + fee;
      account.holdings[market] = {
        amount: nextAmount,
        averagePrice: ((position.amount * position.averagePrice) + total + fee) / nextAmount,
      };
    } else {
      if (amount > position.amount + 1e-12) {
        setPendingOrder(null);
        setOrderMessage({ success: false, text: '보유 수량이 변경되어 주문할 수 없어요. 주문 내용을 다시 확인해 주세요.' });
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
    setOrderMessage(null);
    setCompletedOrder({ ...pendingOrder, balance: account.krwBalance });
    setPendingOrder(null);
  };

  const previewPrice = Number(inputs[`${tab}-price`]);
  const previewAmount = tab === 'buy'
    ? Number(inputs['buy-total']) / previewPrice
    : Number(inputs['sell-amount']);
  const previewTotal = previewPrice * previewAmount;
  const previewFee = previewTotal * 0.0005;
  const previewIsValid = Number.isFinite(previewTotal) && previewTotal > 0 && Number.isFinite(previewFee);

  return (
    <Container>
      <ContentWrapper>
        <ChartSection>
          <ChartTitle>{marketName || market}</ChartTitle>
          <PriceBanner>{currentPrice ? `${currentPrice.toLocaleString('ko-KR')}원` : '시세 확인 중'}</PriceBanner>
          {quoteError && <Feedback role="status">{quoteError}</Feedback>}
          <Tooltip ref={tooltipRef}>가격: -</Tooltip>
          <ChartContainer ref={chartRef} />
        </ChartSection>
        <OrderSection>
          <Notice>업비트 공개 시세를 참고하는 모의 거래입니다. 입력한 가격으로 즉시 체결되고 수수료 0.05%가 적용돼요. 가상 잔고와 내역은 이 브라우저에 저장되며 실제 자산이나 블록체인은 사용하지 않습니다.</Notice>
          {orderMessage && <Feedback role="status" aria-live="polite" $success={orderMessage.success}>{orderMessage.text}</Feedback>}
          <Tabs>
            <button type="button" className={`tab ${tab === 'buy' ? 'active' : ''}`} aria-pressed={tab === 'buy'} onClick={() => setTab('buy')}>매수</button>
            <button type="button" className={`tab ${tab === 'sell' ? 'active' : ''}`} aria-pressed={tab === 'sell'} onClick={() => setTab('sell')}>매도</button>
          </Tabs>
          {tab === 'buy' && (
                <TabContent>
                    <Label>매수 가격 (KRW)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    value={inputs['buy-price']}
                    onChange={(e) => updateInput('buy-price', e.target.value)}
                  />

                  <Label>매수 금액 (KRW, 수수료 별도)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    value={inputs['buy-total']}
                    onChange={(e) => updateInput('buy-total', e.target.value)} 
                  />

                  <OrderSummary aria-live="polite">
                    <div><span>예상 수수료</span><strong>{previewIsValid ? `${previewFee.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원` : '—'}</strong></div>
                    <div><span>총 차감 금액</span><strong>{previewIsValid ? `${(previewTotal + previewFee).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원` : '—'}</strong></div>
                    <div><span>주문 후 예상 잔고</span><strong>{previewIsValid ? `${(getDemoAccount().krwBalance - previewTotal - previewFee).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원` : `${getDemoAccount().krwBalance.toLocaleString('ko-KR')}원`}</strong></div>
                  </OrderSummary>

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
              {Number(tokenBalance) <= 0 && <HoldingNotice>매도할 보유 코인이 없어요. 먼저 매수하면 여기서 매도할 수 있습니다.</HoldingNotice>}
              <Label>매도 가격 (KRW)</Label>
              <Input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={inputs['sell-price']}
                onChange={(e) => updateInput('sell-price', e.target.value)}
              />

              <Label>
                보유 수량 ({market.split('-')[1]})
                <span style={{ fontSize: '12px', color: '#888', marginLeft: '6px' }}>
                  (최대 {Number(tokenBalance).toLocaleString('ko-KR', { maximumFractionDigits: 8 })})
                </span>
              </Label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={inputs['sell-amount']}
                  onChange={(e) => updateInput('sell-amount', e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => updateInput('sell-amount', tokenBalance)}
                  disabled={Number(tokenBalance) <= 0}
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
                  전량
                </button>
              </div>

              <Label>총액 (KRW)</Label>
              <Input value={inputs['sell-total']} readOnly />

              <OrderSummary aria-live="polite">
                <div><span>예상 수수료</span><strong>{previewIsValid ? `${previewFee.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원` : '—'}</strong></div>
                <div><span>매도 후 예상 입금액</span><strong>{previewIsValid ? `${(previewTotal - previewFee).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원` : '—'}</strong></div>
                <div><span>매도 가능 수량</span><strong>{Number(tokenBalance).toLocaleString('ko-KR', { maximumFractionDigits: 8 })}</strong></div>
              </OrderSummary>

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

      {pendingOrder && (
        <ModalBackdrop onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingOrder(null); }}>
          <Modal role="dialog" aria-modal="true" aria-labelledby="order-confirm-title">
            <ModalTop>
              <div>
                <h2 id="order-confirm-title">주문 내용을 확인해 주세요</h2>
                <p>확정하면 모의 계정 잔고와 거래 내역에 반영됩니다.</p>
              </div>
              <button type="button" aria-label="주문 확인 닫기" onClick={() => setPendingOrder(null)}><X size={17} /></button>
            </ModalTop>
            <ModalCoin $sell={pendingOrder.type === 'sell'}>
              <strong>{pendingOrder.name} ({pendingOrder.market.split('-')[1]})</strong>
              <span>{pendingOrder.type === 'buy' ? '매수 주문' : '매도 주문'}</span>
            </ModalCoin>
            <ModalRows>
              <div><span>주문 가격</span><strong>{formatKrw(pendingOrder.price)}</strong></div>
              <div><span>주문 수량</span><strong>{formatCoin(pendingOrder.amount)} {pendingOrder.market.split('-')[1]}</strong></div>
              <div><span>거래 금액</span><strong>{formatKrw(pendingOrder.total)}</strong></div>
              <div><span>예상 수수료 (0.05%)</span><strong>{formatKrw(pendingOrder.fee)}</strong></div>
              <div>
                <span>{pendingOrder.type === 'buy' ? '총 차감 금액' : '예상 입금액'}</span>
                <strong>{formatKrw(pendingOrder.type === 'buy' ? pendingOrder.total + pendingOrder.fee : pendingOrder.total - pendingOrder.fee)}</strong>
              </div>
            </ModalRows>
            <ModalNote>입력한 가격 기준으로 체결되는 모의 거래입니다. 주문을 확정하기 전에 코인, 수량, 금액을 확인해 주세요.</ModalNote>
            <ModalActions $sell={pendingOrder.type === 'sell'}>
              <button type="button" className="cancel" onClick={() => setPendingOrder(null)}>취소</button>
              <button type="button" className="confirm" onClick={confirmOrder}>{pendingOrder.type === 'buy' ? '매수 확정' : '매도 확정'}</button>
            </ModalActions>
          </Modal>
        </ModalBackdrop>
      )}

      {completedOrder && (
        <ModalBackdrop onMouseDown={(event) => { if (event.target === event.currentTarget) setCompletedOrder(null); }}>
          <Modal role="dialog" aria-modal="true" aria-labelledby="order-complete-title">
            <SuccessIcon><CheckCircle2 size={29} /></SuccessIcon>
            <ModalTop style={{ display: 'block', textAlign: 'center' }}>
              <h2 id="order-complete-title">{completedOrder.name} {completedOrder.type === 'buy' ? '매수' : '매도'} 완료</h2>
              <p>{completedOrder.market} 모의 주문이 체결되어 잔고와 거래 내역에 반영됐어요.</p>
            </ModalTop>
            <ModalCoin $sell={completedOrder.type === 'sell'}>
              <strong>{completedOrder.type === 'buy' ? '구매하였습니다' : '판매하였습니다'}</strong>
              <span>{formatCoin(completedOrder.amount)} {completedOrder.market.split('-')[1]}</span>
            </ModalCoin>
            <ModalRows>
              <div><span>체결 가격</span><strong>{formatKrw(completedOrder.price)}</strong></div>
              <div><span>거래 금액</span><strong>{formatKrw(completedOrder.total)}</strong></div>
              <div><span>수수료</span><strong>{formatKrw(completedOrder.fee)}</strong></div>
              <div><span>주문 가능 금액</span><strong>{formatKrw(completedOrder.balance)}</strong></div>
            </ModalRows>
            <ModalActions $sell={completedOrder.type === 'sell'}>
              <button type="button" className="confirm" onClick={() => setCompletedOrder(null)}>확인</button>
            </ModalActions>
          </Modal>
        </ModalBackdrop>
      )}
    </Container>
  );
};

export default ExchangeDetailPage;
