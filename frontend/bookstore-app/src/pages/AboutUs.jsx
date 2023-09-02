import React from 'react';
import Navbar from '../components/Navbar';

const AboutUs = () => {
  return (
    <>
    <Navbar />
    <div className="about-us">
      <h1>About Us</h1>
      <p>Welcome to our bookstore! We are an international business that has been serving the community for over 20 years.</p>
      <p>Our mission is to provide a wide selection of books at affordable prices, while also supporting local authors and publishers.</p>
      <p> <p>For more information, contact us at info@bookstore.com or pay us a visit at 123 Fiction Avenue, Imaginary Town. We look forward to embarking on a literary adventure with you!</p></p>
    </div>
    </>
  );
};

export default AboutUs;