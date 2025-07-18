// src/components/Footer.jsx
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
  background: #1e1e2f;
  color: white;
  padding: 20px 0;
  text-align: center;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
  margin-top: auto;
`;

const FooterLinks = styled.div`
  a {
    color: white;
    text-decoration: none;
    margin: 0 10px;
    font-size: 1rem;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const FooterText = styled.p`
  margin-top: 10px;
  font-size: 0.875rem;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterLinks>
        <Link to="/">Home</Link>
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/privacy">Privacy Policy</Link>
      </FooterLinks>
      <FooterText>&copy; 2025 bibibi 거래소. All rights reserved.</FooterText>
    </FooterContainer>
  );
};

export default Footer;
