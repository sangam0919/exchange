import React from 'react';
import styled from 'styled-components';
import { Bell } from 'lucide-react';

const NavBarWrapper = styled.div`
  width: 100%;
  background: #1e1e2f;
  color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  box-shadow: 0 1px 5px rgba(0,0,0,0.3);
`;

const AlarmButton = styled.button`
  background: none;
  border: none;
  color: white;
  position: relative;
  cursor: pointer;

  &:hover {
    color: #78FFCD;
  }
`;

const Dot = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background: red;
  border-radius: 50%;
`;

const AlarmNav = ({ hasNew }) => {
  return (
    <NavBarWrapper>
      <AlarmButton onClick={() => alert('🔔 알림이 클릭됨!')}>
        <Bell />
        {hasNew && <Dot />}
      </AlarmButton>
    </NavBarWrapper>
  );
};

export default AlarmNav;
