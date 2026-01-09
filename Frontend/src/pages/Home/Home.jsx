import React from 'react'
import './Home.css'
import About from '../../components/About/About'
import Hero from '../../components/Hero/Hero'
import Contact from '../../components/Contact/Contact'

const Home = ({ login, setLogin, techpro, setTechpro }) => {
  return (
    <div>
      <Hero />
      <div id="about">
        <About />
      </div>
      <Contact />
    </div>
  )
}

export default Home
