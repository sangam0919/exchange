import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { getDemoAccount } from '../demoAccount';
import API_BASE_URL from '../api/config';

const Page = styled.main`
  min-height: calc(100vh - 150px);
  padding: 40px 24px 76px;
  background: #f5f7fb;
  color: #172033;
`;
const Content = styled.div`max-width: 1180px; margin: 0 auto;`;
const Heading = styled.div`
  h1 { margin: 0 0 8px; font-size: 30px; letter-spacing: -.04em; }
  p { margin: 0; color: #788496; font-size: 14px; }
`;
const Cards = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 24px 0;
  @media(max-width: 700px) { grid-template-columns: 1fr; }
`;
const Card = styled.div`
  padding: 22px; border: 1px solid #e8edf3; border-radius: 16px; background: white;
  box-shadow: 0 5px 18px rgba(27,39,58,.035);
  span { color: #7b8798; font-size: 12px; font-weight: 700; }
  strong { display: block; margin-top: 8px; font-size: 22px; }
`;
const Section = styled.section`
  margin-top: 16px; padding: 22px; border: 1px solid #e8edf3; border-radius: 16px;
  background: white; box-shadow: 0 8px 28px rgba(27,39,58,.04);
  h2 { margin: 0 0 16px; font-size: 18px; }
`;
const TableWrap = styled.div`overflow-x: auto;`;
const Table = styled.table`
  width: 100%; min-width: 640px; border-collapse: collapse;
  th, td { padding: 13px 10px; border-bottom: 1px solid #edf0f5; text-align: right; font-size: 13px; }
  th:first-child, td:first-child { text-align: left; }
  th { color: #8490a1; background: #fafbfd; font-size: 11px; }
  tbody tr:last-child td { border-bottom: 0; }
  a { color: #187e6c; text-decoration: none; font-weight: 700; }
`;
const Empty = styled.div`
  padding: 28px 12px; color: #8490a1; text-align: center; font-size: 14px;
  a { color: #187e6c; font-weight: 700; }
`;
const Reset = styled.button`
  margin-top: 18px; padding: 10px 14px; border: 1px solid #e0e6ee; border-radius: 9px;
  background: #fff; color: #68778a; font-size: 12px; font-weight: 700; cursor: pointer;
  &:hover { border-color: #c2cbd7; }
`;
const money = (value) => `${Math.round(Number(value) || 0).toLocaleString('ko-KR')}원`;
const quantity = (value) => Number(value || 0).toLocaleString('ko-KR', { maximumFractionDigits: 8 });

export default function MyPage() {
  const [account, setAccount] = useState(() => getDemoAccount());
  const [names, setNames] = useState({});
  const [prices, setPrices] = useState({});
  const [quoteStatus, setQuoteStatus] = useState('loading');

  useEffect(() => {
    const sync = () => setAccount(getDemoAccount());
    window.addEventListener('storage', sync);
    window.addEventListener('sa-demo-account-updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('sa-demo-account-updated', sync);
    };
  }, []);

  const markets = useMemo(() => Object.keys(account.holdings || {}), [account]);

  useEffect(() => {
    let active = true;
    const loadQuotes = async () => {
      try {
        const [tickerResponse, marketResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/main/api/upbit/tickers`),
          fetch('https://api.upbit.com/v1/market/all?isDetails=true'),
        ]);
        if (!tickerResponse.ok || !marketResponse.ok) throw new Error('시세를 불러오지 못했습니다.');
        const [tickers, marketList] = await Promise.all([tickerResponse.json(), marketResponse.json()]);
        if (!active) return;
        setPrices(Object.fromEntries(tickers.map((ticker) => [ticker.market, ticker.trade_price])));
        setNames(Object.fromEntries(marketList.map((item) => [item.market, item.korean_name])));
        setQuoteStatus('ready');
      } catch (error) {
        console.warn('포트폴리오 시세를 불러오지 못했습니다:', error);
        if (active) setQuoteStatus('error');
      }
    };

    loadQuotes();
    const timer = setInterval(loadQuotes, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const assets = markets.map((market) => {
    const position = account.holdings[market];
    const price = Number(prices[market] || 0);
    return {
      market,
      position,
      price,
      value: price * position.amount,
      pnl: (price - position.averagePrice) * position.amount,
      returnRate: position.averagePrice > 0
        ? ((price - position.averagePrice) / position.averagePrice) * 100
        : 0,
    };
  });
  const totalValue = account.krwBalance + assets.reduce((sum, item) => sum + item.value, 0);

  const resetAccount = () => {
    if (!window.confirm('이 브라우저의 모의 잔고와 거래 내역을 초기화할까요?')) return;
    localStorage.removeItem('sa-exchange-paper-account-v1');
    window.dispatchEvent(new Event('sa-demo-account-updated'));
    setAccount(getDemoAccount());
  };

  return (
    <Page>
      <Content>
        <Heading>
          <h1>내 포트폴리오</h1>
          <p>이 브라우저에 저장된 모의 잔고와 보유 자산, 거래 내역입니다.</p>
        </Heading>

        <Cards>
          <Card><span>주문 가능 금액</span><strong>{money(account.krwBalance)}</strong></Card>
          <Card><span>총 평가 금액</span><strong>{quoteStatus === 'ready' || markets.length === 0 ? money(totalValue) : quoteStatus === 'error' ? '시세 연결 실패' : '시세 확인 중'}</strong></Card>
          <Card><span>보유 코인</span><strong>{markets.length}개</strong></Card>
        </Cards>

        <Section>
          <h2>보유 자산</h2>
          {assets.length === 0 ? (
            <Empty>아직 보유한 코인이 없어요. <Link to="/">마켓에서 모의 매수를 시작해보세요.</Link></Empty>
          ) : (
            <TableWrap>
              <Table>
                <thead><tr><th>자산</th><th>보유 수량</th><th>평균 매수가</th><th>현재가</th><th>평가 금액</th><th>평가 손익</th><th>수익률</th></tr></thead>
                <tbody>{assets.map(({ market, position, price, value, pnl, returnRate }) => (
                  <tr key={market}>
                    <td><Link to={`/exchange/${market}`}>{names[market] || market} ({market.replace('KRW-', '')})</Link></td>
                    <td>{quantity(position.amount)}</td>
                    <td>{money(position.averagePrice)}</td>
                    <td>{price ? money(price) : quoteStatus === 'loading' ? '불러오는 중' : '시세 없음'}</td>
                    <td>{price ? money(value) : '—'}</td>
                    <td style={{ color: price ? (pnl >= 0 ? '#16836d' : '#db5261') : '#8490a1' }}>{price ? `${pnl > 0 ? '+' : ''}${money(pnl)}` : '—'}</td>
                    <td style={{ color: price ? (returnRate >= 0 ? '#16836d' : '#db5261') : '#8490a1', fontWeight: 700 }}>
                      {price ? `${returnRate > 0 ? '+' : ''}${returnRate.toFixed(2)}%` : '—'}
                    </td>
                  </tr>
                ))}</tbody>
              </Table>
            </TableWrap>
          )}
        </Section>

        <Section>
          <h2>거래 내역</h2>
          {account.orders.length === 0 ? (
            <Empty>아직 거래 내역이 없어요. 코인을 매수하거나 매도하면 여기에 표시됩니다.</Empty>
          ) : (
            <TableWrap>
              <Table>
                <thead><tr><th>주문 시각</th><th>자산</th><th>구분</th><th>수량</th><th>주문 가격</th><th>거래 금액</th><th>수수료</th></tr></thead>
                <tbody>{account.orders.map((order) => (
                  <tr key={order.id}>
                    <td>{new Date(order.createdAt).toLocaleString('ko-KR')}</td>
                    <td>{names[order.market] || order.market}</td>
                    <td style={{ color: order.type === 'BUY' ? '#16836d' : '#db5261' }}>{order.type === 'BUY' ? '매수' : '매도'}</td>
                    <td>{quantity(order.amount)}</td>
                    <td>{money(order.price)}</td>
                    <td>{money(order.total)}</td>
                    <td>{money(order.fee)}</td>
                  </tr>
                ))}</tbody>
              </Table>
            </TableWrap>
          )}
        </Section>

        <Reset type="button" onClick={resetAccount}>모의 계정 초기화</Reset>
      </Content>
    </Page>
  );
}
