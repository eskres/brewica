import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignIn from './SignIn';

describe('Sign In', () => {
    it('renders sign in form', () => {
        render(<SignIn />);

        const modal = screen.getByRole('dialog');
        const email = screen.getByLabelText('Email');
        const password = screen.getByLabelText('Password');
        const submit = screen.getByRole('button', {name: 'Submit'});

        expect(modal).toHaveClass('modal');
        expect(email).toBeInTheDocument();
        expect(password).toBeInTheDocument();
        expect(submit).toBeInTheDocument();
    });
});