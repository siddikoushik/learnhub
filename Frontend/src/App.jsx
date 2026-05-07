import React, { useContext, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import Footer from './components/Footer/Footer'
import Auth from './components/Auth/Auth' // Import Auth
import Profile from './pages/Profile/Profile' // Unified Profile
import StudentMenu from './pages/StudentMenu/StudentMenu'
import TeachersMenu from './pages/TeachersMenu/TeachersMenu'
import TeachersDisplay from './components/TeachersDisplay/TeachersDisplay'
import StudentsDashboard from './components/StudentsDashboard/StudentsDashboard'
import TeacherDetailsById from './components/TeacherDetailsById/TeacherDetailsById'
import Payment from './pages/Payment/Payment'
import Classroom from './pages/Classroom/Classroom'
import PaymentPage from './pages/QRPayment/PaymentPage'
import UploadProof from './pages/QRPayment/UploadProof'

const AppContent = () => {
  const location = useLocation();
  const isClassroom = location.pathname.startsWith('/classroom');

  const [login, setLogin] = useState(false)
  const [techpro, setTechpro] = useState(false)

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {login && (<Auth setLogin={setLogin} />)} {/* Render Global Auth */}
      {!isClassroom && <Navbar login={login} setLogin={setLogin} />}

      <Routes>
        <Route path='/' element={<Home login={login} setLogin={setLogin} techpro={techpro} setTechpro={setTechpro} />} />

        {/* Global & Nested Profile Routes */}
        <Route path='/profile' element={<Profile />} />
        <Route path='/studentsmenu/profile' element={<Profile />} />
        <Route path='/teachersmenu/profile' element={<Profile />} />

        <Route path='/studentsmenu' element={<StudentMenu />} />
        <Route path='/teachersmenu' element={<TeachersMenu />} />

        <Route path='/studentsmenu/dashboard' element={<StudentsDashboard />} />
        <Route path='teachersmenu/dashboard' element={<TeachersDisplay />} />


        <Route path="/teacher/:id" element={<TeacherDetailsById />} />
        <Route path="/classroom/:roomId" element={<Classroom />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-qr" element={<PaymentPage />} />
        <Route path="/upload-proof" element={<UploadProof />} />
      </Routes>

      {!isClassroom && <Footer />}
    </div>
  )
}
console.log("LearnHub Updated");
const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
