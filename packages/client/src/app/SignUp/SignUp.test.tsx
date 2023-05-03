import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import SignUp from './SignUp';

describe('Sign Up', () => {
    it('renders sign up form', () => {
        
        const signUp = render(
            <BrowserRouter>
                <SignUp/>
            </BrowserRouter>
        );

        const username = screen.getByLabelText('Username');
        const email = screen.getByLabelText('Email address');
        const password = screen.getByLabelText('Password');
        const passwordConfirm = screen.getByLabelText('Confirm password');
        const submit = screen.getByRole('button', {name: 'Submit'});

        expect(signUp).toBeTruthy();
        expect(username).toBeInTheDocument();
        expect(email).toBeInTheDocument();
        expect(password).toBeInTheDocument();
        expect(passwordConfirm).toBeInTheDocument();
        expect(submit).toBeInTheDocument();
    });
});