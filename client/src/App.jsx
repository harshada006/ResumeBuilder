import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import Preview from './pages/Preview'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/view/:resumeId' element={<Preview/>}/>
          
          <Route path='app' element={<ProtectedRoute/>}>
            <Route element={<Layout/>}>
              <Route index element={<Dashboard/>}/>
              <Route path='builder/:resumeId' element={<ResumeBuilder/>}/>
              <Route path='view/:resumeId' element={<Preview/>}/>
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
