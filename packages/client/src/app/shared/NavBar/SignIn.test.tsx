import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SignIn from './SignIn';
import axios from 'axios';
import { Mocked, vi } from 'vitest';

describe ('Sign In', () => {
    test('render sign in form, populate form and check onSubmit post request', async () => {
        const user = userEvent.setup();

        vi.mock('axios');
        const mockedAxios = axios as Mocked<typeof axios>;
        mockedAxios.post.mockResolvedValueOnce('pass');
        mockedAxios.post.mockRejectedValueOnce('fail');

        render(<SignIn />);

        const modal = screen.getByLabelText('Sign in');
        const email: HTMLInputElement = screen.getByLabelText('Email address');
        const password: HTMLInputElement = screen.getByLabelText('Password');
        const submit = screen.getByLabelText('Submit');
        const cancel = screen.getByLabelText('Cancel');
        
        expect(modal).toHaveClass('modal');
        expect(email).toBeInTheDocument();
        expect(password).toBeInTheDocument();
        expect(submit).toBeInTheDocument();
        expect(cancel).toBeInTheDocument();

        await user.type(email, 'test@test.com');
        await user.type(password, 'password');

        expect(email.value).toEqual('test@test.com');
        expect(password.value).toEqual('password');

        fireEvent.click(submit);

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith('/auth/signin', {
            emailAddress: 'test@test.com',
            password: 'password'
        });
    });

    test('check input validation on email field', async () => {
        const user = userEvent.setup();
        render(<SignIn />);

        const modal = screen.getByLabelText('Sign in');
        const email: HTMLInputElement = screen.getByLabelText('Email address');
        const password: HTMLInputElement = screen.getByLabelText('Password');
        
        expect(modal).toHaveClass('modal');
        expect(email).toBeInTheDocument();
        expect(password).toBeInTheDocument();

        await user.type(email, 'not_an_email');
        await user.click(password);

        const alert = screen.getByLabelText('Email error');
        expect(alert).toBeInTheDocument();
        expect(alert.textContent).toEqual('Not a valid email address');
    })
});