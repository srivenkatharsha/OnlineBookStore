import React from 'react';
import NavbarAdmin from '../components/NavbarAdmin'
import BookAdminDisplay from '../components/BookAdminDisplay';

function Dashboard() {
    return (
        <>
        <NavbarAdmin />
        <h2>Books Collection:</h2>
        <BookAdminDisplay />
        </>
    );
};

export default Dashboard;