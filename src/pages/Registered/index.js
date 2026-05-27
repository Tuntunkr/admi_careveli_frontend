import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../layouts/Header';
import { Card, CardBody, Row, Col, Input, FormGroup, Label, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Button, Pagination } from 'react-bootstrap';
import { getAllUsers, parseAllUsersResponse } from '../../helper/admin_helper';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import DataTableSkeleton from '../../components/DataTableSkeleton';
import Footer from '../../layouts/Footer';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { dataTableCustomStyles } from '../../components/admin/dataTableConfig';
import moment from 'moment';

function getAdminToken(userState) {
    const nested = userState?.user || userState;
    return nested?.token || localStorage.getItem('adminToken') || '';
}

function getInitials(name = '') {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function formatPhone(phone) {
    if (!phone) return '—';
    const s = String(phone).trim();
    if (s.startsWith('+')) return s;
    if (/^\d{10}$/.test(s)) return `+91 ${s}`;
    return s;
}

function UserDetailsContent({ user: row }) {
    if (!row) return null;

    const name = row.name || row.userName || '—';
    const email = row.email || row.emailId;
    const phone = formatPhone(row.phone || row.mobile);

    return (
        <div className="user-details-modal">
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <span className="user-avatar-initials" style={{ width: 48, height: 48, fontSize: '1rem' }}>
                    {getInitials(name)}
                </span>
                <div>
                    <h5 className="mb-1 fw-bold">{name}</h5>
                    <div className="d-flex flex-wrap gap-2">
                        <span className={`badge rounded-pill ${row.role === 'Admin' ? 'bg-danger' : 'bg-primary'}`}>
                            {row.role || 'User'}
                        </span>
                        <span className={`badge rounded-pill ${row.isActive !== false ? 'bg-success' : 'bg-secondary'}`}>
                            {row.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>

            <Row className="g-3 mb-4">
                <Col md={6}>
                    <small className="text-muted d-block mb-1">User ID</small>
                    <code className="small d-block text-break">{row._id || '—'}</code>
                </Col>
                <Col md={6}>
                    <small className="text-muted d-block mb-1">Full name</small>
                    <span className="fw-medium">{name}</span>
                </Col>
                <Col md={6}>
                    <small className="text-muted d-block mb-1">Email</small>
                    {email ? (
                        <a href={`mailto:${email}`} className="text-break">{email}</a>
                    ) : (
                        <span>—</span>
                    )}
                </Col>
                <Col md={6}>
                    <small className="text-muted d-block mb-1">Mobile</small>
                    <span>{phone}</span>
                </Col>
                <Col md={6}>
                    <small className="text-muted d-block mb-1">Joined</small>
                    <span>
                        {row.createdAt
                            ? moment(row.createdAt).format('DD MMM YYYY, hh:mm A')
                            : '—'}
                    </span>
                </Col>
                <Col md={6}>
                    <small className="text-muted d-block mb-1">Last updated</small>
                    <span>
                        {row.updatedAt
                            ? moment(row.updatedAt).format('DD MMM YYYY, hh:mm A')
                            : '—'}
                    </span>
                </Col>
            </Row>

            <div className="mb-4">
                <h6 className="fw-semibold mb-2">
                    <i className="ri-wallet-3-line me-1" />
                    Payment summary
                </h6>
                <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-success">
                        Successful: {row?.activity?.paymentStatuses?.success ?? 0}
                    </span>
                    <span className="badge bg-danger">
                        Failed: {row?.activity?.paymentStatuses?.failed ?? 0}
                    </span>
                    <span className="badge bg-warning text-dark">
                        Pending: {row?.activity?.paymentStatuses?.pending ?? 0}
                    </span>
                    <span className="badge bg-light text-dark border">
                        Total spent: ₹{row?.activity?.totalPaymentAmount ?? 0}
                    </span>
                    <span className="badge bg-light text-dark border">
                        Orders: {row?.activity?.totalOrdersCount ?? 0}
                    </span>
                </div>
            </div>

            <div>
                <h6 className="fw-semibold mb-2">
                    <i className="ri-shopping-bag-line me-1" />
                    Order history
                </h6>
                {row?.activity?.orderHistory?.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-sm table-bordered mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Order #</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {row.activity.orderHistory.map((order, idx) => (
                                    <tr key={order._id || idx}>
                                        <td className="small">{order.orderNumber}</td>
                                        <td className="small">{moment(order.date).format('DD MMM YYYY')}</td>
                                        <td className="small">₹{order.amount}</td>
                                        <td><span className="badge bg-primary">{order.status}</span></td>
                                        <td><span className="badge bg-secondary">{order.paymentStatus}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-muted small mb-0 py-3 text-center bg-light rounded">
                        No order history for this user.
                    </p>
                )}
            </div>
        </div>
    );
}

function Registered() {
    const userState = useSelector(state => state.user);
    const token = getAdminToken(userState);

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [viewUser, setViewUser] = useState(null);

    const pageStats = useMemo(() => {
        const activeOnPage = data.filter(u => u.isActive !== false).length;
        const adminsOnPage = data.filter(u => u.role === 'Admin').length;
        const withOrders = data.filter(u => (u?.activity?.totalOrdersCount ?? 0) > 0).length;
        return { activeOnPage, adminsOnPage, withOrders };
    }, [data]);

    const hasActiveFilters = Boolean(debouncedSearch || roleFilter || perPage !== 10);

    const columns = useMemo(() => [
        {
            name: '#',
            cell: (row, index) => (
                <span className="text-muted small">{(currentPage - 1) * perPage + index + 1}</span>
            ),
            width: '56px',
        },
        {
            name: 'User',
            minWidth: '200px',
            grow: 1,
            cell: row => {
                const name = row.name || row.userName || 'Unknown';
                return (
                    <div className="d-flex align-items-center gap-2 py-1">
                        <span className="user-avatar-initials" aria-hidden="true">
                            {getInitials(name)}
                        </span>
                        <div className="user-cell-name min-w-0">
                            <div className="fw-semibold text-truncate">{name}</div>
                            <div className="user-cell-sub text-truncate">
                                ID: {(row._id || '').slice(-8) || '—'}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            name: 'Email',
            minWidth: '220px',
            grow: 1,
            cell: row => {
                const email = row.email || row.emailId;
                if (!email) return <span className="text-muted">—</span>;
                return (
                    <div className="d-flex align-items-center gap-2 min-w-0">
                        <a
                            href={`mailto:${email}`}
                            className="text-truncate text-decoration-none"
                            style={{ maxWidth: '180px' }}
                            title={email}
                        >
                            {email}
                        </a>
                        <button
                            type="button"
                            className="btn btn-sm btn-light border-0 p-1 flex-shrink-0"
                            title="Copy email"
                            onClick={e => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(email);
                                toast.success('Email copied');
                            }}
                        >
                            <i className="ri-file-copy-line text-primary" />
                        </button>
                    </div>
                );
            },
        },
        {
            name: 'Mobile',
            width: '140px',
            cell: row => (
                <span className="text-nowrap small">{formatPhone(row.phone || row.mobile)}</span>
            ),
        },
        {
            name: 'Role',
            width: '88px',
            cell: row => (
                <span className={`badge rounded-pill ${row.role === 'Admin' ? 'bg-danger' : 'bg-primary'}`}>
                    {row.role || 'User'}
                </span>
            ),
        },
        {
            name: 'Status',
            width: '92px',
            cell: row => (
                <span className={`badge rounded-pill ${row.isActive !== false ? 'bg-success' : 'bg-secondary'}`}>
                    {row.isActive !== false ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            name: 'Joined',
            width: '118px',
            cell: row => {
                const date = row?.createdAt || row?.updatedAt;
                if (!date) return '—';
                const m = moment(date);
                return (
                    <span className="small text-nowrap" title={m.format('DD MMM YYYY, hh:mm A')}>
                        {m.format('DD MMM YYYY')}
                    </span>
                );
            },
        },
        {
            name: 'Activity',
            width: '110px',
            cell: row => {
                const orders = row?.activity?.totalOrdersCount ?? 0;
                const spent = row?.activity?.totalPaymentAmount ?? 0;
                return (
                    <div className="small">
                        <div>
                            <i className="ri-shopping-bag-line me-1 text-muted" />
                            {orders} {orders === 1 ? 'order' : 'orders'}
                        </div>
                        <div className="text-success fw-medium">₹{spent}</div>
                    </div>
                );
            },
        },
        {
            name: 'Actions',
            width: '80px',
            ignoreRowClick: true,
            cell: row => (
                <Button
                    size="sm"
                    variant="outline-primary"
                    className="order-action-btn order-action-btn--view"
                    title="View user details"
                    onClick={() => setViewUser(row)}
                >
                    <i className="ri-eye-line" />
                </Button>
            ),
        },
    ], [currentPage, perPage]);

    const fetchUsers = useCallback(async () => {
        if (!token) {
            toast.error('Please sign in again — admin token missing');
            setData([]);
            setTotalUsers(0);
            return;
        }

        setLoading(true);

        const params = { page: currentPage, limit: perPage };
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (roleFilter) params.role = roleFilter;

        try {
            const res = await getAllUsers(token, params);
            const { users, pagination, totalUsers: total, error } = parseAllUsersResponse(res);

            if (error) {
                toast.error(error);
                setData([]);
                setTotalUsers(0);
                setTotalPages(1);
                return;
            }

            setData(users);
            setTotalUsers(total);

            if (pagination) {
                setCurrentPage(pagination.currentPage || currentPage);
                setTotalPages(Math.max(pagination.totalPages || 1, 1));
            } else {
                setTotalPages(Math.max(Math.ceil(total / perPage) || 1, 1));
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            toast.error('Failed to load registered users');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [token, currentPage, perPage, debouncedSearch, roleFilter]);

    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(id);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const resetFilters = () => {
        setSearchTerm('');
        setDebouncedSearch('');
        setRoleFilter('');
        setCurrentPage(1);
        setPerPage(10);
    };

    const exportCsv = () => {
        if (!data.length) {
            toast.warning('No users on this page to export');
            return;
        }
        const header = ['Name', 'Email', 'Mobile', 'Role', 'Status', 'Joined', 'Orders', 'Total Spent'];
        const rows = data.map(row => [
            row.name || row.userName || '',
            row.email || row.emailId || '',
            row.phone || row.mobile || '',
            row.role || 'User',
            row.isActive !== false ? 'Active' : 'Inactive',
            row.createdAt ? moment(row.createdAt).format('YYYY-MM-DD') : '',
            row?.activity?.totalOrdersCount ?? 0,
            row?.activity?.totalPaymentAmount ?? 0,
        ]);
        const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registered-users-page-${currentPage}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported');
    };

    const paginationItems = useMemo(() => {
        const items = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);
        start = Math.max(1, end - maxVisible + 1);

        for (let p = start; p <= end; p += 1) {
            items.push(
                <Pagination.Item key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>
                    {p}
                </Pagination.Item>
            );
        }
        return items;
    }, [currentPage, totalPages]);

    const rangeStart = totalUsers > 0 ? (currentPage - 1) * perPage + 1 : 0;
    const rangeEnd = Math.min(currentPage * perPage, totalUsers);

    return (
        <React.Fragment>
            <Header />

            <div className="main main-app p-3 p-lg-4 registered-users-page">
                <div className="main-page-header d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                    <div>
                        <ol className="breadcrumb fs-sm mb-1">
                            <li className="breadcrumb-item">
                                <Link to="/admin/dashboard">Dashboard</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Registered Users
                            </li>
                        </ol>
                        <p className="text-muted small mb-0">
                            Manage customers who signed up on Careveli
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="outline-secondary" size="sm" onClick={exportCsv} disabled={!data.length}>
                            <i className="ri-download-2-line me-1" />
                            Export CSV
                        </Button>
                        <Button variant="primary" size="sm" onClick={fetchUsers} disabled={loading}>
                            <i className={`ri-refresh-line me-1 ${loading ? 'spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                <Row className="g-3 mb-3 registered-users-stats">
                    <Col xs={6} md={3}>
                        <Card className="registered-stat-card h-100" style={{ '--stat-accent': '#2563eb' }}>
                            <CardBody className="d-flex align-items-center justify-content-between py-3">
                                <div>
                                    <div className="text-muted small">Total users</div>
                                    <div className="fs-4 fw-bold">{totalUsers}</div>
                                </div>
                                <div className="registered-stat-card__icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                                    <i className="ri-group-line" />
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs={6} md={3}>
                        <Card className="registered-stat-card h-100" style={{ '--stat-accent': '#16a34a' }}>
                            <CardBody className="d-flex align-items-center justify-content-between py-3">
                                <div>
                                    <div className="text-muted small">Active (this page)</div>
                                    <div className="fs-4 fw-bold">{pageStats.activeOnPage}</div>
                                </div>
                                <div className="registered-stat-card__icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                                    <i className="ri-user-follow-line" />
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs={6} md={3}>
                        <Card className="registered-stat-card h-100" style={{ '--stat-accent': '#9333ea' }}>
                            <CardBody className="d-flex align-items-center justify-content-between py-3">
                                <div>
                                    <div className="text-muted small">With orders</div>
                                    <div className="fs-4 fw-bold">{pageStats.withOrders}</div>
                                </div>
                                <div className="registered-stat-card__icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
                                    <i className="ri-shopping-cart-2-line" />
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs={6} md={3}>
                        <Card className="registered-stat-card h-100" style={{ '--stat-accent': '#dc2626' }}>
                            <CardBody className="d-flex align-items-center justify-content-between py-3">
                                <div>
                                    <div className="text-muted small">Admins (this page)</div>
                                    <div className="fs-4 fw-bold">{pageStats.adminsOnPage}</div>
                                </div>
                                <div className="registered-stat-card__icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                                    <i className="ri-shield-user-line" />
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Card className="border-0 shadow-sm">
                    <CardBody className="pb-0">
                        <Row className="g-2 align-items-end admin-filter-toolbar mb-2">
                            <Col md={4} sm={6}>
                                <FormGroup className="mb-0">
                                    <Label for="searchInput">Search</Label>
                                    <div className="admin-search-wrap">
                                        <i className="ri-search-line admin-search-icon" />
                                        <Input
                                            id="searchInput"
                                            type="search"
                                            className="form-control"
                                            placeholder="Name, email, or phone…"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </FormGroup>
                            </Col>
                            <Col md={2} sm={3}>
                                <FormGroup className="mb-0">
                                    <Label for="roleFilter">Role</Label>
                                    <Input id="roleFilter" type="select" value={roleFilter} onChange={e => {
                                        setRoleFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}>
                                        <option value="">All roles</option>
                                        <option value="User">User</option>
                                        <option value="Admin">Admin</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={2} sm={3}>
                                <FormGroup className="mb-0">
                                    <Label for="perPageSelect">Per page</Label>
                                    <Input id="perPageSelect" type="select" value={perPage} onChange={e => {
                                        setPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={4} sm={12} className="d-flex gap-2 justify-content-md-end">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    className="flex-grow-1 flex-md-grow-0"
                                    onClick={resetFilters}
                                    disabled={!hasActiveFilters && !searchTerm}
                                >
                                    <i className="ri-filter-off-line me-1" />
                                    Reset
                                </Button>
                            </Col>
                        </Row>

                        {hasActiveFilters && (
                            <div className="filter-chips mb-3">
                                <span className="text-muted small me-1">Filters:</span>
                                {debouncedSearch && (
                                    <span className="filter-chip">
                                        Search: {debouncedSearch}
                                        <button type="button" onClick={() => setSearchTerm('')} aria-label="Clear search">×</button>
                                    </span>
                                )}
                                {roleFilter && (
                                    <span className="filter-chip">
                                        Role: {roleFilter}
                                        <button type="button" onClick={() => setRoleFilter('')} aria-label="Clear role">×</button>
                                    </span>
                                )}
                                {perPage !== 10 && (
                                    <span className="filter-chip">{perPage} per page</span>
                                )}
                            </div>
                        )}

                        <div className="registered-users-table-wrap mb-0">
                            <DataTable
                                columns={columns}
                                data={data}
                                progressPending={loading && totalUsers > 0}
                                progressComponent={<DataTableSkeleton rows={8} columns={8} />}
                                pagination={false}
                                customStyles={dataTableCustomStyles}
                                striped
                                highlightOnHover
                                dense
                                noDataComponent={
                                    !loading ? (
                                        <AdminEmptyState
                                            icon="ri-group-line"
                                            title="No registered users"
                                            description={
                                                token
                                                    ? 'No users match your filters.'
                                                    : 'Sign in as admin to load users.'
                                            }
                                        />
                                    ) : null
                                }
                            />
                        </div>

                        <div className="registered-users-footer d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <span className="text-muted small">
                                Showing <strong>{rangeStart}–{rangeEnd}</strong> of <strong>{totalUsers}</strong> users
                                {totalPages > 1 && (
                                    <> · Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></>
                                )}
                            </span>
                            {totalPages > 1 && (
                                <Pagination className="mb-0 flex-wrap">
                                    <Pagination.First disabled={currentPage <= 1 || loading} onClick={() => setCurrentPage(1)} />
                                    <Pagination.Prev disabled={currentPage <= 1 || loading} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
                                    {paginationItems}
                                    <Pagination.Next disabled={currentPage >= totalPages || loading} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
                                    <Pagination.Last disabled={currentPage >= totalPages || loading} onClick={() => setCurrentPage(totalPages)} />
                                </Pagination>
                            )}
                        </div>
                    </CardBody>
                </Card>

                <Modal isOpen={Boolean(viewUser)} toggle={() => setViewUser(null)} size="lg" centered>
                    <ModalHeader toggle={() => setViewUser(null)}>
                        User Details — {viewUser?.name || viewUser?.userName || 'User'}
                    </ModalHeader>
                    <ModalBody>
                        {viewUser && <UserDetailsContent user={viewUser} />}
                    </ModalBody>
                </Modal>

                <Footer />
            </div>
        </React.Fragment>
    );
}

export default Registered;
