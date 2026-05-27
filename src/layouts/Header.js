import React, { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import userAvatar from "../assets/img/img1.png";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { Card, CardBody, Row, Col, Modal, ModalBody } from 'reactstrap'
import { Button } from 'react-bootstrap';
import { AvForm, AvField } from "availity-reactstrap-validation";
import { post } from "../helper/api_helper";
import * as Utils from "../Utils";
import { getPageMeta } from "../Utils/pageMeta";

export default function Header({ onSkin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(state => state.user);
  const userName = user?.name || user?.user?.name || 'Admin';
  const [isAdd, setIsAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [now, setNow] = useState(new Date());
  const pageMeta = getPageMeta(location.pathname);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = now.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <Link
      to=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      className="dropdown-link"
    >
      {children}
    </Link>
  ));

  const toggleSidebar = (e) => {
    e.preventDefault();
    let isOffset = document.body.classList.contains("sidebar-offset");
    if (isOffset) {
      document.body.classList.toggle("sidebar-show");
    } else {
      if (window.matchMedia("(max-width: 991px)").matches) {
        document.body.classList.toggle("sidebar-show");
      } else {
        document.body.classList.toggle("sidebar-hide");
      }
    }
  }

  const onPassChange = async (e, v) => {
    if (v?.newPass != v?.cPass) {
      toast.error("New Password and Confirm password didn't matched!");
      return;
    }
    if (!loading) {
      setLoading(true);
      let body = {
        ...v,
        token: user?.token
      }
      post("user/change_password", body)
        .then(res => {
          setLoading(false);
          if (res?.statusCode == 200) {
            setIsAdd(false);
            toast.success(res?.message);
            navigate("/logout");
          } else
            toast.error("" + res?.error);
        })
        .catch(err => {
          setLoading(false);
          console.error("error while updating data", err);
          toast.error("Something Went Wrong!");
        });
    }
  }

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    navigate(`/product?search=${encodeURIComponent(globalSearch.trim())}`);
  };

  return (
    <div className="header-main px-3 px-lg-4 admin-header">
      <Link onClick={toggleSidebar} className="menu-link me-2 me-lg-3" aria-label="Toggle menu">
        <i className="ri-menu-2-fill"></i>
      </Link>

      <div className="admin-header__title me-3 d-none d-md-block">
        <div className="admin-header__section text-secondary small">{pageMeta.section}</div>
        <h1 className="admin-header__page-title mb-0">{pageMeta.title}</h1>
      </div>

      <form className="admin-header__search me-auto d-none d-lg-flex" onSubmit={handleGlobalSearch}>
        <div className="form-search">
          <input
            type="search"
            className="form-control"
            placeholder="Search products…"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            aria-label="Global search"
          />
          <i className="ri-search-line"></i>
        </div>
      </form>

      <div className="admin-header__actions d-flex align-items-center gap-2 gap-lg-3 ms-auto">
        <span className="admin-header__datetime d-none d-xl-inline text-secondary small">
          <i className="ri-time-line me-1" />
          {formattedTime}
        </span>

        <button
          type="button"
          className="admin-header__icon-btn"
          title="Notifications"
          aria-label="Notifications"
        >
          <i className="ri-notification-3-line" />
          <span className="admin-header__badge">0</span>
        </button>

        <Dropdown className="dropdown-profile" align="end">
          <Dropdown.Toggle as={CustomToggle}>
            <div className="avatar online">
              <img src={userAvatar} alt="" />
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu className="mt-10-f">
            <div className="dropdown-menu-body">
              <div className="avatar avatar-xl online mb-3"><img src={userAvatar} alt="" /></div>
              <h5 className="mb-1 text-dark fw-semibold">{userName}</h5>
              <p className="fs-sm text-secondary">{user?.role || user?.user?.role}</p>
              <nav className="nav">
                <Link to="" onClick={(e) => { e.preventDefault(); setIsAdd(true); }}>
                  <i className="ri-lock-password-line"></i> Change Password
                </Link>
                <Link to="/logout"><i className="ri-logout-box-r-line"></i> Log Out</Link>
              </nav>
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Modal isOpen={isAdd} centered>
        <ModalBody>
          <Card>
            <CardBody>
              <AvForm onValidSubmit={onPassChange}>
                <div className='mb-4 mt-4'>
                  <AvField
                    name="oldPass"
                    label="Old password"
                    type="password"
                    placeholder="Enter old password"
                    required
                  />
                  <AvField
                    name="newPass"
                    label="New password"
                    type="password"
                    placeholder="Enter new password"
                    required
                  />
                  <AvField
                    name="cPass"
                    label="Confirm password"
                    type="password"
                    placeholder="Enter confirm password"
                    required
                  />
                </div>
                <Row>
                  <Col md={6}>
                    <button
                      className="btn btn-dark w-100 waves-effect waves-light"
                      style={{ border: 'none', backgroundColor: Utils.themeColor }}
                      onClick={() => setIsAdd(false)}
                      type="reset"
                    >
                      Cancel
                    </button>
                  </Col>
                  <Col md={6}>
                    <button
                      className="btn btn-dark w-100 waves-effect waves-light"
                      style={{ border: 'none', backgroundColor: Utils.themeColor }}
                      type="submit"
                    >
                      {currentData?._id ? 'Update' : 'Add'}
                    </button>
                  </Col>
                </Row>
              </AvForm>
            </CardBody>
          </Card>
        </ModalBody>
      </Modal>
    </div>
  )
}
