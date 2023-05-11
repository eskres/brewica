import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
        await user.type(password, 'password');
        await user.type(passwordConfirm, 'password');
        
        expect(username.value).toEqual('test123');
        expect(email.value).toEqual('test@test.com');
        expect(password.value).toEqual('password');
        expect(passwordConfirm.value).toEqual('password');

        fireEvent.click(submit);

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith('/auth/signup', {
            username: 'test123',
            emailAddress: 'test@test.com',
            password: 'password',
            passwordConf: 'password'
        });
    },);
});