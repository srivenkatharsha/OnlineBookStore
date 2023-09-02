import React from 'react';
import NavbarVerified from '../components/NavbarVerified'
import BookDisplay from '../components/BookDisplay';

function Dashboard() {
    return (
        <>
        <NavbarVerified />
        <h2>Books Collection:</h2>
        <BookDisplay />
        </>
    );
};

export default Dashboard;