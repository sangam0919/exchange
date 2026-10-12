import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
const FooterContainer=styled.footer`background:#fff;color:#788496;padding:22px 20px;text-align:center;border-top:1px solid #e9edf3;margin-top:auto;`;
const FooterLinks=styled.div`a{color:#627184;text-decoration:none;margin:0 10px;font-size:.8rem;&:hover{text-decoration:underline;}}`;
const FooterText=styled.p`margin-top:10px;font-size:.8rem;`;
export default function Footer() {
  return (
    <FooterContainer>
      <FooterLinks>
        <Link to="/">SA Exchange</Link>
        <Link to="/exchange/KRW-BTC">비트코인 마켓</Link>
      </FooterLinks>
      <FooterText>포트폴리오용 모의 거래 데모 · 실제 자산을 거래하지 않습니다.</FooterText>
    </FooterContainer>
  );
}
