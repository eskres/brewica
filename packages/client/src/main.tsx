import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from "react-router-dom";
import router from './router';
import SignUp from './app/shared/NavBar/SignUp';
import SignIn from './app/shared/NavBar/SignIn';
import handleSignIn from './app/shared/NavBar/handleSignIn';
import handleSignUp from './app/shared/NavBar/handleSignUp';
import 'bootstrap';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
    <SignUp handleSignUp={handleSignUp}/>
    <SignIn handleSignIn={handleSignIn}/>
  </StrictMode>
);