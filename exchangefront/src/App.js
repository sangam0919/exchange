import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import ExchangeDetailPage from './pages/ExchangeDetailPage';
import MyPage from './pages/Mypage';
import IntroPopup from './components/IntroPopup';

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
  return (
    <Router>
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
