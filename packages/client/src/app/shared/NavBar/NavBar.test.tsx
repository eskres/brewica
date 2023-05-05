import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavBar from './NavBar';
import SignUp from '../../SignUp/SignUp';
import SignIn from '../../SignIn/SignIn';

describe('Navbar component', () => {
  it('should render a navbar with sign up and sign in links', () => {
    render(<NavBar />);
    
    const signUp = screen.getByRole('button', { name: 'Sign up' });
    const signIn = screen.getByRole('button', { name: 'Sign in' });

    expect(signUp).toBeInTheDocument();
    expect(signIn).toBeInTheDocument();
  });

  it('should open the sign up modal', () => {
    render(
      <>
        <NavBar />
        <SignUp />
      </>
    );

    const signUp = screen.getByRole('button', { name: 'Sign up' });

    fireEvent.click(signUp);

    // const heading = screen.getByRole('heading', {level: 1});
    const modal = screen.getByLabelText('Sign up');

    expect(modal).toHaveClass('modal');
    // expect(heading).toBe('Sign up')
  });

  it('should open the sign in modal', () => {
    render(
      <>
        <NavBar />
        <SignIn />
      </>
    );

    const signIn = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.click(signIn);

    // const heading = screen.getByRole('heading', {level: 1});
    const modal = screen.getByLabelText('Sign in');

    expect(modal).toHaveClass('modal');
    // expect(heading).toBe('Sign in')
  });
});