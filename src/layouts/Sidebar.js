import React, { Component, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import PerfectScrollbar from "react-perfect-scrollbar";
import userAvatar from "../assets/img/img1.png";

import { useSelector } from "react-redux";

export default function Sidebar() {
    const scrollBarRef = useRef();
    const user = useSelector(state => state.user);

    const toggleFooterMenu = (e) => {
        e.preventDefault();

        let parent = e.target.closest(".sidebar");
        parent.classList.toggle("footer-menu-show");
    }

    console.log("user", user);

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <Link to="/" className="sidebar-logo">
                    <img src={require("../assets/images/logo.jpeg")} />
                </Link>
            </div>
            <PerfectScrollbar className="sidebar-body" ref={scrollBarRef}>
                <SidebarMenu onUpdateSize={() => scrollBarRef.current?.updateScroll()} />
            </PerfectScrollbar>
            <div className="sidebar-footer">
                <div className="sidebar-footer-top">
                    <div className="sidebar-footer-thumb">
                        <img src={userAvatar} alt="" />
                    </div>
                    <div className="sidebar-footer-body">
                        <h6><Link onClick={toggleFooterMenu} to="" >CAREVALI Admin</Link></h6>
                        <p>{user?.role}</p>
                    </div>
                    <Link onClick={toggleFooterMenu} to="" className="dropdown-link"><b><i className="ri-arrow-down-s-line"></i></b></Link>
                </div>
                <div className="sidebar-footer-menu">
                    <nav className="nav">
                    </nav>
                    <hr />
                    <nav className="nav">
                        <Link to="/logout"><i className="ri-logout-box-r-line"></i> Log Out</Link>
                    </nav>
                </div>
            </div>
        </div>
    )
}

class SidebarMenu extends Component {
    populateMenu = (m) => {
        const menu = m.map((m, key) => {
            let sm;
            if (m.submenu) {
                sm = m.submenu.map((sm, key) => {
                    return (
                        <NavLink to={sm.link} className="nav-sub-link" style={{ userSelect: 'none' }} key={key}>{sm.label}</NavLink>
                    )
                })
            }

            return (
                <li key={key} className="nav-item">
                    {(!sm) ? (
                        <NavLink to={m.link} className="nav-link"><i className={m.icon} style={{ fontSize: 12, paddingRight: 6 }}></i> <span style={{ userSelect: 'none' }}>{m.label}</span></NavLink>
                    ) : (
                        <div onClick={this.toggleSubMenu} className="nav-link has-sub"><i className={m.icon}></i> <span style={{ userSelect: 'none', fontSize: 12 }}>{m.label}</span></div>
                    )}
                    {m.submenu && <nav className="nav nav-sub">{sm}</nav>}
                </li>
            )
        });
        return (
            <ul className="nav nav-sidebar">
                {menu}
            </ul>
        );
    }

    // Toggle menu group
    toggleMenu = (e) => {
        e.preventDefault();

        let parent = e.target.closest('.nav-group');
        parent.classList.toggle('show');

        this.props.onUpdateSize();
    }

    // Toggle submenu while closing siblings' submenu
    toggleSubMenu = (e) => {
        e.preventDefault();

        let parent = e.target.closest('.nav-item');
        let node = parent.parentNode.firstChild;

        while (node) {
            if (node !== parent && node.nodeType === Node.ELEMENT_NODE)
                node.classList.remove('show');
            node = node.nextElementSibling || node.nextSibling;
        }

        parent.classList.toggle('show');

        this.props.onUpdateSize();
    }

