import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import SignIn from './SignIn';

describe('Sign In', () => {
    it('renders sign in form', () => {
        
        const signIn = render(
            <BrowserRouter>
                <SignIn/>
            </BrowserRouter>
        );


        const email = screen.getAllByLabelText('Email');
        const password = screen.getAllByLabelText('Password');
        const submit = screen.getByRole('button', {name: 'submit'});

        expect(signIn).toBeTruthy();
        expect(email).toBeInTheDocument();
        expect(password).toBeInTheDocument();
        expect(submit).toBeInTheDocument();
    });
});