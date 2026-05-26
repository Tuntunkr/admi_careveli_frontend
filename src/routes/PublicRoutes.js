import React from "react";
import Forbidden from "../pages/Forbidden";
import ForgotPassword from "../pages/ForgotPassword";
import InternalServerError from "../pages/InternalServerError";
import NotFound from "../pages/NotFound";
import ServiceUnavailable from "../pages/ServiceUnavailable";
import Signin2 from "../pages/Signin2";
import VerifyAccount from "../pages/VerifyAccount";
import Logout from "../pages/Logout";

const publicRoutes = [
  { path: "login", element: <Signin2 /> },
  { path: "logout", element: <Logout /> },
  { path: "verify", element: <VerifyAccount /> },
  { path: "pages/forgot", element: <ForgotPassword /> },
  { path: "pages/error-404", element: <NotFound /> },
  { path: "pages/error-500", element: <InternalServerError /> },
  { path: "pages/error-503", element: <ServiceUnavailable /> },
  { path: "pages/error-505", element: <Forbidden /> }
];

export default publicRoutes;