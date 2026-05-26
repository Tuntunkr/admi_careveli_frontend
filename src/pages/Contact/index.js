import React, { useEffect, useState } from 'react';
import Header from '../../layouts/Header';
import { Card, CardBody, CardTitle, Row, Col } from 'reactstrap';
import { Button } from 'react-bootstrap';
import { getAllContacts, deleteContact } from '../../helper/contact_helper';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import ConfirmModal from '../../components/ConfirmModal';
import Footer from '../../layouts/Footer';
import Loader from '../../layouts/Loader';
import moment from 'moment';

function Contact() {
    const user = useSelector(state => state.user);
    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [currentContact, setCurrentContact] = useState(null);
    const [confirm, setConfirm] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [toggleCleared, setToggleCleared] = useState(false);

    // DataTable columns configuration
    const columns = [
        {
            name: 'Date',
            selector: row => moment(row.createdAt).format('DD/MM/YYYY HH:mm'),
            sortable: true,
            width: '150px'
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
            wrap: true,
            width: '150px'
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
            wrap: true,
            width: '200px'
        },
        {
            name: 'Message',
            selector: row => row.msg,
            sortable: true,
            wrap: true,
            cell: row => (
                <div style={{ whiteSpace: 'normal', padding: '10px 0' }}>
                    {row.msg}
                </div>
            )
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteClick(row)}
                        title="Delete"
                    >
                        <i className="fa fa-trash"></i>
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            width: '100px'
        }
    ];

    // Fetch all contacts on component mount
    useEffect(() => {
        getData();
    }, []);

    // Filter contacts based on search text
    useEffect(() => {
        if (searchText === '') {
            setFilteredContacts(contacts);
        } else {
            const filtered = contacts.filter(contact =>
                contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
                contact.email.toLowerCase().includes(searchText.toLowerCase()) ||
                contact.msg.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredContacts(filtered);
        }
    }, [searchText, contacts]);

    // Get all contacts from API
    const getData = async () => {
        setLoading(true);
        try {
            const response = await getAllContacts();
            console.log('Contact response:', response);

            if (response.success) {
                setContacts(response.contacts || []);
                setFilteredContacts(response.contacts || []);
                toast.success(`Loaded ${response.contacts?.length || 0} contact messages`);
            } else {
                toast.error(response.message || 'Failed to fetch contacts');
                setContacts([]);
                setFilteredContacts([]);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to load contact messages');
            setContacts([]);
            setFilteredContacts([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle delete button click
    const handleDeleteClick = (contact) => {
        setCurrentContact(contact);
        setConfirm(true);
    };

    // Delete contact
    const handleDelete = async () => {
        if (!currentContact?._id) {
            toast.error('Invalid contact ID');
            return;
        }

        setLoading(true);
        try {
            const response = await deleteContact(currentContact._id);
            console.log('Delete response:', response);

            if (response.success) {
                toast.success(response.message || 'Contact deleted successfully');
                // Remove from local state
                const updatedContacts = contacts.filter(c => c._id !== currentContact._id);
                setContacts(updatedContacts);
                setFilteredContacts(updatedContacts);
            } else {
                toast.error(response.message || 'Failed to delete contact');
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
            toast.error('Failed to delete contact');
        } finally {
            setLoading(false);
            setConfirm(false);
            setCurrentContact(null);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedRows.length === 0) {
            toast.warning('No contacts selected');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} contact(s)?`)) {
            return;
        }

        setLoading(true);
        let successCount = 0;
        let failCount = 0;

        for (const contact of selectedRows) {
            try {
                const response = await deleteContact(contact._id);
                if (response.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                console.error('Error deleting contact:', error);
                failCount++;
            }
        }

        if (successCount > 0) {
            toast.success(`Successfully deleted ${successCount} contact(s)`);
            getData(); // Refresh list
        }
        if (failCount > 0) {
            toast.error(`Failed to delete ${failCount} contact(s)`);
        }

        setLoading(false);
        setSelectedRows([]);
        setToggleCleared(!toggleCleared);
    };

    // Handle row selection
    const handleRowSelected = React.useCallback(state => {
        setSelectedRows(state.selectedRows);
    }, []);

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
                        <h4 className="main-title mb-0">Contact Messages</h4>
                        <p className="text-muted">Manage customer contact messages and inquiries</p>
                    </div>
                </div>

                <Row>
                    <Col xl={12}>
                        <Card>
                            <CardBody>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <CardTitle tag="h5" className="mb-0">
                                        All Messages ({filteredContacts.length})
                                    </CardTitle>
                                    <div className="d-flex gap-2">
                                        {selectedRows.length > 0 && (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={handleBulkDelete}
                                            >
                                                <i className="fa fa-trash me-1"></i>
                                                Delete Selected ({selectedRows.length})
                                            </Button>
                                        )}
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={getData}
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
                                    columns={columns}
                                    data={filteredContacts}
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
                                            <p className="text-muted">No contact messages found</p>
                                        </div>
                                    }
                                />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Confirm Delete Modal */}
                <ConfirmModal
                    show={confirm}
                    onCloseClick={() => {
                        setConfirm(false);
                        setCurrentContact(null);
                    }}
                    onConfirm={handleDelete}
                    data={{
                        actionType: 'Delete'
                    }}
                />

                {/* Loading Overlay */}
                {loading && <Loader />}

                <Footer />
            </div>
        </React.Fragment>
    );
}

export default Contact;
