import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, Badge, ProgressBar, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import Footer from "../../layouts/Footer";
import Header from "../../layouts/Header";
import { toast } from 'react-toastify';
import { getDashboardSummary, getChartAnalytics } from '../../helper/analytics_helper';
import { useSelector } from "react-redux";
import Loader from "../../layouts/Loader";
import '../../assets/css/admin-dashboard.css';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import BlogEditor from "./Blog";
import { CSSTransition, TransitionGroup } from 'react-transition-group';

export default function AdminDashboard() {
    const user = useSelector(state => state.user);
    const currentSkin = (localStorage.getItem('skin-mode')) ? 'dark' : '';
    const [skin, setSkin] = useState(currentSkin);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [timeFilter, setTimeFilter] = useState('last30days');
    const [chartInterval, setChartInterval] = useState('monthly');
    const [activeSection, setActiveSection] = useState('Statistics');

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

    const fetchAnalytics = async (filter = timeFilter, interval = chartInterval, silent = false) => {
        if (!silent) setLoading(true);
        try {
            const summaryData = await getDashboardSummary(filter);
            const chartAnalytics = await getChartAnalytics(interval);

            if (summaryData.success) {
                setStats(summaryData.data);
            } else {
                if (!silent) toast.error(summaryData.message || "Failed to fetch summary stats");
            }

            if (chartAnalytics.success) {
                // Transform data for recharts
                const formattedData = chartAnalytics.data.map(item => ({
                    name: item._id, // Assume backend returns a label like "2023-08" or "Jan"
                    Sales: item.totalSales,
                    Revenue: item.totalRevenue
                }));
                setChartData(formattedData);
            } else {
                if (!silent) toast.error(chartAnalytics.message || "Failed to fetch chart analytics");
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
            if (!silent) toast.error("Something went wrong!");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        const token = user?.token || localStorage.getItem('adminToken');
        if (token) {
            fetchAnalytics();
        }
    }, [timeFilter, chartInterval]);

    // Auto-refresh stats every 60 seconds
    useEffect(() => {
        if (!user?.token && !localStorage.getItem('adminToken')) {
            return;
        }

        const intervalId = setInterval(() => {
            if (!loading) {
                fetchAnalytics(timeFilter, chartInterval, true); // Silent refresh
            }
        }, 60000); // 60 seconds

        return () => clearInterval(intervalId);
    }, [loading, timeFilter, chartInterval]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'warning',
            'Processing': 'info',
            'Shipped': 'primary',
            'Delivered': 'success',
            'Cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    };

    const getMonthName = (month) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month - 1] || month;
    };

    const PIE_COLORS = {
        'Paid': '#10B981',
        'Pending': '#F59E0B',
        'Failed': '#EF4444',
        'Delivered': '#10B981',
        'Shipped': '#3B82F6',
        'Active': '#10B981',
        'Inactive': '#F59E0B',
    };

    return (
        <React.Fragment>
            <Header onSkin={setSkin} />
            <div className="main main-app p-3 p-lg-4">
                <div className="d-md-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h4 className="main-title mb-0">Analytics Dashboard</h4>
                        <p className="text-secondary mb-0">Overview of your store performance and analytics</p>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        <Form.Select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="bg-white"
                            style={{ width: 'auto' }}
                        >
                            <option value="today">Today</option>
                            <option value="last7days">Last 7 Days</option>
                            <option value="last30days">Last 30 Days</option>
                            <option value="thisYear">This Year</option>
                        </Form.Select>
                        <button
                            className="btn btn-primary d-flex align-items-center gap-2"
                            onClick={() => fetchAnalytics()}
                            disabled={loading}
                        >
                            <i className="ri-download-2-line"></i>
                            Export Report
                        </button>
                    </div>
                </div>

                {loading && <Loader />}

                {stats && (
                    <>
                        {/* Top Summary Cards */}
                        <Row className="g-3 mb-4">
                            <Col xs={12} sm={6} lg={3}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{ backgroundColor: '#F3E8FF', padding: '12px', borderRadius: '12px' }}>
                                                <i className="ri-group-line" style={{ fontSize: '1.5rem', color: '#9333EA' }}></i>
                                            </div>
                                            <div>
                                                <div className="text-secondary small mb-1">Total Users</div>
                                                <h4 className="mb-0 fw-bold">{stats.summary?.totalUsers || 0}</h4>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12} sm={6} lg={3}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{ backgroundColor: '#DBEAFE', padding: '12px', borderRadius: '12px' }}>
                                                <i className="ri-shopping-bag-line" style={{ fontSize: '1.5rem', color: '#2563EB' }}></i>
                                            </div>
                                            <div>
                                                <div className="text-secondary small mb-1">Total Products</div>
                                                <h4 className="mb-0 fw-bold">{stats.summary?.totalProducts || 0}</h4>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12} sm={6} lg={3}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{ backgroundColor: '#FFEDD5', padding: '12px', borderRadius: '12px' }}>
                                                <i className="ri-shopping-cart-2-line" style={{ fontSize: '1.5rem', color: '#EA580C' }}></i>
                                            </div>
                                            <div>
                                                <div className="text-secondary small mb-1">Total Orders</div>
                                                <h4 className="mb-0 fw-bold">{stats.summary?.totalOrders || 0}</h4>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12} sm={6} lg={3}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{ backgroundColor: '#DCFCE7', padding: '12px', borderRadius: '12px' }}>
                                                <i className="ri-money-rupee-circle-line" style={{ fontSize: '1.5rem', color: '#16A34A' }}></i>
                                            </div>
                                            <div>
                                                <div className="text-secondary small mb-1">Total Revenue</div>
                                                <h4 className="mb-0 fw-bold">{formatCurrency(stats.summary?.totalRevenue || 0)}</h4>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Mid Section: Charts */}
                        <Row className="g-3 mb-4">
                            <Col xs={12} lg={4}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h6 className="mb-0 fw-bold">Sales & Revenue Overview</h6>
                                            <Form.Select
                                                size="sm"
                                                value={chartInterval}
                                                onChange={(e) => setChartInterval(e.target.value)}
                                                style={{ width: 'auto' }}
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </Form.Select>
                                        </div>
                                        <div style={{ height: '250px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                    <Line type="monotone" dataKey="Sales" stroke="#8B5CF6" strokeWidth={2} />
                                                    <Line type="monotone" dataKey="Revenue" stroke="#10B981" strokeWidth={2} />
                                                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                                    <YAxis axisLine={false} tickLine={false} />
                                                    <Tooltip />
                                                    <Legend />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12} lg={4}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <h6 className="mb-4 fw-bold">Payment Status</h6>
                                        <div className="d-flex align-items-center">
                                            <div style={{ height: '200px', width: '50%' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={stats.paymentStatus || []}
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="count"
                                                            nameKey="status"
                                                        >
                                                            {(stats.paymentStatus || []).map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.status] || '#8884d8'} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="w-50 ps-3">
                                                {(stats.paymentStatus || []).map((item, idx) => (
                                                    <div key={idx} className="mb-3">
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: PIE_COLORS[item.status] || '#ccc' }}></div>
                                                            <span className="small fw-medium">{item.status}</span>
                                                        </div>
                                                        <div className="text-secondary small">{formatCurrency(item.totalAmount)} ({item.count})</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12} lg={4}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <h6 className="mb-4 fw-bold">Order Status</h6>
                                        <div className="d-flex align-items-center">
                                            <div style={{ height: '200px', width: '50%' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={stats.orderStatus || []}
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="count"
                                                            nameKey="status"
                                                        >
                                                            {(stats.orderStatus || []).map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.status] || '#8884d8'} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="w-50 ps-3">
                                                {(stats.orderStatus || []).map((item, idx) => (
                                                    <div key={idx} className="mb-3">
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: PIE_COLORS[item.status] || '#ccc' }}></div>
                                                            <span className="small fw-medium">{item.status}</span>
                                                        </div>
                                                        <div className="text-secondary small">{item.count} orders</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Bottom Section: Tables */}
                        <Row className="g-3 mb-4">
                            <Col xs={12} lg={4}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0 fw-bold">Top Selling Products</h6>
                                            <Link to="#" className="text-primary text-decoration-none small">View All</Link>
                                        </div>
                                        <Table borderless size="sm">
                                            <thead className="text-secondary small">
                                                <tr>
                                                    <th>Product</th>
                                                    <th className="text-end">Sold</th>
                                                    <th className="text-end">Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(stats.topProducts || []).map((product, idx) => (
                                                    <tr key={idx}>
                                                        <td className="small">{product.name}</td>
                                                        <td className="text-end small">{product.totalQuantitySold}</td>
                                                        <td className="text-end small">{formatCurrency(product.totalRevenue)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12} lg={4}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0 fw-bold">Low Stock Alerts</h6>
                                            <Link to="#" className="text-primary text-decoration-none small">View All</Link>
                                        </div>
                                        <Table borderless size="sm">
                                            <thead className="text-secondary small">
                                                <tr>
                                                    <th>Product</th>
                                                    <th className="text-center">Stock</th>
                                                    <th className="text-end">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(stats.lowStockAlerts || []).map((product, idx) => (
                                                    <tr key={idx}>
                                                        <td className="small">{product.name}</td>
                                                        <td className="text-center small text-danger">{product.stock}</td>
                                                        <td className="text-end small">{formatCurrency(product.price)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12} lg={4}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body>
                                        <h6 className="mb-4 fw-bold">User Activity</h6>
                                        <div className="d-flex align-items-center">
                                            <div style={{ height: '200px', width: '50%' }}>
                                                {stats.userActivity && (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={[
                                                                    { name: 'Active', value: stats.userActivity.active },
                                                                    { name: 'Inactive', value: stats.userActivity.inactive }
                                                                ]}
                                                                innerRadius={60}
                                                                outerRadius={80}
                                                                paddingAngle={5}
                                                                dataKey="value"
                                                            >
                                                                <Cell fill={PIE_COLORS['Active']} />
                                                                <Cell fill={PIE_COLORS['Inactive']} />
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </div>
                                            <div className="w-50 ps-3">
                                                <div className="mb-3">
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: PIE_COLORS['Active'] }}></div>
                                                        <span className="small fw-medium">Active Users</span>
                                                    </div>
                                                    <div className="text-secondary small">{stats.userActivity?.active || 0}</div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: PIE_COLORS['Inactive'] }}></div>
                                                        <span className="small fw-medium">Inactive Users</span>
                                                    </div>
                                                    <div className="text-secondary small">{stats.userActivity?.inactive || 0}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                    </>
                )}

                {!loading && !stats && (
                    <Card className="card-one">
                        <Card.Body className="text-center py-5">
                            <i className="ri-error-warning-line" style={{ fontSize: '4rem', color: '#9CA3AF' }}></i>
                            <h5 className="mt-3 text-secondary">No data available</h5>
                            <p className="text-secondary">Unable to load admin statistics</p>
                            <button className="btn btn-primary mt-2" onClick={() => fetchAnalytics()}>
                                Try Again
                            </button>
                        </Card.Body>
                    </Card>
                )}

                <TransitionGroup>
                    {/* <CSSTransition key={'RecommendedEditor'} classNames="fade" timeout={300}>
          <div style={{ display: activeSection === 'Recommended Editor' ? 'block' : 'none' }}>
            <RecommendedEditor />
          </div>
        </CSSTransition> */}
                    <CSSTransition key={'BlogEditor'} classNames="fade" timeout={300}>
                        <div style={{ display: activeSection === 'Blog Editor' ? 'block' : 'none' }}>
                            <BlogEditor />
                        </div>
                    </CSSTransition>
                </TransitionGroup>

                <Footer />
            </div>
        </React.Fragment>
    );
}
