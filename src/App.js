import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Main from './layouts/Main';
import NotFound from "./pages/NotFound";

import publicRoutes from "./routes/PublicRoutes";
import protectedRoutes from "./routes/ProtectedRoutes";

// import css
import "./assets/css/remixicon.css";
import "./assets/css/style.css";
// import 'font-awesome/css/font-awesome.min.css';
// import 'font-awesome/css/font-awesome.css';
import "./assets/fontawesome/css/all.min.css";
// import scss
import "./scss/style.scss";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { setUser } from "./store/userSlice";

// set skin on load
window.addEventListener("load", function () {
  let skinMode = localStorage.getItem("skin-mode");
  let HTMLTag = document.querySelector("html");

  if (skinMode) {
    HTMLTag.setAttribute("data-skin", skinMode);
  }
});

export default function App() {
  const user = useSelector((state) => state.user);
  const [isAuth, setIsAuth] = useState(localStorage.getItem("adminToken"));
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const adminUser = localStorage.getItem("adminUser");
    if (token && adminUser && adminUser !== "undefined") {
      try {
        setIsAuth(true);
        const user = JSON.parse(adminUser);
        dispatch(setUser({ ...user, token }));
      } catch (error) {
        console.error("Error parsing adminUser:", error);
        // Clear invalid data
        localStorage.removeItem("adminUser");
        localStorage.removeItem("adminToken");
        setIsAuth(false);
      }
    }
  }, []);

  useEffect(() => {
    if (user)
      setIsAuth(true);
  }, [user]);

  // console.log("User on app", localStorage.getItem("adminUser") || user);

  return (
    <React.Fragment>
      <ToastContainer />
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={isAuth ? <Main /> : <Navigate to="/login" />}>
            {protectedRoutes.map((route, index) => {
              return (
                <Route
                  path={route.path}
                  element={isAuth ? route.element : <Navigate to="/login" />}
                  key={index}
                />
              )
            })}
          </Route>
          {publicRoutes.map((route, index) => {
            return (
              <Route
                path={route.path}
                element={route.element}
                key={index}
              />
            )
          })}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  );
}