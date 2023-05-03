import { createBrowserRouter } from "react-router-dom";
import Home from './app/Home/Home';
import SignUp from './app/SignUp/SignUp';
import SignIn from "./app/SignIn/SignIn";

const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />
    },
    {
      path: "/sign-up",
      element: <SignUp />
    },
    {
      path: "/sign-in",
      element: <SignIn />
    },
]);

export default router;