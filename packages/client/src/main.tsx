import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from "react-router-dom";
import router from './router';
import SignUp from './app/shared/NavBar/SignUp';
import SignIn from './app/shared/NavBar/SignIn';
import 'bootstrap';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
    <SignUp />
    <SignIn />
  </StrictMode>
);