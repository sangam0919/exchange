import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { createChart } from 'lightweight-charts';
import {ethers} from "ethers";
import getContracts  from "../web3/getcontracts";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 40px 20px;
  background-color: #f9fafb;
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  width: 100%;
  max-width: 1200px;

  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const ChartSection = styled.section`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const OrderSection = styled.section`
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const ChartTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 10px;
`;

const Tooltip = styled.div`
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ccc;

  .tab {
    flex: 1;
    text-align: center;
    font-weight: bold;
    padding: 14px 0;
    cursor: pointer;
    background: #f4f6f8;
    transition: 0.2s ease;

    &:hover {
      background: #e8ebef;
    }
  }

  .tab.active {
    background: #ffffff;
    border-bottom: 3px solid #0984e3;
    color: #0984e3;
  }
`;

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #444;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
`;

const Button = styled.button`
  margin-top: 20px;
  padding: 0; /* padding 제거 */
  background-color: transparent; /* 배경 투명 */
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: inline-block;
`;

const BuyButton = styled(Button)`
  svg #shape {
    stroke: #2ecc71;
  }

  &:hover svg #shape {
    stroke: #27ae60;
  }

  #text a {
    color: #2ecc71;
  }
`;

const SellButton = styled(Button)`
  svg #shape {
    stroke: #e74c3c;
  }

  &:hover svg #shape {
    stroke: #c0392b;
  }

  #text a {
    color: #e74c3c;
  }
`;


const PriceBanner = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
`;

const SvgWrapper = styled.div`
  position: relative;
  width: 150px;
  height: 40px;
  display: inline-block;
  border-radius: 6px;

  #shape {
    stroke-width: 6px;
    fill: transparent;
    stroke-dasharray: 85 400;
    stroke-dashoffset: -220;
    transition: 1s all ease;
  }

  #text {
    margin-top: -35px;
    text-align: center;
  }

  #text a {
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

const ConnectButton = styled.button`
  margin-top: 20px;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: bold;
  background-color: #34495e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background-color: #2c3e50;
  }
`;


