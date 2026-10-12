import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { getDemoAccount } from '../demoAccount';
const Bar=styled.header`position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:22px;min-height:74px;padding:12px max(24px,calc((100vw - 1180px)/2));background:rgba(255,255,255,.94);border-bottom:1px solid #e9edf3;backdrop-filter:blur(14px);@media(max-width:680px){padding:12px 16px;flex-wrap:wrap;}`;
const Brand=styled(Link)`font-size:20px;font-weight:900;letter-spacing:-.05em;color:#172033;text-decoration:none;white-space:nowrap;span{color:#188b75;}`;
const Nav=styled.nav`display:flex;align-items:center;gap:20px;a{color:#536174;text-decoration:none;font-size:13px;font-weight:700;&:hover{color:#17856c;}}@media(max-width:680px){gap:12px;}`;
const Account=styled.div`display:flex;align-items:center;gap:10px;color:#536174;font-size:12px;font-weight:700;white-space:nowrap;.badge{padding:6px 8px;border-radius:7px;background:#e8f8f3;color:#16836d;font-size:10px;letter-spacing:.05em;}`;
export default function Header(){const [balance,setBalance]=useState(()=>getDemoAccount().krwBalance);useEffect(()=>{const sync=()=>setBalance(getDemoAccount().krwBalance);window.addEventListener('storage',sync);window.addEventListener('sa-demo-account-updated',sync);return()=>{window.removeEventListener('storage',sync);window.removeEventListener('sa-demo-account-updated',sync);};},[]);return <Bar><Brand to="/">SA <span>EXCHANGE</span></Brand><Nav><Link to="/">Markets</Link><Link to="/mypage">My portfolio</Link></Nav><Account><span className="badge">PAPER TRADING</span><span>{Number(balance).toLocaleString()} KRW</span></Account></Bar>;}
