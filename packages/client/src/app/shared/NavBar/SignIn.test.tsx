import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignIn from './SignIn';
import axios from 'axios';

describe('Sign In', () => {
    it('renders sign in form', () => {
        render(<SignIn />);

        const modal = screen.getByLabelText('Sign in');
        const email = screen.getByLabelText('Email address');
        const password = screen.getByLabelText('Password');
        const submit = screen.getByLabelText('Submit');
        const cancel = screen.getByLabelText('Cancel');

        expect(modal).toHaveClass('modal');
        expect(email).toBeInTheDocument();
        expect(password).toBeInTheDocument();
        expect(submit).toBeInTheDocument();
        expect(cancel).toBeInTheDocument();
    });

    it('submit sign in form and have request rejected', () => {
        vi.mock('axios')
        axios.post = vi.fn().mockRejectedValue('request rejected')
        
        render(<SignIn />);

        const modal = screen.getByLabelText('Sign in');
        const email = screen.getByLabelText('Email address');
        const password = screen.getByLabelText('Password');
        const submit = screen.getByLabelText('Submit');
        const cancel = screen.getByLabelText('Cancel');

        expect(modal).toHaveClass('modal');
        expect(email).toBeInTheDocument();
        expect(password).toBeInTheDocument();
        expect(submit).toBeInTheDocument();
        expect(cancel).toBeInTheDocument();

        fireEvent.click(submit);

        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(axios.post).rejects.toEqual('request rejected');
    });
});