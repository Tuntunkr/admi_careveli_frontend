import React, { useEffect, useState, useRef } from 'react'
import Header from '../../layouts/Header'
import { Card, CardBody, CardSubtitle, CardTitle, Row, Col, Modal, ModalBody, Input, Button, FormGroup, Label } from 'reactstrap'
import { getAllUsers } from '../../helper/admin_helper';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import Footer from '../../layouts/Footer';
import Loader from '../../layouts/Loader';
import moment from 'moment';
import defaultProfilePic from "../../assets/images/user.png";

function Registered() {

    const user = useSelector(state => state.user);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);

    // Pagination and filters state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        console.log('=== Registered Component Mounted ===');
        console.log('User object:', user);
        console.log('User token:', user?.token);

        if (user?.token) {
            console.log('Token found, calling getData()');
            getData();
        } else {
            console.warn('No token found in user object');
        }
    }, [user, currentPage, perPage, roleFilter]);

    // Handle search with debounce
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            if (user?.token) {
                setCurrentPage(1); // Reset to first page on search
                getData();
            }
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm]);

    useEffect(() => {
        setColumns([
            {
                name: 'Sl.No',
                cell: (row, index) => <>
                    <span>{(currentPage - 1) * perPage + index + 1}</span>
                </>,
                maxWidth: '70px'

            },
            {
<<<<<<< HEAD
                name: "Profile",
                cell: (row) => <>
                    <img src={row?.profilePic !== "" ? row.profilePic : defaultProfilePic} style={{ width: 70, height: 70, padding: 10, borderRadius: '50%', objectFit: 'cover' }} alt="Profile" />
                </>,
                maxWidth: '100px'
            },
            {
=======
>>>>>>> origin/manish
                name: 'Name',
                cell: (row, index) => <>
                    <p className='mb-0'>{row.name || row.userName || 'N/A'}</p>
                </>,
                minWidth: '150px'
            },
            {
                name: 'Email',
                cell: (row, index) => <>
<<<<<<< HEAD
                    <p className='mb-0'>{row.email || row.emailId || 'N/A'}</p>
=======
                    <div className="d-flex align-items-center">
                        <p className='mb-0 me-2'>{row.email || row.emailId || 'N/A'}</p>
                        {(row.email || row.emailId) && (
                            <i
                                className="ri-file-copy-line text-primary cursor-pointer"
                                style={{ cursor: 'pointer' }}
                                title="Copy Email"
                                onClick={() => {
                                    navigator.clipboard.writeText(row.email || row.emailId);
                                    toast.success("Email copied to clipboard!");
                                }}
                            ></i>
                        )}
                    </div>
>>>>>>> origin/manish
                </>,
                minWidth: '200px'
            },
            {
                name: 'Mobile',
                cell: (row) => <>
                    <p className='mb-0'>{row.phone || row.mobile || 'N/A'}</p>
                </>,
                minWidth: '140px'
            },
            {
                name: 'Role',
                cell: (row) => <>
                    <span className={`badge ${row.role === 'Admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {row.role || 'User'}
                    </span>
                </>,
                maxWidth: '100px'
            },
            {
                name: 'Status',
                cell: (row) => <>
                    <span className={`badge ${row.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {row.isActive ? 'Active' : 'Inactive'}
                    </span>
                </>,
                maxWidth: '100px'
            },
            {
                name: 'Added On',
                selector: row => moment(row?.createdAt || row?.updatedAt).format("DD-MMM-YYYY"),
                minWidth: '130px'
            },
<<<<<<< HEAD
=======
            {
                name: 'Total Orders',
                cell: (row) => <span>{row?.activity?.totalOrdersCount || 0}</span>,
                minWidth: '110px'
            },
            {
                name: 'Total Spent',
                cell: (row) => <span>₹{row?.activity?.totalPaymentAmount || 0}</span>,
                minWidth: '110px'
            }
>>>>>>> origin/manish
        ])
    }, [data, currentPage, perPage]);

    const getData = () => {
        if (!loading) {
            setLoading(true);

            // Build query parameters object
            const params = {
                page: currentPage,
                limit: perPage
            };

            if (searchTerm) {
                params.search = searchTerm;
            }

            if (roleFilter) {
                params.role = roleFilter;
            }

            console.log('Fetching users with params:', params);
            console.log('User token:', user?.token ? 'Token exists' : 'No token');

            // Call API using admin_helper
            getAllUsers(user?.token, params)
                .then(res => {
                    console.log('API Response:', res);
                    setLoading(false);

                    if (res?.success && res?.data) {
                        console.log('Users data:', res.data.users);
                        console.log('Total users:', res.data.pagination?.totalUsers || res.data.totalUsers);

                        setData(res.data.users || []);

                        // Update pagination info
                        if (res.data.pagination) {
                            setCurrentPage(res.data.pagination.currentPage);
                            setTotalPages(res.data.pagination.totalPages);
                            setTotalUsers(res.data.pagination.totalUsers);

                            console.log('Pagination updated:', {
                                currentPage: res.data.pagination.currentPage,
                                totalPages: res.data.pagination.totalPages,
                                totalUsers: res.data.pagination.totalUsers
                            });
                        } else if (res.data.totalUsers !== undefined) {
                            // Fallback for response without pagination object
                            setTotalUsers(res.data.totalUsers);
                        }

                        console.log('State should be updated now. Data length:', res.data.users?.length);
                    } else {
                        console.error('API Error:', res);
                        toast.error(res?.message || "Failed to fetch users");
                    }
                })
                .catch(err => {
                    setLoading(false);
                    console.error("Error fetching users:", err);
                    toast.error("Something Went Wrong!");
                })
        }
    }

    const ExpandedComponent = ({ data }) =>
        <div className='expending_box' style={{ padding: '15px', backgroundColor: '#f8f9fa' }}>
            <Row>
                <Col lg={3} md={6}>
                    <div className='expend_detail mb-2'>
                        <h6 className='mb-1'><strong>User ID:</strong></h6>
                        <p className='mb-0 text-muted' style={{ fontSize: '0.9rem' }}>{data?._id || 'N/A'}</p>
                    </div>
                </Col>
                <Col lg={3} md={6}>
                    <div className='expend_detail mb-2'>
<<<<<<< HEAD
                        <h6 className='mb-1'><strong>Email Verified:</strong></h6>
                        <p className='mb-0'>
                            <span className={`badge ${data?.isEmailVerified ? 'bg-success' : 'bg-warning'}`}>
                                {data?.isEmailVerified ? 'Yes' : 'No'}
                            </span>
=======
                        <h6 className='mb-1'><strong>Status Breakdown:</strong></h6>
                        <p className='mb-0'>
                            <span className="badge bg-success me-1 cursor-pointer" title="Success">S: {data?.activity?.paymentStatuses?.success || 0}</span>
                            <span className="badge bg-danger me-1 cursor-pointer" title="Failed">F: {data?.activity?.paymentStatuses?.failed || 0}</span>
                            <span className="badge bg-warning text-dark cursor-pointer" title="Pending">P: {data?.activity?.paymentStatuses?.pending || 0}</span>
>>>>>>> origin/manish
                        </p>
                    </div>
                </Col>
                <Col lg={3} md={6}>
                    <div className='expend_detail mb-2'>
<<<<<<< HEAD
                        <h6 className='mb-1'><strong>Addresses:</strong></h6>
                        <p className='mb-0 text-muted' style={{ fontSize: '0.9rem' }}>
                            {data?.addresses?.length || 0} Address(es)
=======
                        <h6 className='mb-1'><strong>Total Spent:</strong></h6>
                        <p className='mb-0 text-muted' style={{ fontSize: '0.9rem' }}>
                            ₹{data?.activity?.totalPaymentAmount || 0}
>>>>>>> origin/manish
                        </p>
                    </div>
                </Col>
                <Col lg={3} md={6}>
                    <div className='expend_detail mb-2'>
                        <h6 className='mb-1'><strong>Updated At:</strong></h6>
                        <p className='mb-0 text-muted' style={{ fontSize: '0.9rem' }}>
                            {moment(data?.updatedAt).format("DD-MMM-YYYY hh:mm A")}
                        </p>
                    </div>
                </Col>
            </Row>
<<<<<<< HEAD
=======
            {data?.activity?.orderHistory?.length > 0 && (
                <Row className="mt-3">
                    <Col>
                        <h6 className="mb-2"><strong>Order History:</strong></h6>
                        <div className="table-responsive">
                            <table className="table table-sm table-bordered">
                                <thead className="table-light">
                                    <tr>
                                        <th>Order Number</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Payment Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.activity.orderHistory.map((order, idx) => (
                                        <tr key={idx}>
                                            <td>{order.orderNumber}</td>
                                            <td>{moment(order.date).format("DD-MMM-YYYY")}</td>
                                            <td>₹{order.amount}</td>
                                            <td><span className={`badge ${order.status === 'Delivered' ? 'bg-success' : 'bg-primary'}`}>{order.status}</span></td>
                                            <td><span className={`badge ${order.paymentStatus === 'SUCCESS' ? 'bg-success' : 'bg-warning'}`}>{order.paymentStatus}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Col>
                </Row>
            )}
>>>>>>> origin/manish
        </div>

    return (
        <React.Fragment>
            <Header />

            {
                loading == true && <Loader />
            }

            <div className="main main-app p-3 p-lg-4">
                <Card>
                    <CardBody>
                        <Row className='mb-3'>
                            <Col md={12}>
                                <CardTitle tag="h4"><b>Registered Users</b></CardTitle>
                                <CardSubtitle className='text-muted'>
                                    Total Users: {totalUsers} | Page {currentPage} of {totalPages}
                                </CardSubtitle>
                            </Col>
                        </Row>

                        {/* Filters Section */}
                        <Row className='mb-3'>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="searchInput">Search Users</Label>
                                    <Input
                                        type="text"
                                        id="searchInput"
                                        placeholder="Search by name, email, or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={3}>
                                <FormGroup>
                                    <Label for="roleFilter">Filter by Role</Label>
                                    <Input
                                        type="select"
                                        id="roleFilter"
                                        value={roleFilter}
                                        onChange={(e) => {
                                            setRoleFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="">All Roles</option>
                                        <option value="User">User</option>
                                        <option value="Admin">Admin</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Label for="perPageSelect">Per Page</Label>
                                    <Input
                                        type="select"
                                        id="perPageSelect"
                                        value={perPage}
                                        onChange={(e) => {
                                            setPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={3} className='d-flex align-items-end'>
                                <FormGroup className='w-100'>
                                    <Button
                                        color="primary"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setRoleFilter('');
                                            setCurrentPage(1);
                                            setPerPage(10);
                                        }}
                                        className='w-100'
                                    >
                                        Reset Filters
                                    </Button>
                                </FormGroup>
                            </Col>
                        </Row>

                        {/* Data Table */}
                        <DataTable
                            columns={columns}
                            data={data}
                            pagination={false}
                            expandableRows={true}
                            expandOnRowClicked={false}
                            expandableRowDisabled={row => row.disabled}
                            expandableRowsComponent={ExpandedComponent}
                            expandableRowsComponentProps={row => row.Action}
                            conditionalRowStyles={[{
                                when: row => row?.style,
                                style: row => ({ width: row?.style?.width }),
                            },
                            ]}
                            customStyles={{
                                headCells: {
                                    style: {
                                        color: 'black',
                                        fontWeight: 'bold',
                                        fontSize: 15,
                                        width: 0
                                    },
                                },
                                cells: {
                                    style: {
                                        width: 0
                                    }
                                }
                            }}
                        />

                        {/* Custom Pagination */}
                        <Row className='mt-3'>
                            <Col md={12} className='d-flex justify-content-between align-items-center'>
                                <div>
                                    <span className='text-muted'>
                                        Showing {data.length > 0 ? ((currentPage - 1) * perPage) + 1 : 0} to {Math.min(currentPage * perPage, totalUsers)} of {totalUsers} users
                                    </span>
                                </div>
                                <div className='d-flex gap-2'>
                                    <Button
                                        color="primary"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(1)}
                                    >
                                        First
                                    </Button>
                                    <Button
                                        color="primary"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    >
                                        Previous
                                    </Button>
                                    <span className='d-flex align-items-center px-3'>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        color="primary"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    >
                                        Next
                                    </Button>
                                    <Button
                                        color="primary"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(totalPages)}
                                    >
                                        Last
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                <Footer />
            </div>
        </React.Fragment>
    )
}


export default Registered;