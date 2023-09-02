// src/App.js
import React from 'react';
import Homepage from './pages/homepage';
import AboutUs from './pages/AboutUs';
// import Slideshow from './components/Slideshow'
import './App.css'; // Import your custom styles
import SignUp from './pages/SignUp';

import { BrowserRouter, Route, Routes , Navigate } from 'react-router-dom'
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Reviews from '../src/components/Reviews'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path='/home' Component={Homepage} />
        <Route path='/about' Component={AboutUs} />
        <Route path='/get-started' Component={SignUp} />
        <Route path='/signin' Component={SignIn} />
        <Route path='/dashboard' Component={Dashboard} />
        <Route path="/review/:isbn" Component={Reviews} />
        <Route path="/admin/dashboard" Component={AdminDashboard} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
