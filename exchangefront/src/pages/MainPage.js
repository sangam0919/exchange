import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Search, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import API_BASE_URL from '../api/config';

const Page = styled.main`
  min-height: calc(100vh - 80px);
  background: #f5f7fb;
  color: #111827;
  padding: 40px 24px 80px;
`;
const Content = styled.div`max-width: 1180px; margin: 0 auto;`;
const Hero = styled.section`
  position: relative; overflow: hidden; display: grid; grid-template-columns: 1.15fr .85fr; align-items: center;
  min-height: 300px; padding: 46px 52px; border-radius: 28px;
  color: #f8fafc; background: radial-gradient(circle at 78% 25%, rgba(53, 224, 190, .17), transparent 28%), linear-gradient(120deg, #111c31 0%, #172b45 62%, #183d4c 100%);
  box-shadow: 0 24px 60px rgba(17, 28, 49, .16);
  @media (max-width: 760px) { grid-template-columns: 1fr; padding: 32px 24px; }
`;
const Eyebrow = styled.div`display: flex; align-items: center; gap: 9px; color: #74e6ce; font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;`;
const HeroTitle = styled.h1`max-width: 560px; margin: 18px 0 13px; font-size: clamp(32px, 4vw, 48px); line-height: 1.16; letter-spacing: -.045em;`;
const HeroCopy = styled.p`max-width: 500px; margin: 0; color: #b6c3d3; font-size: 15px; line-height: 1.8;`;
const HeroButton = styled.button`display: inline-flex; align-items: center; gap: 11px; margin-top: 26px; padding: 13px 18px; border: 0; border-radius: 11px; background: #69e1c2; color: #102236; font-weight: 800; cursor: pointer; transition: transform .18s, background .18s; &:hover { transform: translateY(-2px); background: #85f0d2; }`;
const Visual = styled.div`position: relative; display: flex; justify-content: center; align-items: center; min-height: 220px; @media (max-width: 760px) { display: none; }`;
const VisualCard = styled.div`width: min(100%, 360px); padding: 22px; border: 1px solid rgba(194, 236, 227, .18); border-radius: 20px; background: rgba(10, 25, 40, .56); box-shadow: 0 20px 50px rgba(0,0,0,.16); backdrop-filter: blur(10px);`;
const VisualTop = styled.div`display:flex; justify-content:space-between; align-items:center; color:#a9b7c8; font-size:12px;`;
const VisualValue = styled.div`margin:20px 0 2px; font-size:28px; font-weight:800; letter-spacing:-.04em;`;
const VisualMeta = styled.div`display:flex; gap:6px; align-items:center; color:#70e1c4; font-size:12px; font-weight:700;`;
const Sparkline = styled.svg`width:100%; height:72px; margin-top:14px; overflow:visible;`;
const Stats = styled.div`display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin:20px 0 38px; @media(max-width:680px){grid-template-columns:1fr;}`;
const StatCard = styled.div`display:flex; align-items:center; gap:14px; padding:18px 20px; border:1px solid #e9edf4; border-radius:16px; background:#fff; box-shadow:0 5px 18px rgba(27,39,58,.035);`;
const StatIcon = styled.div`display:grid; place-items:center; width:42px; height:42px; border-radius:13px; background:${p=>p.$tone==='mint'?'#e6faf4':p.$tone==='blue'?'#edf3ff':'#f1edff'}; color:${p=>p.$tone==='mint'?'#169b7c':p.$tone==='blue'?'#5279d5':'#7960c7'};`;
const StatLabel = styled.div`color:#7b8798; font-size:12px; font-weight:600;`;
const StatValue = styled.div`margin-top:4px; color:#172033; font-size:17px; font-weight:800;`;
const MarketHeader = styled.div`display:flex; justify-content:space-between; align-items:flex-end; gap:20px; margin-bottom:16px; @media(max-width:600px){align-items:flex-start;flex-direction:column;}`;
const Heading = styled.div`h2{margin:0 0 6px;font-size:23px;letter-spacing:-.035em;} p{margin:0;color:#7b8798;font-size:13px;}`;
const SearchBox = styled.label`display:flex;align-items:center;gap:8px;width:230px;padding:10px 12px;border:1px solid #e5eaf1;border-radius:10px;background:white;color:#96a1b0;input{width:100%;border:0;outline:0;color:#172033;font-size:13px;background:transparent;}@media(max-width:600px){width:100%;}`;
const TableCard = styled.div`overflow:hidden;border:1px solid #e7ebf2;border-radius:18px;background:white;box-shadow:0 8px 28px rgba(27,39,58,.045);`;
const TableScroll = styled.div`overflow-x:auto;`;
const Table = styled.table`width:100%;min-width:680px;border-collapse:collapse;th,td{padding:15px 20px;text-align:right;border-bottom:1px solid #f0f2f6;}th:first-child,td:first-child{text-align:left;}th{color:#8490a1;background:#fafbfd;font-size:11px;font-weight:700;letter-spacing:.04em;}tbody tr{cursor:pointer;transition:background .14s;}tbody tr:hover{background:#f8fbfd;}tbody tr:last-child td{border-bottom:0;}`;
const CoinCell = styled.div`display:flex;align-items:center;gap:12px;text-align:left;`;
const CoinIcon = styled.div`display:grid;place-items:center;width:38px;height:38px;border-radius:13px;background:#eff7f5;color:#187e6c;font-size:12px;font-weight:900;`;
const CoinName = styled.div`font-size:14px;font-weight:800;color:#1c2738;`;
const CoinSymbol = styled.div`margin-top:3px;color:#929cac;font-size:11px;`;
const Price = styled.div`font-size:14px;font-weight:750;color:#273246;`;
const Change = styled.span`display:inline-flex;align-items:center;gap:3px;color:${p=>p.$positive?'#db5261':'#4e78ca'};font-size:12px;font-weight:750;`;
const Volume = styled.span`color:#667386;font-size:12px;`;
const Empty = styled.div`padding:44px 20px;text-align:center;color:#8490a1;font-size:14px;`;
const FooterNote = styled.div`display:flex;gap:8px;align-items:flex-start;margin-top:15px;color:#8b96a5;font-size:11px;line-height:1.6;`;
const Pagination = styled.nav`display:flex;justify-content:center;align-items:center;gap:7px;padding:18px 12px;border-top:1px solid #f0f2f6;background:#fff;button{min-width:36px;height:36px;padding:0 10px;border:1px solid #e5eaf1;border-radius:9px;background:#fff;color:#536174;font-size:12px;font-weight:700;cursor:pointer;&:disabled{opacity:.4;cursor:not-allowed;}&:hover:not(:disabled){border-color:#17856c;color:#17856c;}}button[aria-current='page']{border-color:#17856c;background:#17856c;color:#fff;}.summary{margin:0 8px;color:#8490a1;font-size:12px;}`;

