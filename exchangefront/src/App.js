import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import ExchangeDetailPage from './pages/ExchangeDetailPage';
import MyPage from './pages/Mypage';
import socket from './socket/socket';
// import AlarmNav from './components/AlarmNav';

function App() {
  // const [showIntro, setShowIntro] = useState(true);

  // useEffect(() => {
  //   const alreadySeen = localStorage.getItem('intro_seen');
  //   if (alreadySeen) setShowIntro(false);
  // }, []);

  // const handleIntroClose = () => {
  //   localStorage.setItem('intro_seen', 'true');
  //   setShowIntro(false);
  // };

  // if (showIntro) {
  //   return <IntroPopup onClose={handleIntroClose} />;
  // }

  useEffect(() => {
    socket.on('connect', () => {
      console.log('소켓 연결됨:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('소켓 연결 종료');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <Router>
       {/* <AlarmNav hasNew={true} />   */}
      <Header />
      <Routes>
        <Route path="/" element={<MainPage /> } />
        <Route path="/exchange/:market" element={<ExchangeDetailPage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
