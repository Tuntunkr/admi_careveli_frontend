import React from "react";

// Dashboard
import FinanceMonitoring from "../dashboard/FinanceMonitoring";
import AdminDashboard from "../pages/AdminDashboard";

// pages
import Category from "../pages/Category";
import SubCategory from "../pages/subCategory";
import PetCategory from "../pages/PetCategory";
import Recommended from "../pages/Recommended";
import RegisteredPet from "../pages/Registerd_Pet";
import Feedback from "../pages/feedback";
import Registered from "../pages/Registered";
import Product from "../pages/Product";
import Banner from "../pages/Banner";
import Contact from "../pages/Contact";
import Newsletter from "../pages/Newsletter";
import Order from "../pages/Order";
import Testimonial from "../pages/Testimonial";
import BlogEditor from "../pages/AdminDashboard/Blog";
import MarketingLinks from "../pages/Marketing/MarketingLinks";
import PaymentHistory from "../pages/Payment/PaymentHistory";

const protectedRoutes = [
  { path: "/", element: <FinanceMonitoring /> },
  { path: "/admin/dashboard", element: <AdminDashboard /> },
  { path: "/category", element: <Category /> },
  { path: "/subCategory", element: <SubCategory /> },
  { path: "/petCategory", element: <PetCategory /> },
  { path: "/recommended", element: <Recommended /> },
  { path: "/registered_pet", element: <RegisteredPet /> },
  { path: "/feedback", element: <Feedback /> },
  { path: "/registered", element: <Registered /> },
  { path: "/product", element: <Product /> },
  { path: "/banner", element: <Banner /> },
  { path: "/contact", element: <Contact /> },
  { path: "/newsletter", element: <Newsletter /> },
  { path: "/order", element: <Order /> },
  { path: "/testimonial", element: <Testimonial /> },
  { path: "/marketing-links", element: <MarketingLinks /> },
  { path: "/payment-history", element: <PaymentHistory /> }
];

export default protectedRoutes;