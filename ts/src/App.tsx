import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AdvancedTerminal from './components/AdvancedTerminal';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/terminal" element={<AdvancedTerminal />} />
      </Routes>
    </Router>
  );
};

export default App;