const formatKrw = (value) => Number(value || 0).toLocaleString('ko-KR', { maximumFractionDigits: 0 });
const formatVolume = (value) => {
  const n = Number(value || 0);
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}조`;
  if (n >= 1e8) return `${(n / 1e8).toFixed(0)}억`;
  return formatKrw(n);
};

const MainPage = () => {
  const [tickers, setTickers] = useState([]);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('acc_trade_price_24h');
  const [sortAscending, setSortAscending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const fetchTickers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/main/api/upbit/tickers`);
        if (!response.ok) throw new Error('시세를 불러오지 못했습니다.');
        const data = await response.json();
        if (active) setTickers(data);
      } catch (error) {
        console.error('Ticker loading failed:', error);
      }
    };
    fetchTickers();
    const interval = setInterval(fetchTickers, 15000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  const filteredTickers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...tickers]
      .filter((ticker) => !normalizedQuery || ticker.korean_name.toLowerCase().includes(normalizedQuery) || ticker.market.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => (Number(a[sortKey]) - Number(b[sortKey])) * (sortAscending ? 1 : -1));
  }, [query, sortAscending, sortKey, tickers]);

  useEffect(() => { setCurrentPage(1); }, [query, sortAscending, sortKey]);
  const pageCount = Math.max(1, Math.ceil(filteredTickers.length / pageSize));
  const pageTickers = filteredTickers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalMarkets = tickers.length;
  const upCount = tickers.filter((ticker) => Number(ticker.signed_change_rate) > 0).length;
  const btc = tickers.find((ticker) => ticker.market === 'KRW-BTC');

  const toggleSort = (key) => {
    if (sortKey === key) setSortAscending((value) => !value);
    else { setSortKey(key); setSortAscending(false); }
  };

  return (
    <Page>
      <Content>
        <Hero>
          <div>
            <Eyebrow><Sparkles size={14} /> DIGITAL ASSET EXCHANGE</Eyebrow>
            <HeroTitle>시장의 흐름을 읽고,<br />나만의 전략을 시작하세요.</HeroTitle>
            <HeroCopy>실시간 시세와 전체 KRW 마켓을 둘러보고 가상 잔고로 매수·매도를 연습해보세요.</HeroCopy>
            <HeroButton onClick={() => navigate('/exchange/KRW-BTC')}>거래 시작하기 <ArrowRight size={16} /></HeroButton>
          </div>
          <Visual aria-hidden="true">
            <VisualCard>
              <VisualTop><span>비트코인 · KRW-BTC</span><Activity size={16} color="#6ee2c6" /></VisualTop>
              <VisualValue>{btc ? `₩ ${formatKrw(btc.trade_price)}` : '₩ —'}</VisualValue>
              <VisualMeta><TrendingUp size={14} /> {btc ? `${(Number(btc.signed_change_rate) * 100).toFixed(2)}%` : '시세 연결 중'}</VisualMeta>
              <Sparkline viewBox="0 0 320 72" preserveAspectRatio="none">
                <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#70e4c4" stopOpacity=".34"/><stop offset="1" stopColor="#70e4c4" stopOpacity="0"/></linearGradient></defs>
                <path d="M0 58 C25 50 33 53 52 42 S83 47 103 34 S128 44 147 30 S174 35 190 20 S220 36 238 21 S267 29 285 12 S306 20 320 5 V72 H0Z" fill="url(#chartFill)"/>
                <path d="M0 58 C25 50 33 53 52 42 S83 47 103 34 S128 44 147 30 S174 35 190 20 S220 36 238 21 S267 29 285 12 S306 20 320 5" fill="none" stroke="#70e4c4" strokeWidth="2.5"/>
              </Sparkline>
            </VisualCard>
          </Visual>
        </Hero>

        <Stats>
          <StatCard><StatIcon $tone="mint"><Activity size={19}/></StatIcon><div><StatLabel>거래 가능 마켓</StatLabel><StatValue>{totalMarkets ? `${totalMarkets} markets` : 'Loading'}</StatValue></div></StatCard>
          <StatCard><StatIcon $tone="blue"><TrendingUp size={19}/></StatIcon><div><StatLabel>상승 마켓</StatLabel><StatValue>{totalMarkets ? `${upCount}개` : '—'}</StatValue></div></StatCard>
          <StatCard><StatIcon $tone="violet"><ShieldCheck size={19}/></StatIcon><div><StatLabel>거래 모드</StatLabel><StatValue>Paper trading</StatValue></div></StatCard>
        </Stats>

        <MarketHeader>
          <Heading><h2>마켓 둘러보기</h2><p>업비트 KRW 마켓 기준 실시간 참고 시세</p></Heading>
          <SearchBox><Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="코인명 또는 심볼 검색" aria-label="마켓 검색" /></SearchBox>
        </MarketHeader>
        <TableCard>
          <TableScroll>
            <Table>
              <thead><tr><th>자산</th><th><button className="table-sort" onClick={() => toggleSort('trade_price')}>현재가 {sortKey === 'trade_price' ? <ArrowRight size={12}/> : null}</button></th><th><button className="table-sort" onClick={() => toggleSort('signed_change_rate')}>24시간 변동률 {sortKey === 'signed_change_rate' ? <ArrowRight size={12}/> : null}</button></th><th><button className="table-sort" onClick={() => toggleSort('acc_trade_price_24h')}>24시간 거래대금 {sortKey === 'acc_trade_price_24h' ? <ArrowRight size={12}/> : null}</button></th><th>거래</th></tr></thead>
              <tbody>
                {pageTickers.map((ticker) => {
                  const positive = Number(ticker.signed_change_rate) >= 0;
                  const symbol = ticker.market.replace('KRW-', '');
                  return <tr key={ticker.market} onClick={() => navigate(`/exchange/${ticker.market}`)}>
                    <td><CoinCell><CoinIcon>{symbol.slice(0, 3)}</CoinIcon><div><CoinName>{ticker.korean_name}</CoinName><CoinSymbol>{symbol} · KRW</CoinSymbol></div></CoinCell></td>
                    <td><Price>₩ {formatKrw(ticker.trade_price)}</Price></td>
                    <td><Change $positive={positive}>{positive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {(Number(ticker.signed_change_rate) * 100).toFixed(2)}%</Change></td>
                    <td><Volume>₩ {formatVolume(ticker.acc_trade_price_24h)}</Volume></td>
                    <td><span className="trade-link">거래하기 <ArrowRight size={13}/></span></td>
                  </tr>;
                })}
              </tbody>
            </Table>
          </TableScroll>
          {tickers.length > 0 && filteredTickers.length === 0 && <Empty>검색 결과가 없습니다.</Empty>}
          {!tickers.length && <Empty>실시간 시세를 불러오고 있습니다…</Empty>}
          {filteredTickers.length > 0 && <Pagination aria-label="Market pages">
            <button type="button" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} aria-label="First page">&laquo;</button>
            <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} aria-label="Previous page">&lsaquo;</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1)
              .filter((page) => page === 1 || page === pageCount || Math.abs(page - currentPage) <= 2)
              .map((page, index, pages) => <React.Fragment key={page}>
                {index > 0 && page - pages[index - 1] > 1 && <span className="summary">...</span>}
                <button type="button" onClick={() => setCurrentPage(page)} aria-current={page === currentPage ? 'page' : undefined}>{page}</button>
              </React.Fragment>)}
            <button type="button" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={currentPage === pageCount} aria-label="Next page">&rsaquo;</button>
            <button type="button" onClick={() => setCurrentPage(pageCount)} disabled={currentPage === pageCount} aria-label="Last page">&raquo;</button>
            <span className="summary">{filteredTickers.length} markets</span>
          </Pagination>}
        </TableCard>
        <FooterNote><ShieldCheck size={14}/> 시세는 업비트 공개 API를 참고합니다. 매수·매도는 이 브라우저에 저장되는 모의 거래이며 실제 자산 주문이 아닙니다.</FooterNote>
      </Content>
    </Page>
  );
};

export default MainPage;
