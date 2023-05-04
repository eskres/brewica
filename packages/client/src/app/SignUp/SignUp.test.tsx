import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUp from './SignUp';

describe('Sign Up', () => {
    it('renders sign up form', () => {
        render(<SignUp />);

        const modal = screen.getByRole('dialog');
        const username = screen.getByLabelText('Username');
        const email = screen.getByLabelText('Email address');
        const password = screen.getByLabelText('Password');
        const passwordConfirm = screen.getByLabelText('Confirm password');
        const submit = screen.getByRole('button', {name: 'Submit'});

        expect(modal).toHaveClass('modal');
        expect(username).toBeInTheDocument();
        expect(email).toBeInTheDocument();
        expect(password).toBeInTheDocument();
        expect(passwordConfirm).toBeInTheDocument();
        expect(submit).toBeInTheDocument();
    });
});