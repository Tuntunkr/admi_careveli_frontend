import React, { useState } from "react"
import { Link } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import userAvatar from "../assets/img/img1.png";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Row, Col, Modal, ModalBody } from 'reactstrap'
import { Button } from 'react-bootstrap';
import { AvForm, AvField } from "availity-reactstrap-validation";
import { post, put } from "../helper/api_helper";
import * as Utils from "../Utils";





export default function Header({ onSkin }) {
  const navigate = useNavigate();
  const user = useSelector(state => state.user);
  const [isAdd, setIsAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [isAddPassword, setIsAddPassword] = useState(false);
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
            setIsAddPassword(false);
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


  return (
    <div className="header-main px-3 px-lg-4">
      <Link onClick={toggleSidebar} className="menu-link me-3 me-lg-4"><i className="ri-menu-2-fill"></i></Link>

      <div className="form-search me-auto">
        {/* <input type="text" className="form-control" placeholder="Search" />
        <i className="ri-search-line"></i> */}
      </div>
      <Link className="text-white" onClick={() => { setIsAdd(true) }} > Change Password</Link>

      <Dropdown className="dropdown-profile ms-3 ms-xl-4" align="end">
        <Dropdown.Toggle as={CustomToggle}>
          <div className="avatar online">
            <img src={userAvatar} alt="" />
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className="mt-10-f">
          <div className="dropdown-menu-body">
            <div className="avatar avatar-xl online mb-3"><img src={userAvatar} alt="" /></div>
            <h5 className="mb-1 text-dark fw-semibold">{user?.name}</h5>
            <p className="fs-sm text-secondary">{user?.role}</p>
            {/* <p className="fs-sm text-secondary">Change Password </p> */}

            {/* <nav className="nav">
              <Link to=""><i className="ri-edit-2-line"></i> Edit Profile</Link>
              <Link to=""><i className="ri-profile-line"></i> View Profile</Link>
            </nav>
            <hr /> */}

            <nav className="nav">
              {/* <Link to=""><i className="ri-question-line"></i> Help Center</Link>
              <Link to=""><i className="ri-lock-line"></i> Privacy Settings</Link>
              <Link to=""><i className="ri-user-settings-line"></i> Account Settings</Link> */}
              <Link to="/logout"><i className="ri-logout-box-r-line"></i> Log Out</Link>
            </nav>
          </div>
        </Dropdown.Menu>
      </Dropdown>

      <Modal isOpen={isAdd} centered>
        <ModalBody>
          <Card>
            <CardBody>
              {/* <CardTitle className='mb-4'><b>{currentData?._id ? 'Update' : 'Add New  Password'}</b></CardTitle> */}
              <AvForm onValidSubmit={onPassChange}>
                <div className='mb-4 mt-4'>
                  <AvField
                    name="oldPass"
                    label="Old password"
                    type="password"
                    placeholder="Enter old password"
                    // value={currentData?.title}
                    required
                  />
                  <AvField
                    name="newPass"
                    label="New password"
                    type="password"
                    placeholder="Enter new password"
                    // value={currentData?.title}
                    required
                  />
                  <AvField
                    name="cPass"
                    label="Confirm password"
                    type="password"
                    placeholder="Enter confirm password"
                    // value={currentData?.title}
                    required
                  />
                </div>
                <Row>
                  <Col md={6}>
                    <button
                      className="btn btn-dark w-100 waves-effect waves-light"
                      style={{ border: 'none', backgroundColor: Utils.themeColor }} onClick={() => setIsAdd(false)} type="reset">  Cancel
                    </button>
                  </Col>
                  <Col md={6}>
                    <button
                      className="btn btn-dark w-100 waves-effect waves-light"
                      style={{ border: 'none', backgroundColor: Utils.themeColor }} type="submit" > {currentData?._id ? 'Update' : 'Add'}
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