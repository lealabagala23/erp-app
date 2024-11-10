import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
// import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { SitemarkIcon } from '../../CustomIcons';
import ColorModeSelect from '../../theme/ColorModeSelect';
import { useNavigate } from 'react-router-dom';
import SuccessSnackbar from '../common/SuccessSnackbar';
import { useMutation } from '@tanstack/react-query';
import { signUp } from './apis';
import { CircularProgress } from '@mui/material';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignupContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function Signup() {
  const navigate = useNavigate();
  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const { isLoading, mutateAsync: mutateSignupAsync } = useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      setOpen(true);
      setTimeout(() => navigate('/log-in'), 2000); // Navigate to login
    },
    onError: (err) => {
      console.error(err);
      setPasswordErrorMessage('Failed to register. Please try again.');
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (usernameError || passwordError) {
      return;
    }
    const data = new FormData(event.currentTarget);

    await mutateSignupAsync({
      first_name: data.get('firstName') as string,
      last_name: data.get('lastName') as string,
      username: data.get('username') as string,
      password: data.get('password') as string,
    });
  };

  const validateInputs = () => {
    const username = document.getElementById('username') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;

    let isValid = true;

    if (!username.value || username.value.length < 4) {
      setUsernameError(true);
      setUsernameErrorMessage('Username must be at least 4 characters long.');
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  return (
    <SignupContainer direction="column" justifyContent="space-between">
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <Card variant="outlined">
        <SitemarkIcon />
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          Sign up
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="firstName">First Name</FormLabel>
            <TextField
              id="firstName"
              type="firstName"
              name="firstName"
              autoComplete="firstName"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={'primary'}
              sx={{ ariaLabel: 'firstName' }}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="firstName">Last Name</FormLabel>
            <TextField
              id="lastName"
              type="lastName"
              name="lastName"
              autoComplete="lastName"
              required
              fullWidth
              variant="outlined"
              color={'primary'}
              sx={{ ariaLabel: 'lastName' }}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="username">Username</FormLabel>
            <TextField
              error={usernameError}
              helperText={usernameErrorMessage}
              id="username"
              type="username"
              name="username"
              autoComplete="username"
              required
              fullWidth
              variant="outlined"
              color={usernameError ? 'error' : 'primary'}
              sx={{ ariaLabel: 'username' }}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              required
              fullWidth
              variant="outlined"
              color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={validateInputs}
            endIcon={
              isLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {isLoading ? 'Signing up...' : 'Sign up'}
          </Button>
          <Typography sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <span>
              <Link href="/log-in" variant="body2" sx={{ alignSelf: 'center' }}>
                Log in
              </Link>
            </span>
          </Typography>
        </Box>
      </Card>
      <SuccessSnackbar
        open={open}
        setOpen={setOpen}
        message="User created successfully."
      />
    </SignupContainer>
  );
}
