import { useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Body from './components/Body/Body';
import './App.css';

function Hello() {

  const [isOpportunityView, setIsOpportunityView] = useState<boolean>(true);

  return (
    <div>
      <Navbar isOpportunityView={isOpportunityView} setIsOpportunityView={setIsOpportunityView} />
      <Body isOpportunityView={isOpportunityView} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
