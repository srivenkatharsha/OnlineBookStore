import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Navbar from '../components/Navbar';
import api from '../services/api';



const defaultTheme = createTheme();

export default function SignUp() {
    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const userName = data.get('userName');
        const email = data.get('email');
        const password = data.get('password');
        const confirmPassword = data.get('confirm-password');

        if (password !== confirmPassword) {
            // Show an alert if passwords do not match
            window.alert('Passwords do not match. Please check again.');
            return;
        }
        try {
            // Make the POST request to register the user
            const response = await api.post('/api/auth/register', {
                username: userName,
                email: email,
                password: password,
            });

            if (response.data.message === 'User registered successfully') {
                // Show a confirmation dialog
                const shouldLoginNow = window.confirm('User registered successfully. Do you want to login now?');

                if (shouldLoginNow) {
                    // Redirect to the signin route
                    window.location.href = '/signin';
                } else {
                    // Redirect to the home route
                    window.location.href = '/home';
                }
            } else {
                // Handle unexpected response
                console.log('Unexpected response:', response.data);
            }
        } catch (error) {
            // Handle error
            if (error.response && error.response.status === 400) {
                // Handle specific 400 error scenario
                const errorMessage = error.response.data.error;
                window.alert(errorMessage);
            } else {
                console.error('Error:', error);
            }
        }
    };

    return (
        <>
            <Navbar />
            <ThemeProvider theme={defaultTheme}>
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box
                        sx={{
                            marginTop: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign up
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={12}>
                                    <TextField
                                        autoComplete="given-name"
                                        name="userName"
                                        required
                                        fullWidth
                                        id="userName"
                                        label="Username"
                                        autoFocus
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type="password"
                                        id="password"
                                        autoComplete="new-password"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="confirm-password"
                                        label="Confirm Password"
                                        type="password"
                                        id="confirm-password"
                                        autoComplete="new-password"
                                    />
                                </Grid>
                            </Grid>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Sign Up
                            </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <Link href="/signin" variant="body2">
                                        Already have an account? Sign in
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Container>
            </ThemeProvider>
        </>
    );
}
