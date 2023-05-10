import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUp from './SignUp';
import axios from 'axios';

describe('Sign Up', () => {
    it('renders sign up form', () => {
        render(<SignUp />);

        const modal = screen.getByLabelText('Sign up');
        const username = screen.getByLabelText('Username');
        const email = screen.getByLabelText('Email address');
        const password = screen.getByLabelText('Password');
        const passwordConfirm = screen.getByLabelText('Confirm password');
        const submit = screen.getByLabelText('Submit');
        const cancel = screen.getByLabelText('Cancel');

        expect(modal).toHaveClass('modal');
        expect(username).toBeInTheDocument();
        expect(email).toBeInTheDocument();
        expect(password).toBeInTheDocument();
        expect(passwordConfirm).toBeInTheDocument();
        expect(submit).toBeInTheDocument();
        expect(cancel).toBeInTheDocument();
    });
    it('submit sign up form and have request rejected', () => {
        vi.mock('axios')
        axios.post = vi.fn().mockRejectedValue('request rejected')

        render(<SignUp />);

        const modal = screen.getByLabelText('Sign up');
        const username = screen.getByLabelText('Username');
        const email = screen.getByLabelText('Email address');
        const password = screen.getByLabelText('Password');
        const passwordConfirm = screen.getByLabelText('Confirm password');
        const submit = screen.getByLabelText('Submit');
        const cancel = screen.getByLabelText('Cancel');

        expect(modal).toHaveClass('modal');
        expect(username).toBeInTheDocument();
        expect(email).toBeInTheDocument();
        expect(password).toBeInTheDocument();
        expect(passwordConfirm).toBeInTheDocument();
        expect(submit).toBeInTheDocument();
        expect(cancel).toBeInTheDocument();

        fireEvent.click(submit);

        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(axios.post).rejects.toEqual('request rejected');
    });
});