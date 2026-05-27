import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardTitle, Row, Col } from 'reactstrap';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { get } from '../../helper/api_helper';
import DataTable from 'react-data-table-component';
import DataTableSkeleton from '../../components/DataTableSkeleton';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import Loader from '../../layouts/Loader';
import moment from 'moment';

function Newsletter() {
    const user = useSelector(state => state.user);
    const [loading, setLoading] = useState(false);
    const [subscribers, setSubscribers] = useState([]);
    const [filteredSubscribers, setFilteredSubscribers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [toggleCleared, setToggleCleared] = useState(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    // DataTable columns configuration
    const columns = [
        {
            name: '#',
            cell: (row, index) => index + 1,
            width: '60px',
            center: true
        },
        {
            name: 'Date',
            selector: row => moment(row.createdAt).format('DD/MM/YYYY HH:mm'),
            sortable: true,
            width: '180px'
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
            wrap: true,
            grow: 2
        },
        {
            name: 'Status',
            selector: row => row.isActive ? 'Active' : 'Inactive',
            sortable: true,
            cell: row => (
                <span className={`badge ${row.isActive ? 'bg-success' : 'bg-secondary'}`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
            width: '120px',
            center: true
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div>
                    <Button
                        size="sm"
                        variant="info"
                        onClick={() => {
                            navigator.clipboard.writeText(row.email);
                            toast.success('Email copied to clipboard!');
                        }}
                        title="Copy Email"
                    >
                        <i className="fa fa-copy"></i>
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            width: '100px',
            center: true
        }
    ];

    useEffect(() => {
        fetchSubscribers();
    }, []);

    // Filter subscribers based on search text
    useEffect(() => {
        if (searchText === '') {
            setFilteredSubscribers(subscribers);
        } else {
            const filtered = subscribers.filter(subscriber =>
                subscriber.email.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredSubscribers(filtered);
        }
    }, [searchText, subscribers]);

    // Get all subscribers from API
    const fetchSubscribers = async () => {
        setLoading(true);
        const token = user?.token || localStorage.getItem('adminToken');

        try {
            const res = await get("newsletter/subscribers", token);
            console.log('Newsletter response:', res);

            if (res?.success) {
                setSubscribers(res?.data?.subscribers || []);
                setFilteredSubscribers(res?.data?.subscribers || []);
            } else {
                toast.error(res?.message || "Failed to fetch subscribers");
                setSubscribers([]);
                setFilteredSubscribers([]);
            }
        } catch (err) {
            console.error('Error fetching subscribers:', err);
            toast.error("Failed to load subscribers");
            setSubscribers([]);
            setFilteredSubscribers([]);
        } finally {
            setLoading(false);
            setHasLoadedOnce(true);
        }
    };

    // Handle row selection
    const handleRowSelected = React.useCallback(state => {
        setSelectedRows(state.selectedRows);
    }, []);

    // Export to CSV
    const exportToCSV = () => {
        if (filteredSubscribers.length === 0) {
            toast.warning("No subscribers to export");
            return;
        }

        const csvContent = [
            ['Email', 'Subscribed Date', 'Status'],
            ...filteredSubscribers.map(subscriber => [
                subscriber.email,
                moment(subscriber.createdAt).format('DD/MM/YYYY HH:mm'),
                subscriber.isActive ? 'Active' : 'Inactive'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        toast.success("Subscribers exported successfully!");
    };

    // Custom styles for DataTable
    const customStyles = {
        rows: {
            style: {
                minHeight: '60px',
            },
        },
        headCells: {
            style: {
                fontSize: '14px',
                fontWeight: 'bold',
                paddingLeft: '8px',
                paddingRight: '8px',
            },
        },
        cells: {
            style: {
                paddingLeft: '8px',
                paddingRight: '8px',
            },
        },
    };

    return (
        <React.Fragment>
            <Header />
            <div className="main main-app p-3 p-lg-4">
                <div className="d-md-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h4 className="main-title mb-0">Newsletter Subscribers</h4>
                        <p className="text-muted">Manage newsletter subscriptions and subscriber list</p>
                    </div>
                </div>

                <Row>
                    <Col xl={12}>
                        <Card>
                            <CardBody>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <CardTitle tag="h5" className="mb-0">
                                        All Subscribers ({filteredSubscribers.length})
                                    </CardTitle>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={exportToCSV}
                                        >
                                            <i className="fa fa-download me-1"></i>
                                            Export CSV
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={fetchSubscribers}
                                        >
                                            <i className="fa fa-refresh me-1"></i>
                                            Refresh
                                        </Button>
                                    </div>
                                </div>

                                {/* Search Filter */}
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by name, email, or message..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        style={{ maxWidth: '400px' }}
                                    />
                                </div>

                                {/* Data Table */}
                                <DataTable
                        progressPending={loading && !hasLoadedOnce}
                        progressComponent={<DataTableSkeleton />}
                                    columns={columns}
                                    data={filteredSubscribers}
                                    pagination
                                    paginationPerPage={20}
                                    paginationRowsPerPageOptions={[10, 20, 50, 100]}
                                    highlightOnHover
                                    striped
                                    responsive
                                    selectableRows
                                    onSelectedRowsChange={handleRowSelected}
                                    clearSelectedRows={toggleCleared}
                                    customStyles={customStyles}
                                    noDataComponent={
                                        <div className="p-4 text-center">
                                            <i className="fa fa-inbox fa-3x text-muted mb-3"></i>
                                            <p className="text-muted">No newsletter subscribers found</p>
                                        </div>
                                    }
                                />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Loading Overlay */}
                <Footer />
            </div>
        </React.Fragment>
    );
}

export default Newsletter;
