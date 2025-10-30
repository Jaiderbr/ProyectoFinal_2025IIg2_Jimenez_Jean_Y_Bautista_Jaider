import React from 'react'
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage/MainPage";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import NotFound from "./pages/NotFound/NotFound";

import PanelReportero from './pages/PanelReportero/PanelReportero.jsx';
import PanelEditor from './pages/PanelEditor/PanelEditor.jsx';

import { useEffect } from "react";
import { testFirestore } from "./Firebase/testConnection"

import "./App.css";

function App() {

  useEffect(() => {
    testFirestore();
  }, []);


  return (
    <Router>

      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<PanelReportero />} />
        <Route path='/PanelReportero' element={<PanelEditor />} />
        <Route path='/PanelEditor' element={<NotFound />} />
        <Route path='*' element={<NotFound />} />
      </Routes>


    </Router>
  );
}

export default App;
