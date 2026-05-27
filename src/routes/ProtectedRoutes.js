import React from "react";

// Dashboard
import FinanceMonitoring from "../dashboard/FinanceMonitoring";
import AdminDashboard from "../pages/AdminDashboard";

// pages
import Category from "../pages/Category";
import SubCategory from "../pages/subCategory";
import PetCategory from "../pages/PetCategory";
import Recommended from "../pages/Recommended";
import Registerd_Pet from "../pages/Registerd_Pet";
import Registered from "../pages/Registered";
import BlogEditor from "../pages/Blog";
import BannerManagement from "../pages/Banner";
import Feedback from "../pages/feedback";
import Product from "../pages/Product";
import Contact from "../pages/Contact";
import Newsletter from "../pages/Newsletter";
import Order from "../pages/Order";
import Testimonial from "../pages/Testimonial";
import MarketingLinks from "../pages/Marketing/MarketingLinks";
import PaymentHistory from "../pages/Payment/PaymentHistory";
import SpotlightManagement from "../pages/Spotlight";

const protectedRoutes = [
  { path: "/", element: <FinanceMonitoring /> },
  { path: "/admin/dashboard", element: <AdminDashboard /> },
  { path: "/category", element: <Category /> },
  { path: "/subCategory", element: <SubCategory /> },
  { path: "/petCategory", element: <PetCategory /> },
  { path: "/recommended", element: <Recommended /> },
  { path: "/registered_pet", element: <Registerd_Pet /> },
  { path: "/feedback", element: <Feedback /> },
  { path: "/registered", element: <Registered /> },
  { path: "/blog-editor", element: <BlogEditor /> },
  { path: "/product", element: <Product /> },
  { path: "/banner", element: <BannerManagement /> },
  { path: "/contact", element: <Contact /> },
  { path: "/newsletter", element: <Newsletter /> },
  { path: "/order", element: <Order /> },
  { path: "/testimonial", element: <Testimonial /> },
  { path: "/marketing-links", element: <MarketingLinks /> },
  { path: "/payment-history", element: <PaymentHistory /> },
  { path: "/spotlight", element: <SpotlightManagement /> }
];

export default protectedRoutes;