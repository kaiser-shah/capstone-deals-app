import { useState } from 'react'
import { AuthProvider } from './components/AuthProvider'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import DealPage from './pages/DealPage'
import ProfilePage from './pages/ProfilePage'
import {Routes, Route, BrowserRouter} from "react-router-dom"


export default function App() {
  return(

    <AuthProvider>
      <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}

        <Route path="/" element={<HomePage />} /> 
        <Route path="/login" element={<AuthPage />} />
        <Route path="/deal" element={<DealPage />} />
        <Route path="/profile" element={<ProfilePage />} /> 
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}