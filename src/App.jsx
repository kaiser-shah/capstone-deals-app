import { useState } from 'react'
import { AuthProvider } from './components/AuthProvider'
import AuthPage from './pages/AuthPage'
import {Routes, Route, BrowserRouter} from "react-router-dom"


export default function App() {
  return(

    <AuthProvider>
      <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}

        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}