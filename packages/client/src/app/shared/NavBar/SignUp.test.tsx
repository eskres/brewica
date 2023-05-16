import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SignUp from './SignUp';
import axios from 'axios';
import { Mocked } from 'vitest';

describe('Sign Up', () => {
    test('render sign up form, populate form and check onSubmit post request', async () => {
        const user = userEvent.setup();

        vi.mock('axios');
        const mockedAxios = axios as Mocked<typeof axios>;
        mockedAxios.post.mockResolvedValueOnce('pass');
        mockedAxios.post.mockRejectedValueOnce('fail');

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

        await user.type(username, 'test123');
        await user.type(email, 'test@test.com');
        await user.type(password, 'password123!');
        await user.type(passwordConfirm, 'password123!');
        
        expect(username.value).toEqual('test123');
        expect(email.value).toEqual('test@test.com');
        expect(password.value).toEqual('password123!');
        expect(passwordConfirm.value).toEqual('password123!');

        fireEvent.click(submit);

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith('/auth/signup', {
            username: 'test123',
            emailAddress: 'test@test.com',
            password: 'password123!',
            passwordConf: 'password123!'
        });
    });

    test('check input validation on username field', async () => {
        const user = userEvent.setup();
        render(<SignUp />);

        const modal = screen.getByLabelText('Sign up');
        const username: HTMLInputElement = screen.getByLabelText('Username');
        
        expect(modal).toHaveClass('modal');
        expect(username).toBeInTheDocument();

        await user.type(username, 'Invalid%<>`');
        await user.tab();

        const alert = screen.getByLabelText('Username error');
        expect(alert).toBeInTheDocument();
        expect(alert.textContent).toEqual('Usernames must be no longer than 28 characters and are not case sensitive. Only letters, numbers, dashes and underscores are permitted');
    });

    test('check input validation on email field', async () => {
        const user = userEvent.setup();
        render(<SignUp />);

        const modal = screen.getByLabelText('Sign up');
        const email: HTMLInputElement = screen.getByLabelText('Email address');
        
        expect(modal).toHaveClass('modal');
        expect(email).toBeInTheDocument();

        await user.type(email, 'not_an_email');
        await user.tab();

        const alert = screen.getByLabelText('Email error');
        expect(alert).toBeInTheDocument();
        expect(alert.textContent).toEqual('Not a valid email address');
    });

    test('check input validation on password field', async () => {
        const user = userEvent.setup();
        render(<SignUp />);

        const modal = screen.getByLabelText('Sign up');
        const password: HTMLInputElement = screen.getByLabelText('Password');
        
        expect(modal).toHaveClass('modal');
        expect(password).toBeInTheDocument();

        await user.type(password, 'short');
        await user.tab();

        const alert = screen.getByLabelText('Password error');
        expect(alert).toBeInTheDocument();
        expect(alert.textContent).toEqual('Password requires 8 or more characters with a mix of letters, numbers & symbols');
    });

    test('check input validation on confirm password field', async () => {
        const user = userEvent.setup();
        render(<SignUp />);

        const modal = screen.getByLabelText('Sign up');
        const password: HTMLInputElement = screen.getByLabelText('Password');
        const confirmPassword: HTMLInputElement = screen.getByLabelText('Confirm password');
        
        expect(modal).toHaveClass('modal');
        expect(password).toBeInTheDocument();
        expect(confirmPassword).toBeInTheDocument();

        await user.type(password, 'matching');
        await user.tab();
        await user.type(confirmPassword, 'non_matching');
        await user.tab();

        const alert = screen.getByLabelText('Password confirmation error');
        expect(alert).toBeInTheDocument();
        expect(alert.textContent).toEqual('Passwords do not match');
    });
});