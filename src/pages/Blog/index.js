import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllBlogsAdmin, addBlog, updateBlog, deleteBlog, toggleBlogStatus } from '../../helper/blog_helper';
import ConfirmModal from '../../components/ConfirmModal';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import * as Utils from '../../Utils';
import AdminAddButton from '../../components/admin/AdminAddButton';
import { dataTableCustomStyles, dataTablePaginationOptions } from '../../components/admin/dataTableConfig';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DataTable from 'react-data-table-component';
import DataTableSkeleton from '../../components/DataTableSkeleton';
import moment from 'moment';
import Loader from '../../layouts/Loader';

const BlogEditor = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBlog, setCurrentBlog] = useState(null);
    const [columns, setColumns] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        desc: '',
        image: null,
        isActive: true
    });
    const [submitting, setSubmitting] = useState(false);
    const [confirm, setConfirm] = useState(false);

    useEffect(() => {
        fetchBlogs();
    }, []);

    useEffect(() => {
        setColumns([
            {
                name: 'Image',
                cell: (row) => <>
                    {row?.image ? (
                        <img src={row.image} alt={row.title} style={{ width: 100, height: 60, padding: 5, objectFit: 'cover' }} />
                    ) : (
                        <div className="bg-secondary text-white d-flex align-items-center justify-content-center" style={{ width: 100, height: 60, borderRadius: '4px' }}>No Img</div>
                    )}
                </>,
                maxWidth: '200px',
                minWidth: '120px'
            },
            {
                name: 'Title',
                selector: row => row?.title || '-',
                sortable: true,
                wrap: true,
                minWidth: '200px'
            },
            {
                name: 'Date',
                selector: row => moment(row?.createdAt || row?.date).format("DD-MMM-YYYY"),
                sortable: true,
                minWidth: '130px'
            },
            {
                cell: (row) => <>
                    <Button onClick={() => handleToggleStatus(row)}
                        title={row?.isActive ? "Active" : "Inactive"}
                        className={`btn_status ${row?.isActive && 'active'}`}
                        style={{ padding: '0px', border: 'none', backgroundColor: 'transparent' }}
                    >
                        <span className="text-white" style={{ backgroundColor: row?.isActive ? '#198754' : '#6c757d', padding: '5px 10px', borderRadius: '4px', display: 'inline-block' }}>
                            {row?.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </Button>
                </>,
                name: 'Status',
                ignoreRowClick: true,
                maxWidth: '120px'
            },
            {
                cell: (row) => (
                    <div className="d-flex gap-1">
                        <Button
                            onClick={() => {
                                const slug = row?.slug || row?._id;
                                window.open(`${Utils.STORE_FRONT_URL}/blog/${slug}`, '_blank', 'noopener,noreferrer');
                            }}
                            title="Preview on store"
                            variant="outline-primary"
                            size="sm"
                            style={{ padding: '4px 8px', border: 'none' }}
                        >
                            <i className="ri-eye-line" />
                        </Button>
                        <Button
                            onClick={() => handleShowModal(row)}
                            title="Edit"
                            variant="primary"
                            size="sm"
                            style={{ padding: '4px 8px', border: 'none' }}
                        >
                            <i className="ri-edit-fill" />
                        </Button>
                        <Button
                            onClick={() => handleDelete(row._id)}
                            title="Delete"
                            variant="danger"
                            size="sm"
                            style={{ padding: '4px 8px', border: 'none' }}
                        >
                            <i className="ri-delete-bin-6-line" />
                        </Button>
                    </div>
                ),
                name: 'Actions',
                ignoreRowClick: true,
                minWidth: '140px',
            },
        ]);
    }, [blogs]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await getAllBlogsAdmin();
            console.log("Blogs API response: ", response);
            if (response && response.success) {
                // Determine format of returned data (depends on what backend returns for Admin List)
                const fetchedBlogs = response.data || response.blogs || response.data?.blogs || response.list || (Array.isArray(response.data) ? response.data : []) || [];
                setBlogs(fetchedBlogs);
            } else if (response && Array.isArray(response.data)) {
                // Some APIs don't send a success flag but just send data
                setBlogs(response.data);
            } else if (Array.isArray(response)) {
                // In case it's a direct array
                setBlogs(response);
            } else if (response && response.blogs) {
                setBlogs(response.blogs);
            } else {
                toast.error('Failed to fetch blogs');
            }
        } catch (error) {
            toast.error('Error loading blogs');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleShowModal = (blog = null) => {
        if (blog && blog._id) {
            setIsEditing(true);
            setCurrentBlog(blog);
            setFormData({
                title: blog.title || '',
                desc: blog.desc || '',
                image: null,
                isActive: blog.isActive
            });
        } else {
            setIsEditing(false);
            setCurrentBlog(null);
            setFormData({
                title: '',
                desc: '',
                image: null,
                isActive: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentBlog(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            setFormData({ ...formData, [name]: files[0] });
        } else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleDescriptionChange = (content) => {
        setFormData({ ...formData, desc: content });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEditing && !formData.image) {
            toast.error('Please upload an image for the blog');
            return;
        }

        try {
            setSubmitting(true);

            const data = new FormData();
            if (formData.title) data.append('title', formData.title);
            if (formData.desc) data.append('desc', formData.desc);
            if (formData.image) data.append('image', formData.image);
            if (isEditing) data.append('isActive', formData.isActive);

            let response;
            if (isEditing && currentBlog?._id) {
                response = await updateBlog(currentBlog._id, data);
            } else {
                response = await addBlog(data);
            }

            if (response && response.success) {
                toast.success(`Blog successfully ${isEditing ? 'updated' : 'added'}`);
                fetchBlogs();
                handleCloseModal();
            } else {
                toast.error(response?.message || 'Operation failed');
            }
        } catch (error) {
            toast.error('Error saving blog');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (blog) => {
        setCurrentBlog({ _id: blog._id, actionType: 'ToggleStatus' });
        setConfirm(true);
    };

    const handleDelete = async (blogId) => {
        setCurrentBlog({ _id: blogId, actionType: 'Delete' });
        setConfirm(true);
    };

    const onConfirm = () => {
        if (currentBlog?.actionType === 'Delete') {
            performDelete(currentBlog._id);
        } else if (currentBlog?.actionType === 'ToggleStatus') {
            performToggle(currentBlog._id);
        }
    };

    const performDelete = async (id) => {
        try {
            const response = await deleteBlog(id);
            if (response && response.success) {
                toast.success('Blog deleted successfully');
                setConfirm(false);
                fetchBlogs();
            } else {
                toast.error(response?.message || 'Failed to delete blog');
            }
        } catch (error) {
            toast.error('Error deleting blog');
            console.error(error);
        }
    };

    const performToggle = async (id) => {
        try {
            const response = await toggleBlogStatus(id);
            if (response && response.success) {
                toast.success('Blog status toggled successfully');
                setConfirm(false);
                fetchBlogs();
            } else {
                toast.error(response?.message || 'Failed to toggle status');
            }
        } catch (error) {
            toast.error('Error toggling status');
            console.error(error);
        }
    };

    return (
        <React.Fragment>
            <Header />
            <ConfirmModal
                show={confirm}
                onCloseClick={() => setConfirm(false)}
                onConfirm={onConfirm}
                data={currentBlog}
            />
            <div className="main main-app p-3 p-lg-4">
                {showModal ? (
                    <div className="admin-blog-editor">
                        <Row className="mb-4 align-items-center">
                            <Col md={11}>
                                <Card.Title><b>{isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}</b></Card.Title>
                            </Col>
                        </Row>
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Header className="bg-white py-3 border-bottom-0">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 text-primary">
                                        <i className="ri-pencil-line me-2"></i>
                                    </h5>
                                    <Button variant="outline-secondary" size="sm" onClick={handleCloseModal}>
                                        <i className="ri-arrow-go-back-line me-1"></i> Back to List
                                    </Button>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={12} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Title *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={12} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Image {isEditing ? '(Optional - upload to replace)' : '*'}</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    name="image"
                                                    accept="image/*"
                                                    onChange={handleInputChange}
                                                    required={!isEditing}
                                                />
                                            </Form.Group>
                                        </Col>
                                        {isEditing && (
                                            <Col md={12} className="mb-3">
                                                <Form.Check
                                                    type="switch"
                                                    id="active-switch"
                                                    label="Active Status"
                                                    name="isActive"
                                                    checked={formData.isActive}
                                                    onChange={handleInputChange}
                                                />
                                            </Col>
                                        )}

                                        <Col md={12} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Content *</Form.Label>
                                                <ReactQuill
                                                    theme="snow"
                                                    value={formData.desc}
                                                    onChange={handleDescriptionChange}
                                                    style={{ height: '300px', marginBottom: '50px' }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <div className="mt-4 form-group">
                                        <Button type="submit" variant="primary" disabled={submitting}>
                                            {submitting ? <Spinner size="sm" /> : (isEditing ? 'Update Blog' : 'Create Blog')}
                                        </Button>
                                        <Button type="button" variant="secondary" className="ms-2" onClick={handleCloseModal}>
                                            Cancel
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                ) : (
                    <Card>
                        <div className="main-page-header d-md-flex align-items-center justify-content-between p-3 pb-0">
                            <div>
                                <ol className="breadcrumb fs-sm mb-1">
                                    <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
                                    <li className="breadcrumb-item active" aria-current="page">Blog Management</li>
                                </ol>
                                <h4 className="main-title mb-0 admin-page-title">Blog Management</h4>
                            </div>
                            <AdminAddButton label="Create Blog" onClick={() => handleShowModal()} />
                        </div>
                        <DataTable
                        progressPending={loading}
                        progressComponent={<DataTableSkeleton />}
                            columns={columns}
                            data={blogs}
                            pagination
                            highlightOnHover
                            striped
                            paginationComponentOptions={dataTablePaginationOptions}
                            customStyles={dataTableCustomStyles}
                            noDataComponent={
                                <div className="text-center py-4 text-muted">No blogs found.</div>
                            }
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[10, 20, 30, 50]}
                        />
                    </Card>
                )}
            </div>
            <Footer />
        </React.Fragment>
    );
};

export default BlogEditor;
