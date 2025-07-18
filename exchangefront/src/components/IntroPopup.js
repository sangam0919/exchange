// // components/IntroPopup.jsx
// import React, { useState } from 'react';
// import styled, { keyframes } from 'styled-components';

// const IntroWrapper = styled.div`
//   height: 100vh;
//   background-color: #5e3ca5;
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const Button = styled.button`
//   padding: 12px 24px;
//   background: transparent;
//   color: white;
//   border: 1px solid white;
//   font-weight: bold;
//   cursor: pointer;

//   &:hover {
//     background: white;
//     color: #5e3ca5;
//   }
// `;

// const fadeIn = keyframes`
//   from { opacity: 0; transform: scale(0.9); }
//   to { opacity: 1; transform: scale(1); }
// `;

// const PopupOverlay = styled.div`
//   position: fixed;
//   inset: 0;
//   background: rgba(0,0,0,0.6);
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   animation: ${fadeIn} 0.3s ease-out;
//   z-index: 999;
// `;

// const PopupBox = styled.div`
//   background: white;
//   padding: 30px 40px;
//   border-radius: 10px;
//   text-align: center;
// `;

// const IntroPopup = ({ onClose }) => {
//   const [step, setStep] = useState(0); // 0 = intro 화면, 1 = 팝업

//   if (step === 0) {
//     return (
//       <IntroWrapper>
//         <Button onClick={() => setStep(1)}>OPEN POPUP</Button>
//       </IntroWrapper>
//     );
//   }

//   return (
//     <PopupOverlay onClick={() => onClose()}>
//       <PopupBox onClick={(e) => e.stopPropagation()}>
//         <h2>모의 거래소에 오신 걸 환영합니다</h2>
//         <p>실제 자산이 아닌 연습용 거래 시스템입니다.</p>
//         <button onClick={() => onClose()}>확인</button>
//       </PopupBox>
//     </PopupOverlay>
//   );
// };

// export default IntroPopup;
// components/IntroPopup.jsx
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Typewriter } from 'react-simple-typewriter';

const IntroWrapper = styled.div`
  height: 100vh;
  background-color: #5e3ca5;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 30px;
  font-weight: bold;
  text-align: center;
`;

const IntroPopup = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // 타자 끝날 때쯤 넘어가도록 여유 줌
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <IntroWrapper>
      <Typewriter
        words={['모의 거래소입니다.', '도박 중독 조심하세요!']}
        loop={1}
        cursor
        cursorStyle='|'
        typeSpeed={80}
        deleteSpeed={30}
        delaySpeed={1000}
      />
    </IntroWrapper>
  );
};

export default IntroPopup;

