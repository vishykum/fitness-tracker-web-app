import { useState, useEffect } from 'react'
import Home from "./pages/Home/Home"
import Layout from './pages/Layout/Layout'
import Register from './pages/Register/Register'
import Login from './pages/Login/Login'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from './components/Navbar'
import './App.css'
import axios from 'axios'

function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  //Check if there is an active session already
  useEffect(() => {
    console.log("Checking if active session exists");

    axios.get(`${import.meta.env.VITE_APP_SERVER_PATH}/`, {withCredentials: true})
    .then((response) => {
      if (response.status === 200) {
          if (response.data.data.username) {
            setUsername(response.data.data.username);
            console.log("Session details updated successfully");
          }
        }
    }).catch((err) => {
        console.error("Error accessing GET /: ", err);
    });

  }, []);
  
  return (
    <>
    <BrowserRouter>
    <div className="flex flex-col justify-start h-screen w-screen">
      <div className="sticky w-screen top-0">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} isLoggedIn={username} setLoggedIn={setUsername}/>
      </div>
      <div className='h-screen w-screen overflow-auto'>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home darkMode={darkMode} isLoggedIn={username}/>} />
            <Route path="register" element={<Register isLoggedIn={username} setLoggedIn={setUsername}/>} />
            <Route path="login" element={<Login isLoggedIn={username} setLoggedIn={setUsername}/>} />
          </Route>
        </Routes>
      </div>
    </div>
    </BrowserRouter>
    </>
  )
}

export default App
