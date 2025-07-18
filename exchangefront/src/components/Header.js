// src/components/Header.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import getContracts from '../web3/getcontracts';
import { ethers } from 'ethers';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(90deg, #1e1e2f, #3e3e55);
  color: white;
`;

const Logo = styled.div`
  font-size: 1.6rem;
  font-weight: bold;

  a {
    color: white;
    text-decoration: none;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const AtomLink = styled(Link)`
  --bg: #3C465C;
  --primary: #78FFCD;
  --solid: #fff;
  --btn-w: 10em;
  --dot-w: calc(var(--btn-w)*.2);
  --tr-X: calc(var(--btn-w) - var(--dot-w));

  position: relative;
  display: inline-block;
  width: var(--btn-w);
  color: var(--primary);
  border: 2px solid var(--primary);
  border-radius: 5em;
  text-transform: uppercase;
  text-align: center;
  font-size: 1.1em;
  line-height: 2em;
  cursor: pointer;
  text-decoration: none;
  padding: 4px 0;
  transition: 0.3s;

  .dot {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--dot-w);
    height: 100%;
    border-radius: 100%;
    transition: all 300ms ease;
    display: none;
  }

  .dot:after {
    content: '';
    position: absolute;
    left: calc(50% - .4em);
    top: -.4em;
    height: .8em;
    width: .8em;
    background: var(--primary);
    border-radius: 1em;
    border: .25em solid var(--solid);
    box-shadow: 0 0 .7em var(--solid), 0 0 2em var(--primary);
  }

  &:hover .dot {
    display: block;
    animation: atom 2s infinite linear;
  }

  @keyframes atom {
    0% {transform: translateX(0) rotate(0);}
    30%{transform: translateX(var(--tr-X)) rotate(0);}
    50% {transform: translateX(var(--tr-X)) rotate(180deg);}
    80% {transform: translateX(0) rotate(180deg);}
    100% {transform: translateX(0) rotate(360deg);}
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalBox = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  width: 300px;

  h3 {
    margin-bottom: 15px;
    color: #333;
  }

  input {
    padding: 10px;
    width: 100%;
    border: 1px solid #ccc;
    margin-bottom: 15px;
    border-radius: 6px;
  }

  button {
    padding: 10px 20px;
    background: #3C465C;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
      background: #2e3449;
    }
  }
`;

const Header = () => {
  const [account, setAccount] = useState(null);
  const [nickname, setNickname] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [hasClaimed, setHasClaimed] = useState(false);
  const [balance, setBalance] = useState('0');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const wallet = accounts[0];
        setAccount(wallet);

        const stored = localStorage.getItem(`nickname:${wallet}`);
        if (stored) {
          setNickname(stored);
        } else {
          setShowModal(true);
        }
        await checkClaimed(wallet);
        await fetchBalance(wallet);
      } catch (err) {
        alert('지갑 연결 실패');
      }
    } else {
      alert('메타마스크를 설치해주세요.');
    }
  };

  const claimToken = async () => {
    try {
      const { krwContract } = getContracts();
      const tx = await krwContract.claim();
      await tx.wait();
      alert('토큰 받기 완료');
      setHasClaimed(true);
      await fetchBalance(account);
    } catch (err) {
      alert('이미 받은 사용자이거나 실패함');
    }
  };

  const checkClaimed = async (wallet) => {
    try {
      const { krwContract } = getContracts();
      const claimed = await krwContract.claimed(wallet);
      setHasClaimed(claimed);
    } catch (err) {
      console.error('claim 상태 확인 실패', err);
    }
  };

  const fetchBalance = async (wallet) => {
    try {
      const { krwContract } = getContracts();
      const bal = await krwContract.balanceOf(wallet);
      const intBalance = bal.div(ethers.BigNumber.from("1000000000000000000")); // 1e18
      setBalance(intBalance.toString()); // 정수 KRW로만 저장
    } catch (err) {
      console.error('잔고 조회 실패', err);
    }
  };

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const wallet = accounts[0];
          setAccount(wallet);
          const stored = localStorage.getItem(`nickname:${wallet}`);
          if (stored) setNickname(stored);
          await checkClaimed(wallet);
          await fetchBalance(wallet);
        }
      }
    };
    checkWallet();
  }, []);

  const saveNickname = () => {
    if (tempNickname.trim() === '') return alert('닉네임을 입력하세요');
    localStorage.setItem(`nickname:${account}`, tempNickname);
    setNickname(tempNickname);
    setShowModal(false);
  };

  const formatKRW = (balance) => {
    const [int, decimal = '00'] = balance.split('.');
    return `${Number(int).toLocaleString()}.${decimal.slice(0, 0).padEnd(0, '0')}`;
  };


  return (
    <>
      <HeaderContainer>
        <Logo>
          <Link to="/">bibibi</Link>
        </Logo>

        <Nav>
          <AtomLink to="/">
            거래소
            <span className="dot"></span>
          </AtomLink>

          {account && !hasClaimed && (
            <button onClick={claimToken} style={{ background: '#78FFCD', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>
               토큰 받기
            </button>
          )}

          {account && (
            <span style={{ fontSize: '14px', color: '#fff' }}>
              {/* 💰 보유 KRW: {balance} 원 */}
              {/* 💰 보유 KRW: {formatKRW(balance)} 원 */}
              {/* 💰 보유 KRW: {Math.floor(Number(balance)).toLocaleString()} 원 */}
              💰 보유 KRW: {Number(balance).toFixed(0).toLocaleString()} 원
              {/* 💰 보유 KRW: {Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 원 */}
            </span>
          )}

          {nickname ? (
            <AtomLink to="/mypage">
              {nickname}
              <span className="dot"></span>
            </AtomLink>
          ) : (
            <AtomLink as="a" onClick={connectWallet}>
              지갑 연결하기
              <span className="dot"></span>
            </AtomLink>
          )}
        </Nav>
      </HeaderContainer>

      {showModal && (
        <ModalOverlay>
          <ModalBox>
            <h3>닉네임 설정</h3>
            <input
              type="text"
              placeholder="닉네임 입력"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
            />
            <button onClick={saveNickname}>저장</button>
          </ModalBox>
        </ModalOverlay>
      )}
    </>
  );
};

export default Header;
