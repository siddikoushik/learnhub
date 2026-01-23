import React, { useContext, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
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
import AirDrawStudent from './components/AirDraw/AirDrawStudent'
import AirDrawTeacher from './components/AirDraw/AirDrawTeacher'
import Payment from './pages/Payment/Payment'
import Classroom from './pages/Classroom/Classroom'

const AppContent = () => {
  const location = useLocation();
  const isClassroom = location.pathname.startsWith('/classroom');

  const [login, setLogin] = useState(false)
  const [techpro, setTechpro] = useState(false)

  return (
    <div>
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

        <Route path="/teacher/airdraw/:roomId" element={<AirDrawTeacher />} />
        <Route path="/student/airdraw/:roomId" element={<AirDrawStudent />} />
        <Route path="/classroom/:roomId" element={<Classroom />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>

    </div>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
