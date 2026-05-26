import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardTitle, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Button, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import Loader from '../../layouts/Loader';
import moment from 'moment';
import {
    getAllTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialStatus,
    exportTestimonialsToCSV,
    downloadCSV
} from '../../helper/testimonial_helper';
import * as Utils from '../../Utils';

function Testimonial() {
    const user = useSelector(state => state.user);
    const [loading, setLoading] = useState(false);
    const [testimonials, setTestimonials] = useState([]);
    const [filteredTestimonials, setFilteredTestimonials] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // create or edit
    const [currentTestimonial, setCurrentTestimonial] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        rating: 5,
        title: '',
        review: '',
        isVerified: false,
        isActive: true
    });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // DataTable columns configuration
    const columns = [
        {
            name: '#',
            cell: (row, index) => index + 1,
            width: '60px',
            center: true
        },
        {
            name: 'Profile',
            cell: row => (
                <div className="avatar-sm my-2">
                    {row.profileImage ? (
                        <img
                            src={Utils.getImageUrl(row.profileImage)}
                            alt={row.name}
                            className="rounded-circle"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/40';
                            }}
                        />
                    ) : (
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}>
                            {row.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            ),
            width: '80px',
            center: true
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
            cell: row => (
                <div>
                    <div className="fw-bold">{row.name}</div>
                    {row.isVerified && (
                        <span className="badge bg-info text-white" style={{ fontSize: '10px' }}>
                            <i className="fa fa-check-circle"></i> Verified
                        </span>
                    )}
                </div>
            ),
            width: '150px'
        },
        {
            name: 'Rating',
            selector: row => row.rating,
            sortable: true,
            cell: row => (
                <div className="text-warning">
                    {'⭐'.repeat(row.rating)}
                </div>
            ),
            width: '140px'
        },
        {
            name: 'Title',
            selector: row => row.title,
            sortable: true,
            wrap: true,
            width: '200px'
        },
        {
            name: 'Review',
            selector: row => row.review,
            cell: row => (
                <div style={{ whiteSpace: 'normal', padding: '8px 0' }}>
                    {row.review?.length > 100 ? `${row.review.substring(0, 100)}...` : row.review}
                </div>
            ),
            wrap: true,
            grow: 2
        },
        {
            name: 'Status',
            selector: row => row.isActive,
            sortable: true,
            cell: row => (
                <span className={`badge ${row.isActive ? 'bg-success' : 'bg-secondary'}`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
            width: '100px',
            center: true
        },
        {
            name: 'Date',
            selector: row => row.createdAt,
            sortable: true,
            cell: row => moment(row.createdAt).format('DD/MM/YYYY'),
            width: '120px'
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="d-flex gap-1">
                    <Button
                        size="sm"
                        variant={row.isActive ? 'warning' : 'success'}
                        onClick={() => handleToggleStatus(row._id)}
                        title={row.isActive ? 'Deactivate' : 'Activate'}
                    >
                        <i className={`fa fa-${row.isActive ? 'eye-slash' : 'eye'}`}></i>
                    </Button>
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleEdit(row)}
                        title="Edit"
                    >
                        <i className="fa fa-edit"></i>
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(row._id)}
                        title="Delete"
                    >
                        <i className="fa fa-trash"></i>
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            width: '140px',
            center: true
        }
    ];

    useEffect(() => {
        fetchTestimonials();
    }, []);

    // Filter testimonials based on search text and status
    useEffect(() => {
        let filtered = testimonials;

        // Filter by status
        if (filterStatus === 'active') {
            filtered = filtered.filter(t => t.isActive);
        } else if (filterStatus === 'inactive') {
            filtered = filtered.filter(t => !t.isActive);
        }

        // Filter by search text
        if (searchText) {
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(searchText.toLowerCase()) ||
                t.title?.toLowerCase().includes(searchText.toLowerCase()) ||
                t.review?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        setFilteredTestimonials(filtered);
    }, [searchText, filterStatus, testimonials]);

    // Fetch all testimonials
    const fetchTestimonials = async () => {
        setLoading(true);
        const token = user?.token || localStorage.getItem('adminToken');

        console.log('=== Fetching Testimonials ===');
        console.log('Token:', token ? 'Present' : 'Missing');
        console.log('API URL:', Utils.API_URL);

        try {
            const res = await getAllTestimonials({ isDeleted: false }, token);
            console.log('Testimonials response:', res);
            console.log('Response type:', typeof res);
            console.log('Response keys:', res ? Object.keys(res) : 'null');

            // Handle different response structures
            if (res?.success && res?.data) {
                // Standard success response with data array
                setTestimonials(res.data || []);
                setFilteredTestimonials(res.data || []);
                toast.success(`Loaded ${res.totalTestimonials || res.data.length || 0} testimonials`);
            } else if (res?.testimonials) {
                // Alternative: data in testimonials field
                setTestimonials(res.testimonials || []);
                setFilteredTestimonials(res.testimonials || []);
                toast.success(`Loaded ${res.testimonials.length} testimonials`);
            } else if (Array.isArray(res)) {
                // Alternative: direct array response
                setTestimonials(res);
                setFilteredTestimonials(res);
                toast.success(`Loaded ${res.length} testimonials`);
            } else {
                // Error or unexpected format
                console.error('Unexpected response format:', res);
                toast.error(res?.message || "Failed to fetch testimonials");
                setTestimonials([]);
                setFilteredTestimonials([]);
            }
        } catch (err) {
            console.error('Error fetching testimonials:', err);
            toast.error(`Failed to load testimonials: ${err.message || 'Network error'}`);
            setTestimonials([]);
            setFilteredTestimonials([]);
        } finally {
            setLoading(false);
        }
    };

    // Open modal for creating new testimonial
    const handleCreate = () => {
        setModalMode('create');
        setCurrentTestimonial(null);
        setFormData({
            name: '',
            rating: 5,
            title: '',
            review: '',
            isVerified: false,
            isActive: true
        });
        setProfileImage(null);
        setImagePreview(null);
        setShowModal(true);
    };

    // Open modal for editing testimonial
    const handleEdit = (testimonial) => {
        setModalMode('edit');
        setCurrentTestimonial(testimonial);
        setFormData({
            name: testimonial.name,
            rating: testimonial.rating,
            title: testimonial.title || '',
            review: testimonial.review || '',
            isVerified: testimonial.isVerified,
            isActive: testimonial.isActive
        });
        setProfileImage(null);
        setImagePreview(testimonial.profileImage ? Utils.getImageUrl(testimonial.profileImage) : null);
        setShowModal(true);
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setProfileImage(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }
        if (!formData.review.trim()) {
            toast.error('Review is required');
            return;
        }

        setSubmitting(true);
        const token = user?.token || localStorage.getItem('adminToken');

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('rating', formData.rating);
            data.append('title', formData.title);
            data.append('review', formData.review);
            data.append('isVerified', formData.isVerified);
            data.append('isActive', formData.isActive);

            if (profileImage) {
                data.append('profileImage', profileImage);
            }

            let res;
            if (modalMode === 'create') {
                res = await createTestimonial(data, token);
            } else {
                res = await updateTestimonial(currentTestimonial._id, data, token);
            }

            if (res?.success) {
                toast.success(res.message || `Testimonial ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
                setShowModal(false);
                fetchTestimonials();
            } else {
                toast.error(res?.message || `Failed to ${modalMode} testimonial`);
            }
        } catch (err) {
            console.error(`Error ${modalMode} testimonial:`, err);
            toast.error(`Failed to ${modalMode} testimonial`);
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle testimonial status
    const handleToggleStatus = async (id) => {
        const token = user?.token || localStorage.getItem('adminToken');

        try {
            const res = await toggleTestimonialStatus(id, token);

            if (res?.success) {
                toast.success(res.message || 'Status updated successfully!');
                fetchTestimonials();
            } else {
                toast.error(res?.message || 'Failed to update status');
            }
        } catch (err) {
            console.error('Error toggling status:', err);
            toast.error('Failed to update status');
        }
    };

    // Delete testimonial
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this testimonial?')) {
            return;
        }

        const token = user?.token || localStorage.getItem('adminToken');

        try {
            const res = await deleteTestimonial(id, token);

            if (res?.success) {
                toast.success(res.message || 'Testimonial deleted successfully!');
                fetchTestimonials();
            } else {
                toast.error(res?.message || 'Failed to delete testimonial');
            }
        } catch (err) {
            console.error('Error deleting testimonial:', err);
            toast.error('Failed to delete testimonial');
        }
    };

    // Export to CSV
    const handleExportCSV = () => {
        if (filteredTestimonials.length === 0) {
            toast.warning("No testimonials to export");
            return;
        }

        const csvContent = exportTestimonialsToCSV(filteredTestimonials);
        if (csvContent) {
            downloadCSV(csvContent, `testimonials_${new Date().toISOString().split('T')[0]}.csv`);
            toast.success("Testimonials exported successfully!");
        }
    };

    if (loading) return <Loader />;

    return (
        <React.Fragment>
            <Header />
            <div className="main main-app p-3 p-lg-4">
                <div className="d-md-flex align-items-center justify-content-between mb-4">
                    <div>
                        <ol className="breadcrumb fs-sm mb-1">
                            <li className="breadcrumb-item"><a href="#">Dashboard</a></li>
                            <li className="breadcrumb-item active" aria-current="page">Testimonials</li>
                        </ol>
                        <h4 className="main-title mb-0">Manage Testimonials</h4>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        <Button
                            variant="primary"
                            onClick={handleCreate}
                        >
                            <i className="fa fa-plus"></i> Add Testimonial
                        </Button>
                        <Button
                            variant="success"
                            onClick={handleExportCSV}
                            disabled={filteredTestimonials.length === 0}
                        >
                            <i className="fa fa-download"></i> Export CSV
                        </Button>
                    </div>
                </div>

                <Row>
                    <Col xl={12}>
                        <Card>
                            <CardBody>
                                <div className="mb-3">
                                    <Row>
                                        <Col md={6}>
                                            <Form.Control
                                                type="text"
                                                placeholder="Search by name, title, or review..."
                                                value={searchText}
                                                onChange={(e) => setSearchText(e.target.value)}
                                            />
                                        </Col>
                                        <Col md={3}>
                                            <Form.Select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                            >
                                                <option value="all">All Status</option>
                                                <option value="active">Active Only</option>
                                                <option value="inactive">Inactive Only</option>
                                            </Form.Select>
                                        </Col>
                                        <Col md={3} className="text-end">
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => {
                                                    setSearchText('');
                                                    setFilterStatus('all');
                                                }}
                                            >
                                                Clear Filters
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>

                                <DataTable
                                    columns={columns}
                                    data={filteredTestimonials}
                                    pagination
                                    paginationPerPage={10}
                                    paginationRowsPerPageOptions={[10, 20, 30, 50]}
                                    highlightOnHover
                                    responsive
                                    striped
                                    noDataComponent={
                                        <div className="text-center py-5">
                                            <i className="fa fa-comments" style={{ fontSize: '48px', color: '#ccc' }}></i>
                                            <p className="mt-3">No testimonials found</p>
                                        </div>
                                    }
                                />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Create/Edit Modal */}
                <Modal isOpen={showModal} toggle={() => setShowModal(false)} size="lg">
                    <ModalHeader toggle={() => setShowModal(false)}>
                        {modalMode === 'create' ? 'Add New Testimonial' : 'Edit Testimonial'}
                    </ModalHeader>
                    <Form onSubmit={handleSubmit}>
                        <ModalBody>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter customer name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Rating <span className="text-danger">*</span></Form.Label>
                                        <Form.Select
                                            value={formData.rating}
                                            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                                            required
                                        >
                                            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                                            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                                            <option value="3">⭐⭐⭐ (3 Stars)</option>
                                            <option value="2">⭐⭐ (2 Stars)</option>
                                            <option value="1">⭐ (1 Star)</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Profile Image</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
                                        />
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g., Best Product Ever!"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Review <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder="Enter testimonial review..."
                                    value={formData.review}
                                    onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                                    required
                                />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="checkbox"
                                            label="Verified Purchase"
                                            checked={formData.isVerified}
                                            onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="checkbox"
                                            label="Active (Show on website)"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        {modalMode === 'create' ? 'Creating...' : 'Updating...'}
                                    </>
                                ) : (
                                    modalMode === 'create' ? 'Create Testimonial' : 'Update Testimonial'
                                )}
                            </Button>
                        </ModalFooter>
                    </Form>
                </Modal>

                <Footer />
            </div>
        </React.Fragment>
    );
}

export default Testimonial;
