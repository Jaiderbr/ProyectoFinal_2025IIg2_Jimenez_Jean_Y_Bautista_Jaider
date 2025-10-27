import React from 'react'
import Main from '../../Components/Main/Main'
import Header from '../../Components/Header/Header'
import Footer from '../../Components/Footer/Footer'
import './MainPage.css'

const MainPage = () => {
  return (
    <div className="main-page">
      <Header />
      <div className="main-content">
        <Main />
      </div>
      <Footer />
    </div>
  )
}

export default MainPage