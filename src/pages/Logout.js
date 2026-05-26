import React, { useEffect } from "react"
import { setUser } from "../store/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Logout = props => {
  const dispetch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    dispetch(setUser(null));
    navigate("/login");
  }, []);

  return <></>
}

export default Logout;