const ExchangeDetailPage = () => {
  const { market } = useParams();
  const chartRef = useRef(null);
  const tooltipRef = useRef(null);
  const chartInstance = useRef(null);
  const candleSeriesRef = useRef(null);
  const [marketName, setMarketName] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [account, setAccount] = useState(null);
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

  const [btcBalance, setBtcBalance] = useState('0');



  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        // const user = accounts[0];
        // setAccount(user);
        // 잔고도 여기서 설정 가능
        // const { btcContract } = getContracts();
        // const balance = await btcContract.balanceOf(user);
        // setBtcBalance(Number(ethers.utils.formatUnits(balance, 18)).toFixed(6));
      // const { btcContract } = getContracts();
      // const balance = await btcContract.balanceOf(accounts[0]);
      // setBtcBalance(ethers.utils.formatUnits(balance, 18));
      } catch (err) {
        alert('지갑 연결 실패');
      }
    } else {
      alert('메타마스크를 설치해주세요.');
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          // const user = accounts[0];
          // setAccount(user);

        // const { exchangeContract } = getContracts();
        // const balance = await exchangeContract.getMyBalance(user, market); 
        // setTokenBalance(Number(ethers.utils.formatUnits(balance, 18)).toFixed(6));
          
          // const { btcContract } = getContracts();
          // const balance = await btcContract.balanceOf(user);
          // setBtcBalance(ethers.utils.formatUnits(balance, 18));
        }
      }
    };
    checkWalletConnection();
  }, [market]);

  const updateInput = (key, value) => {
    const type = key.split('-')[0];
  
    if (key === 'buy-total' || key === 'sell-total') {
      setInputs((prev) => ({
        ...prev,
        [key]: value
      }));
      return;
    }
  
    const other = key.includes('price') ? 'amount' : 'price';
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
  // useEffect(() => {
  //   const fetchPrice = async () => {
  //     const res = await fetch(`https://api.upbit.com/v1/ticker?markets=${market}`);
  //     const [data] = await res.json();
  //     setCurrentPrice(data.trade_price); // ← 이 줄을 고쳐야 함!
  //   };
  //   fetchPrice();
  //   const interval = setInterval(fetchPrice, 3000);
  //   return () => clearInterval(interval);
  // }, [market]);

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

  // useEffect(() => {
  //   if (!candleSeriesRef.current) return;

  //   const updatePrice = async () => {
  //     const res = await fetch(`https://api.upbit.com/v1/ticker?markets=${market}`);
  //     const [data] = await res.json();

  //     const now = new Date();
  //     const alignedTime = Math.floor(now.getTime() / 1000 / 60) * 60;

  //     if (!liveCandleRef.current || liveCandleRef.current.time !== alignedTime) {
  //       if (liveCandleRef.current) {
  //         dataListRef.current.push(liveCandleRef.current);
  //         candleSeriesRef.current.setData(dataListRef.current);
  //       }

  //       liveCandleRef.current = {
  //         time: alignedTime,
  //         open: data.trade_price,
  //         high: data.trade_price,
  //         low: data.trade_price,
  //         close: data.trade_price,
  //       };
  //     } else {
  //       const candle = liveCandleRef.current;
  //       candle.high = Math.max(candle.high, data.trade_price);
  //       candle.low = Math.min(candle.low, data.trade_price);
  //       candle.close = data.trade_price;

  //       candleSeriesRef.current.update(candle);
  //     }
  //   };

  //   const interval = setInterval(updatePrice, 5000);
  //   return () => clearInterval(interval);
  // }, [market]);

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


  const submitOrder = async (type) => {
    const rawPrice = inputs[`${type}-price`];
    const rawTotal = inputs[`${type}-total`];
  
    if (!rawPrice || isNaN(rawPrice) || !rawTotal || isNaN(rawTotal)) {
      alert('가격과 금액을 정확히 입력하세요.');
      return;
    }
  
    try {
      const { exchangeContract, krwContract, btcContract, cbkContract, etcContract } = getContracts();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
  
      if (!exchangeContract || !krwContract) {
        alert('컨트랙트 연결이 안됐습니다.');
        return;
      }
  
      // const market = symbol; // ← 상위에서 symbol 변수 받아와야 함
  
      const tokenMap = {
        "KRW-BTC": btcContract,
        "KRW-CBK": cbkContract,
        "KRW-ETC": etcContract,
      };
      const tokenContract = tokenMap[market];
  
      if (!tokenContract) {
        alert(`해당 마켓(${market})에 대한 토큰 컨트랙트가 없습니다.`);
        return;
      }
  
      if (type === 'buy') {
        const price = ethers.utils.parseUnits(rawPrice, 18);
        const scale = ethers.utils.parseUnits("1", 18);
  
        const targetKRW = ethers.utils.parseUnits(rawTotal, 18);
        const amount = targetKRW.mul(scale).div(price);
        const usedKRW = amount.mul(price).div(scale);
  
        const userKRW = await krwContract.balanceOf(account);
        const krwAllowance = await krwContract.allowance(account, exchangeContract.address);
  
        if (usedKRW.gt(userKRW)) {
          alert("잔고 부족: 보유한 KRW보다 많습니다.");
          return;
        }
  
        if (krwAllowance.lt(usedKRW)) {
          const approveTx = await krwContract.approve(exchangeContract.address, usedKRW);
          await approveTx.wait();
        }
  
        const tx = await exchangeContract.buyToken(amount, price, market);
        await tx.wait();
        alert("매수 성공!");
      } else {
        const rawAmount = inputs[`${type}-amount`];
        if (!rawAmount || isNaN(rawAmount)) {
          alert('매도 수량을 입력하세요.');
          return;
        }
  
        const sellAmount = ethers.utils.parseUnits(rawAmount, 18);
        const sellPrice = ethers.utils.parseUnits(rawPrice, 18);
        const tokenBalance = await tokenContract.balanceOf(account);
  
        if (sellAmount.gt(tokenBalance)) {
          alert("보유 수량보다 많은 수량을 매도할 수 없습니다.");
          return;
        }
  
        const allowance = await tokenContract.allowance(account, exchangeContract.address);
        if (allowance.lt(sellAmount)) {
          const approveTx = await tokenContract.approve(exchangeContract.address, sellAmount);
          await approveTx.wait();
        }
  
        const tx = await exchangeContract.sellToken(sellAmount, sellPrice, market);
        await tx.wait();
        alert("매도 성공!");
      }
    } catch (err) {
      console.error("🚨 트랜잭션 실패:", err);
      alert(`${type === 'buy' ? '매수' : '매도'} 실패: ` + (err.reason || err.message));
    }
  };
  
  
  

  const sendBTCToExchange = async () => {
    const { btcContract } = getContracts();
    try {
      const tx = await btcContract.transfer(
        "0x93E04744d27CB92065D3d0bb38644b90Cb937F40", // 거래소 주소
        ethers.utils.parseEther("10") // 10000 BTC
      );
      await tx.wait();
      alert("거래소에 BTC 넣기 완료!");
    } catch (err) {
      console.error(err);
      alert("BTC 전송 실패: " + err.message);
    }
  };

  const checkExchangeBTCBalance = async () => {
    try {
      const { btcContract, exchangeContract } = getContracts();
      const balance = await btcContract.balanceOf(exchangeContract.address);
      console.log("💰 Exchange BTC 잔고:", ethers.utils.formatUnits(balance, 18), "BTC");
      alert(`Exchange BTC 잔고: ${ethers.utils.formatUnits(balance, 18)} BTC`);
    } catch (err) {
      console.error("잔고 조회 실패:", err);
      alert("잔고 조회 실패");
    }
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
          <Tabs>
            <div className={`tab ${tab === 'buy' ? 'active' : ''}`} onClick={() => setTab('buy')}>매수</div>
            <div className={`tab ${tab === 'sell' ? 'active' : ''}`} onClick={() => setTab('sell')}>매도</div>
          </Tabs>
          <ConnectButton onClick={sendBTCToExchange}>
  거래소에 BTC 10000개 넣기
</ConnectButton>

<ConnectButton onClick={checkExchangeBTCBalance}>
        거래소 BTC 잔고 확인
      </ConnectButton>

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

                  <Label>예상 수량 (BTC)</Label>
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

                  {account ? (
                    <BuyButton onClick={() => submitOrder('buy')}>
                      <SvgWrapper>
                        <svg height="40" width="150">
                          <rect id="shape" height="40" width="150"></rect>
                        </svg>
                        <div id="text">
                          <a>매수하기</a>
                        </div>
                      </SvgWrapper>
                    </BuyButton>
                  ) : (
                    <ConnectButton onClick={connectWallet}>메타마스크로 로그인하기</ConnectButton>
                  )}
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

              {account ? (
                <SellButton onClick={() => submitOrder('sell')}>
                  <SvgWrapper>
                    <svg height="40" width="150">
                      <rect id="shape" height="40" width="150"></rect>
                    </svg>
                    <div id="text">
                      <a>매도하기</a>
                    </div>
                  </SvgWrapper>
                </SellButton>
              ) : (
                <ConnectButton onClick={connectWallet}>메타마스크로 로그인하기</ConnectButton>
              )}
            </TabContent>
          )}

        </OrderSection>
      </ContentWrapper>
    </Container>
  );
};

export default ExchangeDetailPage;