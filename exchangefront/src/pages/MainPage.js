import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import IntroPopup from '../components/IntroPopup';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  width: 100%;
`;

const ChartList = styled.div`
  width: 1000px;
  max-width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
`;

const ListHeader = styled.ul`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 12px 0;
  font-size: 14px;
  text-align: center;
  background-color: #f0f0f0;
  font-weight: bold;

  li {
    cursor: pointer;
  }
`;

const ListRow = styled.ul`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 12px 0;
  font-size: 14px;
  text-align: center;
  border-bottom: 1px solid #eee;
  cursor: pointer;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 40px 0;
`;

const PageButton = styled.div`
  width: 34px;
  height: 34px;
  line-height: 34px;
  text-align: center;
  border-radius: 50%;
  background-color: ${(props) => (props.active ? '#ff9800' : '#7e57c2')};
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background-color: ${(props) => (props.active ? '#fb8c00' : '#9575cd')};
  }
`;

const NavButton = styled.div`
  padding: 0 20px;
  height: 34px;
  line-height: 34px;
  background-color: #7e57c2;
  color: white;
  border-radius: ${(props) => (props.prev ? '20px 0 0 20px' : '0 20px 20px 0')};
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #9575cd;
  }
`;

const MainPage = () => {
  const [tickers, setTickers] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [page, setPage] = useState(1);
  const [showIntro, setShowIntro] = useState(true);
  const [sortOrders, setSortOrders] = useState({ price: 'desc', changeRate: 'desc' });
  const [sortedKey, setSortedKey] = useState(null);
  const navigate = useNavigate();

  const itemsPerPage = 10;

  useEffect(() => {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    if (showIntro) {
      if (header) header.style.display = 'none';
      if (footer) footer.style.display = 'none';
      document.body.style.overflow = 'hidden';
    } else {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
      document.body.style.overflow = 'auto';
    }

    return () => {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
      document.body.style.overflow = 'auto';
    };
  }, [showIntro]);

  useEffect(() => {
    const fetchMarketData = async () => {
      const res = await fetch('https://api.upbit.com/v1/market/all?isDetails=true');
      const data = await res.json();
      console.log("✅ 업비트 마켓 전체 리스트 (isDetails=true)");
      console.table(data);

      const krwMarkets = data.filter((m) => m.market.startsWith('KRW-'));
      setMarkets(krwMarkets);

      // ✅ symbol → korean_name 매핑을 localStorage에 저장 (한 번만)
      localStorage.setItem('symbolToKoreanMap', JSON.stringify(data));
      console.log("🗺 symbolToKoreanMap 저장 완료!");
    };

    fetchMarketData();
  }, []);

  useEffect(() => {
    const fetchTickers = async () => {
      if (markets.length === 0) return;
      const allMarketCodes = markets.map((m) => m.market).join(',');
      const res = await fetch(`https://api.upbit.com/v1/ticker?markets=${allMarketCodes}`);
      const data = await res.json();

      const combined = data.map((d) => {
        const marketInfo = markets.find((m) => m.market === d.market);
        return { ...d, korean_name: marketInfo?.korean_name || '' };
      });

      setTickers(combined);
    };

    fetchTickers();
    const interval = setInterval(fetchTickers, 5000);
    return () => clearInterval(interval);
  }, [markets]);

  const handleSort = (key) => {
    const nextOrder = sortOrders[key] === 'asc' ? 'desc' : 'asc';
    setSortOrders((prev) => ({ ...prev, [key]: nextOrder }));
    setSortedKey(key);
  };

  const getSortedTickers = () => {
    const sorted = [...tickers];
    if (!sortedKey) return sorted;

    const order = sortOrders[sortedKey];
    sorted.sort((a, b) => {
      const aVal = sortedKey === 'price' ? a.trade_price : a.signed_change_rate;
      const bVal = sortedKey === 'price' ? b.trade_price : b.signed_change_rate;
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  };

  const sortedTickers = getSortedTickers();
  const totalPages = Math.ceil(sortedTickers.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = sortedTickers.slice(start, end);

  const pagesPerBlock = 10;
  const currentBlock = Math.floor((page - 1) / pagesPerBlock);
  const startPage = currentBlock * pagesPerBlock + 1;
  const endPage = Math.min(startPage + pagesPerBlock - 1, totalPages);

  const handlePrev = () => {
    if (startPage > 1) setPage(startPage - 1);
  };

  const handleNext = () => {
    if (endPage < totalPages) setPage(endPage + 1);
  };

  if (showIntro) return <IntroPopup onClose={() => setShowIntro(false)} />;

  return (
    <>
      <Wrapper>
        <ChartList>
          <ListHeader>
            <li>한글명</li>
            <li onClick={() => handleSort('price')}>
              현재가 {sortOrders.price === 'asc' ? '▲' : '▼'}
            </li>
            <li onClick={() => handleSort('changeRate')}>
              전일 대비 {sortOrders.changeRate === 'asc' ? '▲' : '▼'}
            </li>
            <li>거래대금</li>
          </ListHeader>

          {pageData.map((ticker) => {
            const isPositive = ticker.signed_change_rate < 0 ? 'blue' : 'red';
            return (
              <ListRow key={ticker.market} onClick={() => navigate(`/exchange/${ticker.market}`)}>
                <li>{ticker.korean_name}</li>
                <li style={{ color: isPositive }}>{Math.floor(ticker.trade_price).toLocaleString()} 원</li>
                <li style={{ color: isPositive }}>{(ticker.signed_change_rate * 100).toFixed(2)}%</li>
                <li>{Math.floor(ticker.acc_trade_price_24h).toLocaleString()} 원</li>
              </ListRow>
            );
          })}
        </ChartList>
      </Wrapper>

      <PaginationWrapper>
        {startPage > 1 && <NavButton prev onClick={handlePrev}>이전의</NavButton>}

        {[...Array(endPage - startPage + 1)].map((_, i) => {
          const pageNum = startPage + i;
          return (
            <PageButton
              key={pageNum}
              onClick={() => setPage(pageNum)}
              active={pageNum === page}
            >
              {pageNum}
            </PageButton>
          );
        })}

        {endPage < totalPages && <NavButton onClick={handleNext}>다음</NavButton>}
      </PaginationWrapper>
    </>
  );
};

export default MainPage;
