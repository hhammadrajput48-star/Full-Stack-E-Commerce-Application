import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Toast from './components/Toast.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import NotFound from './pages/NotFound.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'
import { useAuth } from './context/AuthContext.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])
  return null
}

function ProtectedRoute({ children }) {
  const { currentUser, authLoading } = useAuth()
  const location = useLocation()
  // Still asking the server whether the saved login is valid - don't bounce to /auth yet.
  if (authLoading) return <div className="app-loading">Loading…</div>
  if (!currentUser) return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  return children
}

export default function App() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/auth'

  return (
    <div className="app">
      <ScrollToTop />
      {!isAuthPage && <Navbar />}
      <main className="page-fade" key={location.pathname}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
      <Toast />
    </div>
  )
}
