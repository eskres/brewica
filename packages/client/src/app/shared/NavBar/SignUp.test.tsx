import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
        const username: HTMLInputElement = screen.getByLabelText('Username');
        const email: HTMLInputElement = screen.getByLabelText('Email address');
        const password: HTMLInputElement = screen.getByLabelText('Password');
        const passwordConfirm: HTMLInputElement = screen.getByLabelText('Confirm password');
        const submit = screen.getByLabelText('Submit');
        const cancel = screen.getByLabelText('Cancel');

        expect(modal).toHaveClass('modal');
        expect(username).toBeInTheDocument();
        expect(email).toBeInTheDocument();
        expect(password).toBeInTheDocument();
        expect(passwordConfirm).toBeInTheDocument();
        expect(submit).toBeInTheDocument();
        expect(cancel).toBeInTheDocument();

        userEvent.type(username, 'test123');
        userEvent.type(email, 'test@test.com');
        userEvent.type(password, 'password');
        userEvent.type(passwordConfirm, 'password');
        
        expect(username.value).toEqual('test@test.com')
        expect(email.value).toEqual('test@test.com')
        expect(password.value).toEqual('password')
        expect(passwordConfirm.value).toEqual('password')

        fireEvent.click(submit);

        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(axios.post).rejects.toEqual('request rejected');
    });
});