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

export default function SignIn() {
    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const userName = data.get('userName');
        const email = data.get('email');
        const password = data.get('password');

        try {
            // Make the POST request to register the user
            const response = await api.post('/api/auth/login', {
                username: userName,
                email: email,
                password: password,
            });

            if (response.data.message === 'Logged in successfully') {
                // After successful login storing the username in sessionStorage
                sessionStorage.setItem('username', userName);
                if(sessionStorage.getItem('username') === 'admin'){
                    window.location.href = '/admin/dashboard';
                }
                else{
                    window.location.href = '/dashboard';
                }
            } else {
                // Handle unexpected response
                console.log('Unexpected response:', response.data);
            }
        } catch (error) {
            // Handle error
            if ((error.response && error.response.status === 400) || (error.response && error.response.status === 401)) {
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
                        <Avatar sx={{ m: 1, bgcolor: 'blue' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign In
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
                            </Grid>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Sign In
                            </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <Link href="/get-started" variant="body2">
                                        Don't have an account? Sign Up
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