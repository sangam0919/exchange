import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { getDemoAccount } from '../demoAccount';
import API_BASE_URL from '../api/config';

const Bar = styled.header`position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:22px;min-height:74px;padding:12px max(24px,calc((100vw - 1180px)/2));background:rgba(255,255,255,.96);border-bottom:1px solid #e9edf3;backdrop-filter:blur(14px);@media(max-width:680px){padding:12px 16px;flex-wrap:wrap;}`;
const Brand = styled(Link)`font-size:20px;font-weight:900;letter-spacing:-.05em;color:#172033;text-decoration:none;white-space:nowrap;span{color:#188b75;}`;
const Nav = styled.nav`display:flex;align-items:center;gap:20px;a{color:#536174;text-decoration:none;font-size:13px;font-weight:700;&:hover{color:#17856c;}}@media(max-width:680px){gap:12px;}`;
const Right = styled.div`display:flex;align-items:center;gap:14px;`;
const Account = styled.div`display:flex;align-items:center;gap:10px;color:#536174;font-size:12px;font-weight:700;white-space:nowrap;.badge{padding:6px 8px;border-radius:7px;background:#e8f8f3;color:#16836d;font-size:10px;letter-spacing:.05em;}@media(max-width:520px){span:last-child{display:none;}}`;
const AlarmWrap = styled.div`position:relative;`;
const AlarmButton = styled.button`position:relative;display:grid;place-items:center;width:38px;height:38px;border:1px solid #e7ebf1;border-radius:11px;background:#fff;color:#526174;cursor:pointer;&:hover{background:#f6faf9;color:#16836d;}.count{position:absolute;top:-5px;right:-5px;min-width:17px;height:17px;padding:0 4px;border:2px solid white;border-radius:10px;background:#e24d5b;color:#fff;font-size:10px;font-weight:800;line-height:13px;text-align:center;}`;
const Panel = styled.div`position:absolute;top:48px;right:0;width:min(360px,calc(100vw - 32px));overflow:hidden;border:1px solid #e8edf3;border-radius:15px;background:#fff;box-shadow:0 18px 50px rgba(27,39,58,.16);`;
const PanelHead = styled.div`display:flex;align-items:center;justify-content:space-between;padding:15px 16px;border-bottom:1px solid #edf0f5;strong{font-size:14px;color:#172033;}button{display:flex;align-items:center;gap:5px;border:0;background:none;color:#758296;font-size:11px;cursor:pointer;}`;
const NoticeList = styled.div`max-height:330px;overflow:auto;`;
const Notice = styled.div`padding:13px 16px;border-bottom:1px solid #f0f2f6;background:${({ $unread }) => ($unread ? '#f3faf8' : '#fff')};.title{display:flex;justify-content:space-between;gap:12px;color:${({ $positive }) => ($positive ? '#16836d' : '#db5261')};font-size:12px;font-weight:800;}.message{margin-top:5px;color:#536174;font-size:12px;line-height:1.5;}.time{margin-top:5px;color:#9aa4b2;font-size:10px;}`;
const NoNotice = styled.div`padding:28px 18px;color:#8490a1;text-align:center;font-size:12px;line-height:1.6;`;

const STORAGE_KEY = 'sa-demo-price-alerts-v1';
const BAND_KEY = 'sa-demo-price-alert-bands-v1';
const readAlerts = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
};
const readBands = () => {
  try { return JSON.parse(localStorage.getItem(BAND_KEY) || '{}'); }
  catch { return {}; }
};
const money = (value) => `${Math.round(Number(value) || 0).toLocaleString('ko-KR')}원`;