    render() {
        return (
            <React.Fragment>
                {/* <div className="nav-group show">
                    <ul className="nav nav-sidebar py-0">
                        <li className="nav-item">
                            <NavLink to="" className="nav-link"><i className={"ri-home-3-line"}></i> <span style={{ userSelect: 'none' }}>Dashboard</span></NavLink>
                        </li>
                    </ul>
                </div> */}
                <div className="nav-label nav-label--static">OVERVIEW</div>
                <div className="nav-group show">
                    <ul className="nav nav-sidebar py-0">
                        <li className="nav-item">
                            <NavLink to="/admin/dashboard" className="nav-link"><i className={"ri-dashboard-line"} style={{ fontSize: 16 }}></i> <span style={{ userSelect: 'none' }}>ADMIN STATISTICS</span></NavLink>
                        </li>
                    </ul>
                </div>

                <div className="nav-label nav-label--static">CATALOG</div>
                <div className="nav-group show">
                    <ul className="nav nav-sidebar py-0">
                        <li className="nav-item">
                            <NavLink to="/category" className="nav-link"><i className={"fa fa-shapes"} style={{ fontSize: 16 }}></i> <span style={{ userSelect: 'none' }}>CATEGORIES</span></NavLink>
                        </li>
                    </ul>
                </div>
                <div className="nav-group show">
                    <ul className="nav nav-sidebar py-0">
                        <li className="nav-item">
                            <NavLink to="/product" className="nav-link"><i className={"fa fa-shopping-bag"} style={{ fontSize: 16 }}></i> <span style={{ userSelect: 'none' }}>PRODUCTS</span></NavLink>
                        </li>
                    </ul>
                </div>

                <div className="nav-label nav-label--static">SALES</div>
                <div className="nav-group show">
                    <ul className="nav nav-sidebar py-0">
                        <li className="nav-item">
                            <NavLink to="/order" className="nav-link"><i className={"ri-shopping-cart-2-line"} style={{ fontSize: 16 }}></i> <span style={{ userSelect: 'none' }}>ORDERS</span></NavLink>
                        </li>
                    </ul>
                </div>
                <div className="nav-group show">
                    <ul className="nav nav-sidebar py-0">
                        <li className="nav-item">
                            <NavLink to="/registered" className="nav-link"><i className={"fa fa-registered"} style={{ fontSize: 16 }}></i> <span style={{ userSelect: 'none' }}>REGISTERED USERS</span></NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/affiliate-users" className="nav-link"><i className={"ri-user-star-line"} style={{ fontSize: 16 }}></i> <span style={{ userSelect: 'none' }}>AFFILIATE USERS</span></NavLink>
                        </li>
                    </ul>
                </div>

                <div className="nav-label nav-label--static">CONTENT</div>
                <div className="nav-group show">
                    <ul className="nav nav-sidebar py-0">
                        <li className="nav-item">
                            <NavLink to="/banner" className="nav-link"><i className={"ri-image-2-line"} style={{ fontSize: 16 }}></i> <span style={{ userSelect: 'none' }}>BANNERS</span></NavLink>
                        </li>
                    </ul>
                </div>

                <div className="nav-group show">
                    <ul className="nav nav-sidebar py-0">
                        <li className="nav-item">
                            <NavLink to="/spotlight" className="nav-link"><i className={"ri-video-line"} style={{ fontSize: 16 }}></i> <span style={{ userSelect: 'none' }}>SPOTLIGHT</span></NavLink>
                        </li>
                    </ul>
                </div>

                <div className="nav-group show">
                    <ul className="nav nav-sidebar py-0">
                        <li className="nav-item">
                            <NavLink to="/blog-editor" className="nav-link"><i className={"ri-article-line"} style={{ fontSize: 16 }}></i> <span style={{ userSelect: 'none' }}>BLOGS</span></NavLink>
                        </li>
                    </ul>
                </div>

                <div className="nav-label nav-label--static">MESSAGES</div>
                <div className="nav-group show">
                    <ul className="nav nav-sidebar py-0">
                        <li className="nav-item">
                            <NavLink to="/contact" className="nav-link"><i className={"fa fa-envelope"} style={{ fontSize: 16 }}></i> <span style={{ userSelect: 'none' }}>CONTACT MESSAGES</span></NavLink>
                        </li>
                    </ul>
                </div>

                <div className="nav-group show">
                    <ul className="nav nav-sidebar py-0">
                        <li className="nav-item">
                            <NavLink to="/testimonial" className="nav-link"><i className={"fa fa-comments"} style={{ fontSize: 16 }}></i> <span style={{ userSelect: 'none' }}>TESTIMONIALS</span></NavLink>
                        </li>
                    </ul>
                </div>

                <div className="nav-group show">
                    <ul className="nav nav-sidebar py-0">
                        <li className="nav-item">
                            <NavLink to="/newsletter" className="nav-link"><i className={"ri-mail-send-line"} style={{ fontSize: 16 }}></i> <span style={{ userSelect: 'none' }}>NEWSLETTER</span></NavLink>
                        </li>
                    </ul>
                </div>

                <div className="nav-label nav-label--static">MARKETING</div>
                <div className="nav-group show">
                    <ul className="nav nav-sidebar py-0">
                        <li className="nav-item">
                            <NavLink to="/marketing-links" className="nav-link"><i className={"ri-links-line"} style={{ fontSize: 16 }}></i> <span style={{ userSelect: 'none' }}>MARKETING LINKS</span></NavLink>
                        </li>
                    </ul>
                </div>

                <div className="nav-group show">
                    <ul className="nav nav-sidebar py-0">
                        <li className="nav-item">
                            <NavLink to="/payment-history" className="nav-link"><i className={"ri-money-dollar-circle-line"} style={{ fontSize: 16 }}></i> <span style={{ userSelect: 'none' }}>PAYMENT HISTORY</span></NavLink>
                        </li>
                    </ul>
                </div>

                {/* <div className="nav-group show">
                    <ul className="nav nav-sidebar py-0">
                        <li className="nav-item">
                            <NavLink to="/feedback" className="nav-link"><i className={"fa fa-comments"} style={{ fontSize: 16 }}></i> <span style={{ userSelect: 'none' }}>FEEDBACK</span></NavLink>
                        </li>
                    </ul>
                </div> */}
            </React.Fragment >
        )
    }
}

window.addEventListener("click", function (e) {
    // Close sidebar footer menu when clicked outside of it
    let tar = e.target;
    let sidebar = document.querySelector(".sidebar");
    if (!tar.closest(".sidebar-footer") && sidebar) {
        sidebar.classList.remove("footer-menu-show");
    }

    // Hide sidebar offset when clicked outside of sidebar
    if (!tar.closest(".sidebar") && !tar.closest(".menu-link")) {
        document.querySelector("body").classList.remove("sidebar-show");
    }
});

window.addEventListener("load", function () {
    let skinMode = localStorage.getItem("sidebar-skin");
    let HTMLTag = document.querySelector("html");

    if (skinMode) {
        HTMLTag.setAttribute("data-sidebar", skinMode);
    }
});