import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import Preview from './pages/Preview'
import Login from './pages/Login'
import PortfolioView from './pages/PortfolioView'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        {/* Public resume preview and portfolio links */}
        <Route path='/view/:resumeId' element={<Preview/>}/>
        <Route path='/portfolio/:resumeId' element={<PortfolioView/>}/>
        
        {/* Protected app workspace */}
        <Route path='/app' element={<ProtectedRoute />}>
          <Route element={<Layout/>}>
            <Route index element={<Dashboard/>}/>
            <Route path='builder/:resumeId' element={<ResumeBuilder/>}/>
            <Route path='view/:resumeId' element={<Preview/>}/>
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
