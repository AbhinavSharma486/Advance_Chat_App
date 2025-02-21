import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";

import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/signup' element={<SignUpPage />} />
      </Routes>
    </div>
  );
};

export default App;