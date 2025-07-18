import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import getContracts from '../web3/getcontracts';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

// 애니메이션
const blinkUp = keyframes`
  0% { background-color: #d4f8e8; }
  100% { background-color: transparent; }
`;

const blinkDown = keyframes`
  0% { background-color: #ffe0e0; }
  100% { background-color: transparent; }
`;

const PriceCell = styled.td`
  animation: ${({ direction }) =>
    direction === 'up'
      ? blinkUp
      : direction === 'down'
      ? blinkDown
      : 'none'} 0.5s ease-in-out;
  transition: background-color 0.3s;
`;

// 레이아웃
const Container = styled.div`
  max-width: 900px;
  margin: 60px auto;
  padding: 30px;
  background: #f8f9fb;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
  text-align: center;
`;

const Info = styled.p`
  font-size: 14px;
  text-align: center;
  color: #555;
`;

const Summary = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 30px 0;
`;

const SummaryBox = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  text-align: center;
`;

const Label = styled.div`
  font-size: 14px;
  color: #777;
  margin-bottom: 6px;
`;

const Value = styled.div`
  font-size: 20px;
  font-weight: bold;
`;

const Section = styled.section`
  margin-top: 10px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 10px;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    text-align: left;
  }

  th {
    background: #f3f5f8;
    color: #444;
  }
`;

const MyPage = () => {
  const [account, setAccount] = useState('');
  const [orders, setOrders] = useState([]);
  const [currentPrices, setCurrentPrices] = useState({});
  const [prevPrices, setPrevPrices] = useState({});
  const [totalAsset, setTotalAsset] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [krwBalance, setKrwBalance] = useState(0);
  const navigate = useNavigate();

  const symbolMap = JSON.parse(localStorage.getItem('symbolToKoreanMap') || '[]');

  const getKoreanName = (symbol) => {
    if (!Array.isArray(symbolMap)) return symbol;
    const cleanSymbol = symbol?.trim().toUpperCase();
    const match = symbolMap.find((m) => m.market.toUpperCase() === cleanSymbol);
    return match?.korean_name || symbol;
  };

  const fetchCurrentPrices = async (symbols) => {
    try {
      const markets = symbols.join(',');
      const res = await fetch(`https://api.upbit.com/v1/ticker?markets=${markets}`);
      const data = await res.json();
      const prices = {};
      data.forEach((item) => {
        prices[item.market] = item.trade_price;
      });
      setCurrentPrices((prev) => ({ ...prev, ...prices }));
    } catch (e) {
      console.error('현재가 불러오기 실패:', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const user = accounts[0];
          setAccount(user);

          try {
            const { exchangeContract, krwContract } = getContracts();
            const rawOrders = await exchangeContract.getMyOrders(user);

            const formatted = rawOrders.map((o) => ({
              symbol: o.symbol,
              amount: Number(ethers.utils.formatUnits(o.amount, 18)).toFixed(6),
              price: Number(ethers.utils.formatUnits(o.price, 18)).toFixed(2),
              type: o.orderType === 0 ? '매수' : '매도',
              date: new Date(Number(o.timestamp) * 1000).toISOString().split('T')[0]
            }));

            setOrders(formatted);

            // KRW 잔액 불러오기
            const balance = await krwContract.balanceOf(user);
            const krw = Number(ethers.utils.formatUnits(balance, 18)).toFixed(2);
            setKrwBalance(krw);

            const symbols = [...new Set(formatted.map(o => o.symbol))];
            fetchCurrentPrices(symbols);
          } catch (err) {
            console.error('데이터 로드 실패:', err);
          }
        }
      }
    };

    init();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const symbols = [...new Set(orders.map((o) => o.symbol))];
      if (symbols.length > 0) {
        setPrevPrices(currentPrices);
        fetchCurrentPrices(symbols);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [orders, currentPrices]);

  const enrichedOrders = orders.map((o) => {
    const now = currentPrices[o.symbol] || 0;
    const prev = prevPrices[o.symbol] || now;
    const direction = now > prev ? 'up' : now < prev ? 'down' : null;

    const price = Number(o.price);
    const amount = Number(o.amount);
    const profit = ((now - price) * amount).toFixed(2);
    const rate = ((now - price) / price * 100).toFixed(2);

    return {
      ...o,
      currentPrice: now.toLocaleString(),
      profit,
      rate,
      direction
    };
  });

  useEffect(() => {
    let totalCoinValue = 0;
    let totalProfitKRW = 0;

    enrichedOrders.forEach((o) => {
      totalCoinValue += Number(o.currentPrice.replace(/,/g, '')) * Number(o.amount);
      totalProfitKRW += Number(o.profit);
    });

    setTotalAsset((Number(krwBalance) + totalCoinValue).toFixed(2));
    setTotalProfit(totalProfitKRW.toFixed(2));
  }, [enrichedOrders, krwBalance]);

  return (
    <Container>
      <Title>마이페이지(매수만 가능하고 매도는 못합니다)</Title>
      <Info>지갑 주소: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '연결 안됨'}</Info>

      <Summary>
        <SummaryBox>
          <Label>보유 KRW</Label>
          <Value>{Number(krwBalance).toLocaleString()} 원</Value>
        </SummaryBox>
        <SummaryBox>
          <Label>총 자산</Label>
          <Value>{Number(totalAsset).toFixed(0).toLocaleString()} 원</Value>
        </SummaryBox>
        <SummaryBox>
          <Label>총 수익</Label>
          <Value style={{ color: totalProfit >= 0 ? 'red' : 'blue' }}>
            {Number(totalProfit).toFixed(0).toLocaleString()} 원
          </Value>
        </SummaryBox>
      </Summary>

      <Section>
        <SectionTitle>보유 코인 거래 내역</SectionTitle>
        {orders.length === 0 ? (
          <p>거래 내역이 없습니다.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>코인</th>
                <th>거래 종류</th>
                <th>수량</th>
                <th>매수가</th>
                <th>현재가</th>
                <th>수익률</th>
                <th>수익 (KRW)</th>
              </tr>
            </thead>
            <tbody>
              {enrichedOrders.map((o, i) => (
                <tr key={i}>
                  <td>{o.date}</td>
                  <td
                    // style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                    onClick={() => navigate(`/exchange/${o.symbol}`)}
                  >
                    {getKoreanName(o.symbol)}
                  </td>
                  <td>{o.type}</td>
                  <td>{o.amount}</td>
                  <td>{Number(o.price).toLocaleString()}</td>
                  <PriceCell direction={o.direction}>{o.currentPrice}</PriceCell>
                  <td style={{ color: o.rate >= 0 ? 'red' : 'blue' }}>{o.rate}%</td>
                  <td style={{ color: o.profit >= 0 ? 'red' : 'blue' }}>{Number(o.profit).toLocaleString()} 원</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    </Container>
  );
};

export default MyPage;
