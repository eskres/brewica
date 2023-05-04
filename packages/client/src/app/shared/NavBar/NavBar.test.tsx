import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavBar from './NavBar';

describe('Navbar component', () => {
  it('should render a navbar with sign up and sign in links', () => {
    render(<NavBar />);
    
    const signUp = screen.getByRole('button', { name: 'Sign Up' });
    const signIn = screen.getByRole('button', { name: 'Sign In' });

    expect(signUp).toBeInTheDocument();
    expect(signIn).toBeInTheDocument();
  });

  it('should open the sign up modal', () => {
    render(<NavBar />);

    const signUp = screen.getByRole('button', { name: 'Sign Up' });

    fireEvent.click(signUp);

    const modal = screen.getByRole('dialog');
    const heading = screen.getByRole('heading', {level: 5});

    expect(modal).toHaveClass('modal');
    expect(heading).toBe('Sign up')
  });

  it('should open the sign in modal', () => {
    render(<NavBar />);

    const signIn = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.click(signIn);

    const modal = screen.getByRole('dialog');
    const heading = screen.getByRole('heading', {level: 5});

    expect(modal).toHaveClass('modal');
    expect(heading).toBe('Sign in')
  });
});