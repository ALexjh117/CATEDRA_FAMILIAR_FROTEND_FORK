import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import DashboardPage from './pages/DashboardPage'
import FloatingRoleSwitch from './components/FloatingRoleSwitch'

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/dashboard" element={<DashboardPage/>} />
      </Routes>
      <FloatingRoleSwitch />
    </BrowserRouter>
  )
}