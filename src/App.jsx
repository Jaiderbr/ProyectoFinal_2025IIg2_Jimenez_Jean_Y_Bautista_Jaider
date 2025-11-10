import React, { lazy, Suspense } from 'react'
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

const MainPage = lazy(() => import("./pages/MainPage/MainPage"));
const Login = lazy(() => import("./pages/Login/Login"));
const Register = lazy(() => import("./pages/Register/Register"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const NoticiaDetalle = lazy(() => import("./pages/NoticiaDetalle/NoticiaDetalle"));
const PanelReportero = lazy(() => import('./pages/PanelReportero/PanelReportero.jsx'));
const PanelEditor = lazy(() => import('./pages/PanelEditor/PanelEditor.jsx'));

function App() {
    return (
        <Router>
            <Suspense fallback={
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
                    color: '#ffd700',
                    fontSize: '1.2rem',
                    fontWeight: '600'
                }}>
                    Cargando...
                </div>
            }>
                <Routes>
                    <Route path='/' element={<MainPage />} />
                    <Route path='/noticia/:id' element={<NoticiaDetalle />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/PanelReportero' element={<PanelReportero />} />
                    <Route path='/PanelEditor' element={<PanelEditor />} />
                    <Route path='*' element={<NotFound />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
