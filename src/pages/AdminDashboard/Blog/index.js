import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllBlogsAdmin, addBlog, updateBlog, deleteBlog, toggleBlogStatus } from '../../../helper/blog_helper';
import ConfirmModal from '../../../components/ConfirmModal';
import Header from '../../../layouts/Header';
import Footer from '../../../layouts/Footer';
import Sidebar from '../../../layouts/Sidebar';
import HeaderMobile from '../../../layouts/HeaderMobile';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BlogEditor = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBlog, setCurrentBlog] = useState(null);
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

    const handleDelete = async (id) => {
        setCurrentBlog({ _id: id, actionType: 'Delete' });
        setConfirm(true);
    };

    const handleToggleStatus = async (id) => {
        setCurrentBlog({ _id: id, actionType: 'ToggleStatus' });
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
            <HeaderMobile />
            <Header />
            <div className="main main-app p-3 p-lg-4">
                <Sidebar />
                <Container fluid className="py-4">
                    <ToastContainer />

                    {/* Add Blog List/Editor UI here based on state */}
                    {showModal ? (
                        <div className="admin-blog-editor">
                            <Row className="mb-4 align-items-center">
                                {/* Blog form code */}
                            </Row>
                            <Card className="shadow-sm border-0 mb-4">
                                <Card.Header className="bg-white py-3 border-bottom-0">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0 text-primary">
                                            <i className="ri-pencil-line me-2"></i>
                                            {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
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
                        <div className="admin-blog-list">
                            <Row className="mb-4">
                                <Col className="d-flex justify-content-between align-items-center">
                                    <h3 className="mb-0">Blog Management</h3>
                                    <Button variant="primary" onClick={() => handleShowModal()}>
                                        <i className="ri-add-line me-1"></i> Add New Blog
                                    </Button>
                                </Col>
                            </Row>

                            <Card className="shadow-sm border-0">
                                <Card.Body>
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="mt-2 text-muted">Loading blogs...</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table hover className="align-middle">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th>Image</th>
                                                        <th>Title</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {blogs.length > 0 ? (
                                                        blogs.map((blog) => (
                                                            <tr key={blog._id}>
                                                                <td>
                                                                    {blog.image ? (
                                                                        <img src={blog.image} alt={blog.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                                    ) : (
                                                                        <div className="bg-secondary text-white d-flex align-items-center justify-content-center" style={{ width: '60px', height: '40px', borderRadius: '4px' }}>No Img</div>
                                                                    )}
                                                                </td>
                                                                <td className="fw-medium">{blog.title}</td>
                                                                <td>
                                                                    <span className={`badge ${blog.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                                        {blog.isActive ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowModal(blog)}>
                                                                        <i className="ri-edit-line"></i> Edit
                                                                    </Button>
                                                                    <Button variant={blog.isActive ? "outline-warning" : "outline-success"} size="sm" className="me-2" onClick={() => handleToggleStatus(blog._id)}>
                                                                        {blog.isActive ? 'Deactivate' : 'Activate'}
                                                                    </Button>
                                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(blog._id)}>
                                                                        <i className="ri-delete-bin-line"></i> Delete
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="text-center py-4 text-muted">No blogs found.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                    <ConfirmModal
                        show={confirm}
                        onHide={() => setConfirm(false)}
                        onConfirm={onConfirm}
                        title={currentBlog?.actionType === 'Delete' ? 'Confirm Delete' : 'Confirm Action'}
                        body={`Are you sure you want to ${currentBlog?.actionType === 'Delete' ? 'delete' : 'change the status of'} this blog?`}
                    />
                </Container>
            </div>
            <Footer />
        </React.Fragment>
    );
};

export default BlogEditor;