export default function Header() {
  const [balance, setBalance] = useState(() => getDemoAccount().krwBalance);
  const [alerts, setAlerts] = useState(readAlerts);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const sync = () => setBalance(getDemoAccount().krwBalance);
    window.addEventListener('storage', sync);
    window.addEventListener('sa-demo-account-updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('sa-demo-account-updated', sync);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const checkHeldAssetReturns = async () => {
      try {
        const account = getDemoAccount();
        const markets = Object.keys(account.holdings || {});
        if (!markets.length) return;
        const response = await fetch(`${API_BASE_URL}/main/api/upbit/tickers`);
        if (!response.ok) throw new Error('시세 조회 실패');
        const tickers = await response.json();
        if (!active) return;

        const prices = Object.fromEntries(tickers.map(({ market, trade_price }) => [market, Number(trade_price)]));
        const bands = readBands();
        const nextAlerts = [];
        markets.forEach((market) => {
          const position = account.holdings[market];
          const price = prices[market];
          if (!price || !position?.averagePrice) return;
          const rate = ((price - position.averagePrice) / position.averagePrice) * 100;
          const band = Math.trunc(rate / 5);
          if (Object.prototype.hasOwnProperty.call(bands, market) && bands[market] !== band) {
            const crossed = band * 5;
            nextAlerts.push({
              id: `${market}-${band}-${Date.now()}`,
              market,
              rate,
              threshold: crossed,
              positive: band > bands[market],
              read: false,
              createdAt: new Date().toISOString(),
            });
          }
          bands[market] = band;
        });
        localStorage.setItem(BAND_KEY, JSON.stringify(bands));
        if (nextAlerts.length) {
          const updated = [...nextAlerts, ...readAlerts()].slice(0, 20);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          setAlerts(updated);
        }
      } catch (error) {
        console.warn('보유 자산 알림을 확인하지 못했습니다:', error);
      }
    };
    checkHeldAssetReturns();
    const timer = window.setInterval(checkHeldAssetReturns, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!panelRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isOpen]);

  const unreadCount = alerts.filter((alert) => !alert.read).length;
  const toggleAlerts = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && unreadCount) {
      const read = alerts.map((alert) => ({ ...alert, read: true }));
      setAlerts(read);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(read));
    }
  };
  const clearAlerts = () => {
    setAlerts([]);
    localStorage.setItem(STORAGE_KEY, '[]');
  };

  return (
    <Bar>
      <Brand to="/">SA <span>EXCHANGE</span></Brand>
      <Nav>
        <Link to="/">마켓</Link>
        <Link to="/mypage">내 포트폴리오</Link>
      </Nav>
      <Right>
        <AlarmWrap ref={panelRef}>
          <AlarmButton type="button" aria-label="알림" aria-expanded={isOpen} onClick={toggleAlerts}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </AlarmButton>
          {isOpen && (
            <Panel>
              <PanelHead>
                <strong>보유 코인 수익률 알림</strong>
                {alerts.length > 0 && <button type="button" onClick={clearAlerts}><X size={13} /> 모두 지우기</button>}
              </PanelHead>
              {alerts.length ? (
                <NoticeList>{alerts.map((alert) => (
                  <Notice key={alert.id} $unread={!alert.read} $positive={alert.positive}>
                    <div className="title"><span>{alert.market.replace('KRW-', '')} 수익률 {alert.positive ? '상승' : '하락'}</span><span>{alert.rate > 0 ? '+' : ''}{alert.rate.toFixed(2)}%</span></div>
                    <div className="message">매수가 기준 {Math.abs(alert.threshold)}% 구간을 지났어요. 평가손익 {alert.rate > 0 ? '+' : ''}{money((alert.rate / 100) * (getDemoAccount().holdings[alert.market]?.averagePrice || 0) * (getDemoAccount().holdings[alert.market]?.amount || 0))}</div>
                    <div className="time">{new Date(alert.createdAt).toLocaleString('ko-KR')}</div>
                  </Notice>
                ))}</NoticeList>
              ) : (
                <NoNotice>보유 코인의 매수가 대비 수익률이 5% 구간을 넘으면 여기에 알려드릴게요.<br />시세를 15초마다 확인합니다.</NoNotice>
              )}
            </Panel>
          )}
        </AlarmWrap>
        <Account>
          <span className="badge">모의 거래</span>
          <span>{Number(balance).toLocaleString('ko-KR', { maximumFractionDigits: 2 })} KRW</span>
        </Account>
      </Right>
    </Bar>
  );
}
