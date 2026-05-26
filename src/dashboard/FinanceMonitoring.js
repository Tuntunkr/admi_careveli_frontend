import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";
import { toast } from 'react-toastify';
import { get } from '../helper/api_helper';
import { useSelector } from "react-redux";
import Loader from "../layouts/Loader";

export default function FinanceMonitoring() {
  const user = useSelector(state => state.user);
  const currentSkin = (localStorage.getItem('skin-mode')) ? 'dark' : '';
  const [skin, setSkin] = useState(currentSkin);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(undefined);

  const switchSkin = (skin) => {
    if (skin === 'dark') {
      const btnWhite = document.getElementsByClassName('btn-white');

      for (const btn of btnWhite) {
        btn.classList.add('btn-outline-primary');
        btn.classList.remove('btn-white');
      }
    } else {
      const btnOutlinePrimary = document.getElementsByClassName('btn-outline-primary');

      for (const btn of btnOutlinePrimary) {
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-white');
      }
    }
  };

  switchSkin(skin);

  useEffect(() => {
    switchSkin(skin);
  }, [skin]);

  useEffect(() => {
    if (user?.token) {
      getData();
    }
  }, [user]);

  const getData = () => {
    if (!loading) {
      setLoading(true);
      get("stat", { token: user?.token })
        .then(res => {
          setLoading(false);
          if (res?.statusCode == 200) {
            setData(res?.data);

          }
        })
        .catch(err => {
          setLoading(false);
          toast.error("Something Went Wrong!");
        })
    }
  }

  return (
    <React.Fragment>
      <Header onSkin={setSkin} />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-md-flex align-items-center justify-content-between mb-4">
          <div>
            <ol className="breadcrumb fs-sm mb-1">
              {/* <li className="breadcrumb-item"><Link to="#">Dashboard</Link></li> */}
            </ol>
            <h4 className="main-title mb-0">CAREVALI Dashboard</h4>
          </div>
        </div>
        {
          loading == true && <Loader />
        }

        {/* Statistics Cards */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} lg={3}>
            <Card className="card-one card-stats">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="stats-label text-secondary mb-1">Total User</div>
                    <h3 className="mb-0 fw-bold">{data?.pet || 0}</h3>
                  </div>
                  <div className="stats-icon">
                    <i className="ri-heart-pulse-fill" style={{ fontSize: '2.5rem', color: '#8B5CF6' }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="card-one card-stats">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="stats-label text-secondary mb-1">Total Product</div>
                    <h3 className="mb-0 fw-bold">{data?.user || 0}</h3>
                  </div>
                  <div className="stats-icon">
                    <i className="ri-team-fill" style={{ fontSize: '2.5rem', color: '#3B82F6' }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="card-one card-stats">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="stats-label text-secondary mb-1">Avg Trans. Costs</div>
                    <h3 className="mb-0 fw-bold">2,636</h3>
                  </div>
                  <div className="stats-icon">
                    <i className="ri-money-dollar-circle-fill" style={{ fontSize: '2.5rem', color: '#F59E0B' }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="card-one card-stats">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="stats-label text-secondary mb-1">Available Clin</div>
                    <h3 className="mb-0 fw-bold">38</h3>
                  </div>
                  <div className="stats-icon">
                    <i className="ri-hospital-fill" style={{ fontSize: '2.5rem', color: '#EC4899' }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row className="g-3 mb-4">
          <Col xs={12} lg={6}>
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">OutUser vs InUser Trend</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="chart-placeholder" style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
                  <div className="text-center">
                    <i className="ri-bar-chart-line" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                    <p className="text-muted mt-2">Chart will be displayed here</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* <Col xs={12} lg={3}>
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">User by Gender</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                  <div className="donut-chart-placeholder">
                    <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '30px solid #EC4899', borderTopColor: '#3B82F6', borderRightColor: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="text-center">
                        <div className="fw-bold">67%</div>
                        <small className="text-muted">Female</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-center gap-3 mt-3">
                  <div className="d-flex align-items-center">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EC4899', marginRight: '6px' }}></div>
                    <small>Female</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3B82F6', marginRight: '6px' }}></div>
                    <small>Male</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col> */}

          <Col xs={12} lg={3}>
            <Card className="card-one" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', color: 'white' }}>
              <Card.Body>
                <div className="text-white mb-2">
                  <small className="opacity-75">User this month</small>
                </div>
                <h2 className="text-white mb-3 fw-bold">3,240</h2>
                <div className="chart-mini" style={{ height: '60px' }}>
                  <svg width="100%" height="60">
                    <polyline
                      fill="none"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="2"
                      points="0,40 20,35 40,45 60,30 80,38 100,25 120,32 140,20 160,28 180,15 200,25"
                    />
                  </svg>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Bottom Row */}
        <Row className="g-3">
          <Col xs={12} lg={4}>
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Time Admitted</Card.Title>
                <span className="text-muted">Today</span>
              </Card.Header>
              <Card.Body>
                <div className="chart-placeholder" style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
                  <i className="ri-line-chart-line" style={{ fontSize: '2.5rem', color: '#ccc' }}></i>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={4}>
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">User By Division</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="division-list">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <div className="d-flex align-items-center">
                      <i className="ri-heart-pulse-line me-2" style={{ color: '#8B5CF6' }}></i>
                      <span>Cardiology</span>
                    </div>
                    <span className="fw-bold">267</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <div className="d-flex align-items-center">
                      <i className="ri-microscope-line me-2" style={{ color: '#3B82F6' }}></i>
                      <span>Neurology</span>
                    </div>
                    <span className="fw-bold">164</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <i className="ri-capsule-line me-2" style={{ color: '#10B981' }}></i>
                      <span>Surgery</span>
                    </div>
                    <span className="fw-bold">86</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={4}>
            <Card className="card-one">
              <Card.Header>
                <Card.Title as="h6">Quick Actions</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <button className="btn btn-primary">
                    <i className="ri-user-add-line me-2"></i>
                    Registered User
                  </button>
                  <button className="btn btn-outline-primary">
                    <i className="ri-team-line me-2"></i>
                    Registered User
                  </button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Footer />
      </div>
    </React.Fragment>
  );
}
