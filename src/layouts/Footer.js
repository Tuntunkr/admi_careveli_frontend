import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div className="main-footer">
      <span>&copy; 2026. CAREVALI . All Rights Reserved.</span>
      <span>Design and crafted by: <Link to="https://holisticecommerce.com/" target="_blank">Holistic</Link></span>
    </div>
  )
}

