import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavBar from './NavBar';

describe('Navbar component', () => {
  it('should render a navbar with sign up and sign in links', () => {
    render(<NavBar />);
    const signUp = screen.getByRole('link', { name: 'Sign Up' });
    const signIn = screen.getByRole('link', { name: 'Sign In' });

    expect(signUp).toBeInTheDocument();
    expect(signIn).toBeInTheDocument();
  });

  it('should navigate to the correct page on link click', () => {
    render(<NavBar />);
    const signUp = screen.getByRole('link', { name: 'Sign Up' });
    const signIn = screen.getByRole('link', { name: 'Sign In' });

    fireEvent.click(signUp);
    expect(window.location.pathname).toBe('/sign-up');

    fireEvent.click(signIn);
    expect(window.location.pathname).toBe('/sign-in');
  });
});