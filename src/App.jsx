import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import MainNav from './layout/MainNav'
import Home from './pages/Home'
import SignUp from './pages/SingUp'
import SingIn from './pages/SingIn'
import { HeroUIProvider } from "@heroui/system";
import Verification from './pages/Verification'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'
import PaymentProtectedRoute from './routes/PaymentProtectedRoute'
import SingOut from './pages/SingOut'
import ForgetP from './pages/ForgetP'
import ForgetPOTP from './pages/ForgetPOTP'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import SpeakChatBot from './pages/SpeakChatBot'
import EMotiv from './pages/EMotiv'
import MoodT from './pages/MoodT'
import EEGAnalysis from './pages/EEGAnalysis'
import CheckoutPage from './pages/CheckoutPage'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import { ThemeProvider } from './context/ThemeContext'
import { SocketProvider } from './context/SocketContext'
import MoodReminderNotification from './components/MoodReminderNotification'
import ScrollToTop from './components/ScrollToTop'

function App() {

  return (
    <ThemeProvider>
      <HeroUIProvider>
        <SocketProvider>
          <MainNav />
          <MoodReminderNotification />
          <ScrollToTop />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/SignUp' element={<PublicRoute> <SignUp /> </PublicRoute>} />
            <Route path='/SignIn' element={<PublicRoute> <SingIn /> </PublicRoute>} />
            <Route path='/verification' element={<PublicRoute> <Verification /> </PublicRoute>} />
            <Route path='/ForgetP' element={<PublicRoute> <ForgetP /> </PublicRoute>} />
            <Route path='/ForgetPOTP' element={<PublicRoute> <ForgetPOTP /> </PublicRoute>} />
            <Route path='/ResetP' element={<PublicRoute> <ResetPassword /> </PublicRoute>} />
            <Route path='/r' element={<PublicRoute />} />
            <Route path='/f' element={<ProtectedRoute />} />
            <Route path='/SignOut' element={<ProtectedRoute> <SingOut /> </ProtectedRoute>} />
            <Route path='/Dashboard' element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
            <Route path='/Speak' element={<ProtectedRoute> <SpeakChatBot /> </ProtectedRoute>} />
            <Route path='/EMotiv' element={<ProtectedRoute> <EMotiv /> </ProtectedRoute>} />
            <Route path='/checkout' element={<ProtectedRoute> <CheckoutPage /> </ProtectedRoute>} />
            <Route path='/EEGAnalysis' element={<ProtectedRoute> <PaymentProtectedRoute> <EEGAnalysis /> </PaymentProtectedRoute> </ProtectedRoute>} />
            <Route path='/Mood' element={<ProtectedRoute> <MoodT /> </ProtectedRoute>} />
            <Route path='/Profile' element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />
            {/* <Route path='/Speak' element={<ProtectedRoute> <AiChat /> </ProtectedRoute>  } /> */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </SocketProvider>
        <ToastContainer position="top-right" autoClose={5000} />
      </HeroUIProvider>
    </ThemeProvider>
  )
}

export default App
