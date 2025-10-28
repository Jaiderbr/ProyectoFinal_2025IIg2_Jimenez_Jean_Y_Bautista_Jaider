import React from 'react'
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage/MainPage";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import NotFound from "./pages/NotFound/NotFound";

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
        <Route path='/register' element={<Register />} />
        <Route path='*' element={<NotFound />} />
      </Routes>


    </Router>
  );
}

export default App;
