import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { getDemoAccount } from '../demoAccount';
import API_BASE_URL from '../api/config';

const Page=styled.main`min-height:calc(100vh - 150px);padding:40px 24px 76px;background:#f5f7fb;color:#172033;`;
const Content=styled.div`max-width:1180px;margin:0 auto;`;
const Heading=styled.div`h1{margin:0 0 8px;font-size:30px;letter-spacing:-.04em;}p{margin:0;color:#788496;font-size:14px;}`;
const Cards=styled.div`display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:24px 0;@media(max-width:700px){grid-template-columns:1fr;}`;
const Card=styled.div`padding:22px;border:1px solid #e8edf3;border-radius:16px;background:white;box-shadow:0 5px 18px rgba(27,39,58,.035);span{color:#7b8798;font-size:12px;font-weight:700;}strong{display:block;margin-top:8px;font-size:22px;}`;
const Section=styled.section`margin-top:16px;padding:22px;border:1px solid #e8edf3;border-radius:16px;background:white;box-shadow:0 8px 28px rgba(27,39,58,.04);h2{margin:0 0 16px;font-size:18px;}`;
const TableWrap=styled.div`overflow-x:auto;`;
const Table=styled.table`width:100%;min-width:640px;border-collapse:collapse;th,td{padding:13px 10px;border-bottom:1px solid #edf0f5;text-align:right;font-size:13px;}th:first-child,td:first-child{text-align:left;}th{color:#8490a1;background:#fafbfd;font-size:11px;}tbody tr:last-child td{border-bottom:0;}`;
const Empty=styled.div`padding:28px 12px;color:#8490a1;text-align:center;font-size:14px;`;
const Reset=styled.button`margin-top:18px;padding:10px 14px;border:1px solid #e0e6ee;border-radius:9px;background:#fff;color:#68778a;font-size:12px;font-weight:700;cursor:pointer;&:hover{border-color:#c2cbd7;}`;
const money=(n)=>`${Math.round(Number(n)||0).toLocaleString('ko-KR')} KRW`;
export default function MyPage(){
  const [account,setAccount]=useState(()=>getDemoAccount());
  const [names,setNames]=useState({});
  const [prices,setPrices]=useState({});
  useEffect(()=>{const sync=()=>setAccount(getDemoAccount());window.addEventListener('storage',sync);window.addEventListener('sa-demo-account-updated',sync);return()=>{window.removeEventListener('storage',sync);window.removeEventListener('sa-demo-account-updated',sync);};},[]);
  const markets=useMemo(()=>Object.keys(account.holdings||{}),[account]);
  useEffect(()=>{let active=true;const load=async()=>{try{const [tickersResponse,marketResponse]=await Promise.all([fetch(`${API_BASE_URL}/main/api/upbit/tickers`),fetch('https://api.upbit.com/v1/market/all?isDetails=true')]);const tickers=await tickersResponse.json();const marketList=await marketResponse.json();if(!active)return;const priceMap={};tickers.forEach((item)=>{priceMap[item.market]=item.trade_price;});const nameMap={};marketList.forEach((item)=>{nameMap[item.market]=item.korean_name;});setPrices(priceMap);setNames(nameMap);}catch(error){console.warn('Could not load portfolio quotes:',error);}};load();const timer=setInterval(load,15000);return()=>{active=false;clearInterval(timer);};},[]);
  const assets=markets.map((market)=>{const position=account.holdings[market];const price=Number(prices[market]||0);return {market,position,price,value:price*position.amount,pnl:(price-position.averagePrice)*position.amount};});
  const totalValue=account.krwBalance+assets.reduce((sum,item)=>sum+item.value,0);
  const reset=()=>{if(!window.confirm('Reset this browser paper-trading account to the starting balance?'))return;localStorage.removeItem('sa-exchange-paper-account-v1');window.dispatchEvent(new Event('sa-demo-account-updated'));setAccount(getDemoAccount());};
  return <Page><Content><Heading><h1>My portfolio</h1><p>Your paper-trading balance, holdings, and order history, saved in this browser.</p></Heading>
    <Cards><Card><span>Available cash</span><strong>{money(account.krwBalance)}</strong></Card><Card><span>Portfolio value</span><strong>{money(totalValue)}</strong></Card><Card><span>Open positions</span><strong>{assets.length}</strong></Card></Cards>
    <Section><h2>Holdings</h2>{assets.length===0?<Empty>No holdings yet. <Link to="/">Explore the markets</Link> and place a simulated buy order.</Empty>:<TableWrap><Table><thead><tr><th>Asset</th><th>Quantity</th><th>Average entry</th><th>Market price</th><th>Value</th><th>Unrealized P/L</th></tr></thead><tbody>{assets.map(({market,position,price,value,pnl})=><tr key={market}><td><Link to={`/exchange/${market}`}>{names[market]||market} ({market.replace('KRW-','')})</Link></td><td>{Number(position.amount).toFixed(6)}</td><td>{money(position.averagePrice)}</td><td>{price?money(price):'Loading...'}</td><td>{money(value)}</td><td style={{color:pnl>=0?'#16836d':'#db5261'}}>{money(pnl)}</td></tr>)}</tbody></Table></TableWrap>}</Section>
    <Section><h2>Order history</h2>{account.orders.length===0?<Empty>No simulated orders yet.</Empty>:<TableWrap><Table><thead><tr><th>Time</th><th>Asset</th><th>Side</th><th>Quantity</th><th>Price</th><th>Total</th><th>Fee</th></tr></thead><tbody>{account.orders.map((order)=><tr key={order.id}><td>{new Date(order.createdAt).toLocaleString()}</td><td>{names[order.market]||order.market}</td><td style={{color:order.type==='BUY'?'#16836d':'#db5261'}}>{order.type==='BUY'?'Buy':'Sell'}</td><td>{Number(order.amount).toFixed(6)}</td><td>{money(order.price)}</td><td>{money(order.total)}</td><td>{money(order.fee)}</td></tr>)}</tbody></Table></TableWrap>}</Section>
    <Reset type="button" onClick={reset}>Reset demo account</Reset>
  </Content></Page>;
}
