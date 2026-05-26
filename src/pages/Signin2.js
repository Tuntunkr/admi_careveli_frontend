import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Col, Row, Spinner } from "react-bootstrap";
import { AvForm, AvField } from "availity-reactstrap-validation";
import { post } from "../helper/api_helper";
import { toast } from "react-toastify";
import { setUser } from "../store/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Signin2() {
  const dispetch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleValidSubmit = (e, v) => {
    setLoading(true);
    post("user/admin", v)
      .then(res => {
        setLoading(false);
        if (res?.success) {
          // Save token and user data
          localStorage.setItem("adminToken", res?.token);
          localStorage.setItem("adminUser", JSON.stringify(res?.user));
          // Dispatch user with token
          dispetch(setUser({ ...res?.user, token: res?.token }));
          toast.success(res?.message || "Login successful");
          navigate("/admin/dashboard");
        } else {
          toast.error(res?.message || "Login failed");
        }
      })
      .catch(err => {
        setLoading(false);
        console.error("error while login", err);
        toast.error("Something went wrong!");
      })
  }

  return (
    <div className="page-sign d-block py-0">
      <Row className="g-0">
        <Col md="7" lg="5" xl="4" className="col-wrapper">
          <Card className="card-sign">
            <Card.Header>
              <Link to="/" className="header-logo mb-5">
                <img src={require("../assets/images/logo.jpeg")} style={{ width: '100px', height: 'auto', borderRadius: '50px' }} />

              </Link>
              <Card.Title>Admin Sign In</Card.Title>
              <Card.Text>Welcome back! Please signin to continue.</Card.Text>
            </Card.Header>
            <Card.Body>
              <AvForm onValidSubmit={handleValidSubmit}>
                <div className="mb-4">
                  <AvField
                    name="email"
                    placeholder="Enter your email"
                    type="email"
                    required
                    errorMessage="Please enter a valid email"
                  />
                </div>
                <div className="mb-4">
                  <AvField
                    name="password"
                    placeholder="Enter your password"
                    type="password"
                    required
                    errorMessage="Password is required"
                  />
                </div>
                <button
                  className="btn btn-dark btn-sign"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </AvForm>
            </Card.Body>
          </Card>
        </Col>
<<<<<<< HEAD
        <Col className="d-none d-lg-block auth-img-col">
          <img src={require("../assets/images/careveli-vitamin-c-serum.png")} className="auth-img" alt="Careveli 15% Vitamin C Face Serum" />
=======
        <Col className="d-none d-lg-block">
          <img src={require("../assets/images/onwards.jpg")} className="auth-img" alt="" />
>>>>>>> origin/manish
        </Col>
      </Row>
    </div>
  )
}