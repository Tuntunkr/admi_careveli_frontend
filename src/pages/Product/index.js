import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import { Card, CardBody, CardTitle, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap'
import { Button } from 'react-bootstrap';
import { get, post, upload } from '../../helper/api_helper';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import DataTableSkeleton from '../../components/DataTableSkeleton';
import { dataTableProductStyles, dataTablePaginationOptions } from '../../components/admin/dataTableConfig';
import ConfirmModal from '../../components/ConfirmModal';
import Footer from '../../layouts/Footer';
import * as Utils from "../../Utils";
import Loader from '../../layouts/Loader';
import moment from 'moment';
import AddProduct from './AddProduct';

function getCategoryLabel(value) {
    if (!value) return '—';
    if (typeof value === 'object') return value.title || value.name || '—';
    return value;
}

function normalizeProductImages(product) {
    const raw = product?.images || product?.image || [];
    return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

function ProductDetailsContent({ product }) {
    if (!product) return null;

    const productImages = normalizeProductImages(product);
    const categoryName = getCategoryLabel(product.category);
    const subCategoryName = getCategoryLabel(product.subCategory);
    const isBestseller = Boolean(product?.bestseller || product?.bestSeller);
    const isActive = product?.isActive !== false;

    return (
        <div className="product-details-modal">
            <div className="d-flex flex-wrap align-items-start gap-3 mb-4 pb-3 border-bottom">
                {productImages[0] ? (
                    <img
                        src={Utils.getImageUrl(productImages[0])}
                        alt={product.name}
                        className="product-details-modal__thumb"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                        }}
                    />
                ) : null}
                <div className="flex-grow-1">
                    <h5 className="mb-2 fw-bold">{product.name || '—'}</h5>
                    <div className="d-flex flex-wrap gap-2">
                        <span className={`badge rounded-pill ${isActive ? 'bg-success' : 'bg-secondary'}`}>
                            {isActive ? 'Active' : 'Inactive'}
                        </span>
                        {isBestseller && <span className="badge rounded-pill bg-warning text-dark">Bestseller</span>}
                        {product?.soldOut && <span className="badge rounded-pill bg-danger">Sold out</span>}
                    </div>
                    <code className="small text-muted d-block mt-2 text-break">{product._id}</code>
                </div>
            </div>

            <Row className="g-4">
                <Col md={6}>
                    <h6 className="fw-semibold mb-3">
                        <i className="ri-image-line me-1" />
                        Product images
                    </h6>
                    <Row className="g-2">
                        {productImages.length > 0 ? (
                            productImages.map((img, index) => (
                                <Col xs={6} sm={4} key={index}>
                                    <div className="product-details-modal__img-wrap">
                                        <img
                                            src={Utils.getImageUrl(img)}
                                            alt={`${product.name} ${index + 1}`}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                    </div>
                                </Col>
                            ))
                        ) : (
                            <Col xs={12}>
                                <p className="text-muted small mb-0">No images available</p>
                            </Col>
                        )}
                    </Row>
                </Col>

                <Col md={6}>
                    <h6 className="fw-semibold mb-3">
                        <i className="ri-file-list-3-line me-1" />
                        Product details
                    </h6>

                    <div className="mb-3">
                        <small className="text-muted d-block mb-1">Description</small>
                        <p className="mb-0 small">{product?.description || '—'}</p>
                    </div>

                    <Row className="g-2 mb-3">
                        <Col xs={6}>
                            <small className="text-muted d-block">Category</small>
                            <span className="fw-medium">{categoryName}</span>
                        </Col>
                        <Col xs={6}>
                            <small className="text-muted d-block">Sub category</small>
                            <span className="fw-medium">{subCategoryName}</span>
                        </Col>
                        <Col xs={6}>
                            <small className="text-muted d-block">Price</small>
                            <span className="fw-medium text-success">
                                ₹{product?.discountPrice ?? product?.price ?? '—'}
                            </span>
                            {product?.discountPrice && (
                                <span className="text-muted text-decoration-line-through ms-2 small">
                                    ₹{product.price}
                                </span>
                            )}
                        </Col>
                        <Col xs={6}>
                            <small className="text-muted d-block">Stock</small>
                            <span className="fw-medium">{product?.stock ?? 0} units</span>
                        </Col>
                        <Col xs={6}>
                            <small className="text-muted d-block">Sizes</small>
                            <span className="fw-medium">{product?.sizes?.join(', ') || '—'}</span>
                        </Col>
                        <Col xs={6}>
                            <small className="text-muted d-block">Rating</small>
                            <span className="fw-medium">
                                <i className="ri-star-fill text-warning me-1" />
                                {product?.rating || 0} ({product?.reviewCount || 0} reviews)
                            </span>
                        </Col>
                    </Row>

                    {product?.ingredients?.length > 0 && (
                        <div className="mb-3">
                            <small className="text-muted d-block mb-1">Ingredients</small>
                            <ul className="small mb-0 ps-3">
                                {product.ingredients.map((ing, idx) => (
                                    <li key={idx}>{ing}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {product?.benefits?.length > 0 && (
                        <div className="mb-3">
                            <small className="text-muted d-block mb-1">Benefits</small>
                            <ul className="small mb-0 ps-3">
                                {product.benefits.map((ben, idx) => (
                                    <li key={idx}>{ben}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {product?.howToUse && (
                        <div className="mb-3">
                            <small className="text-muted d-block mb-1">How to use</small>
                            <p className="small mb-0">{product.howToUse}</p>
                        </div>
                    )}

                    <div className="text-muted small">
                        <div>
                            <strong>Created:</strong>{' '}
                            {product?.createdAt
                                ? moment(product.createdAt).format('DD MMM YYYY, hh:mm A')
                                : '—'}
                        </div>
                        <div>
                            <strong>Updated:</strong>{' '}
                            {product?.updatedAt
                                ? moment(product.updatedAt).format('DD MMM YYYY, hh:mm A')
                                : '—'}
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

function Product() {
    const user = useSelector(state => state.user);
    const [isAdd, setIsAdd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [currentData, setCurrentData] = useState(null);
    const [confirm, setConfirm] = useState(false);

    // Pagination and Filters
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0
    });
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        search: '',
        category: '',
        sortBy: 'date',
        order: 'desc',
        minPrice: '',
        maxPrice: '',
        bestseller: ''
    });

    const [categories, setCategories] = useState([]);
    const [viewProduct, setViewProduct] = useState(null);

    useEffect(() => {
        // Get products on component mount (no auth required for list)
        getData();
    }, [filters]);

    useEffect(() => {
        // Fetch categories for the filter dropdown
        const fetchCategories = async () => {
            try {
                const res = await get('category/admin/list', {});
                if (res?.success && res?.data) {
                    setCategories(res.data);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        setColumns([
            {
                name: 'Image',
                cell: (row) => {
                    // Backend returns "images" (plural) not "image"
                    const imageUrl = Utils.getImageUrl(row?.images?.[0] || row?.image?.[0]);

                    return (
                        <img
                            src={imageUrl}
                            alt={row?.name || 'Product'}
                            style={{ width: 60, height: 60, objectFit: 'cover', padding: 5 }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                        />
                    );
                },
                maxWidth: '100px'
            },
            {
                name: 'Name',
                selector: row => row.name,
                sortable: true,
                wrap: true
            },
            {
                name: 'Category',
                selector: row => row.category && typeof row.category === 'object' ? row.category.title || row.category.name : row.category,
                sortable: true,
                maxWidth: '120px'
            },
            {
                name: 'Price',
                selector: row => {
                    if (row.discountPrice) {
                        return (
                            <div>
                                <span style={{ textDecoration: 'line-through', color: '#888', marginRight: '5px' }}>₹{row.price}</span>
                                <span style={{ color: '#28a745', fontWeight: 'bold' }}>₹{row.discountPrice}</span>
                            </div>
                        );
                    }
                    return `₹${row.price}`;
                },
                sortable: true
            },
            {
                name: 'Sizes',
                cell: (row) => (
                    <div style={{ fontSize: '11px' }}>
                        {row?.sizes?.join(', ')}
                    </div>
                ),
                maxWidth: '150px'
            },
            {
                name: 'Stock',
                selector: row => row.stock || 0,
                sortable: true,
                maxWidth: '100px'
            },
            {
                name: 'Bestseller',
                cell: (row) => (
                    <span className={`badge ${row?.bestSeller || row?.bestseller ? 'bg-success' : 'bg-secondary'}`}>
                        {row?.bestSeller || row?.bestseller ? 'Yes' : 'No'}
                    </span>
                ),
                maxWidth: '110px'
            },
            {
                name: 'Rating',
                cell: (row) => (
                    <div>
                        {row?.rating || 0} ⭐ ({row?.reviewCount || 0})
                    </div>
                ),
                maxWidth: '120px'
            },
            {
                name: 'Date',
                selector: row => moment(row?.createdAt).format("DD-MMM-YYYY"),
                sortable: true,
                maxWidth: '130px'
            },
            {
                cell: (row) => (
                    <Button
                        onClick={() => handleUpdateStatus(row)}
                        title={row?.isActive ? "Inactive" : "Active"}
                        className={`btn_status ${row?.isActive && 'active'}`}
                    >
                        <span className="text-white">
                            {!row?.isActive ? 'Inactive' : 'Active'}
                        </span>
                    </Button>
                ),
                name: 'Status',
                ignoreRowClick: true,
                minWidth: '120px',
                width: '120px',
                center: true,
            },
            {
                name: 'View',
                width: '72px',
                center: true,
                ignoreRowClick: true,
                cell: (row) => (
                    <button
                        type="button"
                        className="order-action-btn order-action-btn--view"
                        title="View product details"
                        onClick={() => setViewProduct(row)}
                    >
                        <i className="ri-eye-line" />
                    </button>
                ),
            },
            {
                cell: (row) => (
                    <>
                        <Button
                            onClick={() => handleUpdateProduct(row)}
                            title="Edit"
                            variant="primary"
                            style={{ marginRight: 10, padding: 5, paddingLeft: 8, paddingRight: 8, border: 'none' }}
                        >
                            <span className="ri-edit-fill" style={{ fontSize: 15 }}></span>
                        </Button>
                        <Button
                            onClick={() => handleDeleteProduct(row)}
                            title="Delete"
                            variant="danger"
                            style={{ marginRight: 10, padding: 5, paddingLeft: 8, paddingRight: 8, border: 'none' }}
                        >
                            <span className="ri-delete-bin-6-line" style={{ fontSize: 15 }}></span>
                        </Button>
                    </>
                ),
                name: 'Action',
                ignoreRowClick: true,
                maxWidth: '130px'
            },
        ]);
    }, [data]);

    const getData = () => {
        if (!loading) {
            setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            console.log("Fetching products from API with filters:", filters);

            get(`product/list?${queryParams}`, {})
                .then(res => {
                    setLoading(false);
                    console.log("Product API response:", res);
                    if (res?.success) {
                        // Handle new API response structure
                        if (res?.data) {
                            setData(res.data.products || []);
                            setPagination(res.data.pagination || {
                                currentPage: 1,
                                totalPages: 1,
                                totalProducts: 0
                            });
                            console.log("Products loaded:", res.data.products?.length || 0);
                        } else if (res?.products) {
                            // Fallback for old API structure
                            setData(res.products || []);
                            console.log("Products loaded (old structure):", res.products?.length || 0);
                        }
                    } else {
                        console.error("API returned success=false:", res);
                        toast.error(res?.message || "Failed to fetch products");
                    }
                })
                .catch(err => {
                    setLoading(false);
                    console.error("Error fetching products:", err);
                    toast.error("Something went wrong! Check if backend is running.");
                })
        }
    }

    const handleUpdateStatus = (row) => {
        setCurrentData({ ...row, actionType: "Status" });
        setConfirm(true);
    }

    const handleUpdateProduct = (row) => {
        setCurrentData(row);
        setIsAdd(true);
    }

    const handleDeleteProduct = (row) => {
        setCurrentData({ ...row, actionType: "Delete" });
        setConfirm(true);
    }

    // If Add/Edit mode is active, show AddProduct page instead
    if (isAdd) {
        return (
            <AddProduct
                currentData={currentData}
                onSuccess={() => {
                    setIsAdd(false);
                    setCurrentData(null);
                    getData();
                }}
                onCancel={() => {
                    setIsAdd(false);
                    setCurrentData(null);
                }}
            />
        );
    }

    const onConfirm = () => {
        if (!loading) {
            setLoading(true);

            if (currentData?.actionType === "Delete") {
                // Delete product with token in header
                const token = user?.token || localStorage.getItem('adminToken');
                post("product/remove", { id: currentData?._id, token })
                    .then(res => {
                        setLoading(false);
                        if (res?.success) {
                            toast.success("Product deleted successfully!");
                            getData();
                            setConfirm(false);
                            setCurrentData(null);
                        } else {
                            toast.error(res?.message || "Failed to delete product");
                        }
                    })
                    .catch(err => {
                        setLoading(false);
                        toast.error("Something went wrong!");
                        console.error(err);
                    });
            } else if (currentData?.actionType === "Status") {
                // Toggle product status using PATCH endpoint
                const token = user?.token || localStorage.getItem('adminToken');

                fetch(`${Utils.API_URL}product/toggle-status/${currentData._id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                    .then(res => res.json())
                    .then(res => {
                        setLoading(false);
                        if (res?.success) {
                            toast.success(res?.message || 'Product status updated successfully!');
                            getData();
                            setConfirm(false);
                            setCurrentData(null);
                        } else {
                            toast.error(res?.message || "Failed to update product status");
                        }
                    })
                    .catch(err => {
                        setLoading(false);
                        toast.error("Something went wrong!");
                        console.error(err);
                    });
            }
        }
    }

    return (
        <>
            <Header />
            <div className="main main-app p-3 p-lg-4">
                <div className="d-md-flex align-items-center justify-content-between mb-4">
                    <div>
                        <ol className="breadcrumb fs-sm mb-1">
                            <li className="breadcrumb-item"><a href="#">Dashboard</a></li>
                            <li className="breadcrumb-item active" aria-current="page">Products</li>
                        </ol>
                        <h4 className="main-title mb-0">Product Management</h4>
                    </div>
                    <Button
                        onClick={() => setIsAdd(true)}
                        style={{ backgroundColor: Utils.themeColor, border: 'none' }}
                    >
                        <i className="ri-add-line me-2"></i>Add Product
                    </Button>
                </div>

                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardBody>
                                <CardTitle className="h5 mb-3">All Products</CardTitle>

                                {/* Search and Filters */}
                                <Row className="mb-3">
                                    <Col md={3}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search products…"
                                            value={filters.search}
                                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                                        />
                                    </Col>
                                    <Col md={2}>
                                        <select
                                            className="form-select"
                                            value={filters.category}
                                            onChange={(e) => setFilters({ ...filters, category: e.target.value, subCategory: '', page: 1 })}
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.title || cat.name}</option>
                                            ))}
                                        </select>
                                    </Col>
                                    <Col md={2}>
                                        <select
                                            className="form-select"
                                            value={filters.bestseller}
                                            onChange={(e) => setFilters({ ...filters, bestseller: e.target.value, page: 1 })}
                                        >
                                            <option value="">All Products</option>
                                            <option value="true">Bestsellers Only</option>
                                            <option value="false">Non-Bestsellers</option>
                                        </select>
                                    </Col>
                                    <Col md={2}>
                                        <select
                                            className="form-select"
                                            value={filters.sortBy}
                                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                        >
                                            <option value="date">Sort by Date</option>
                                            <option value="price">Sort by Price</option>
                                            <option value="name">Sort by Name</option>
                                        </select>
                                    </Col>
                                    <Col md={1}>
                                        <select
                                            className="form-select"
                                            value={filters.order}
                                            onChange={(e) => setFilters({ ...filters, order: e.target.value })}
                                        >
                                            <option value="desc">↓</option>
                                            <option value="asc">↑</option>
                                        </select>
                                    </Col>
                                </Row>

                                {/* Price Range Filter */}
                                <Row className="mb-3">
                                    <Col md={2}>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Min Price (₹)"
                                            value={filters.minPrice}
                                            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value, page: 1 })}
                                        />
                                    </Col>
                                    <Col md={2}>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Max Price (₹)"
                                            value={filters.maxPrice}
                                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value, page: 1 })}
                                        />
                                    </Col>
                                    <Col md={2}>
                                        <Button
                                            onClick={() => setFilters({
                                                page: 1,
                                                limit: 20,
                                                search: '',
                                                category: '',
                                                subCategory: '',
                                                sortBy: 'date',
                                                order: 'desc',
                                                minPrice: '',
                                                maxPrice: '',
                                                bestseller: ''
                                            })}
                                            variant="outline-secondary"
                                            className="w-100"
                                        >
                                            <i className="ri-refresh-line me-1" />
                                            Reset Filters
                                        </Button>
                                    </Col>
                                    <Col md={6} className="text-end">
                                        <div className="d-flex align-items-center justify-content-end gap-2">
                                            <span className="text-muted">Active Filters:</span>
                                            {filters.search && (
                                                <span className="badge bg-primary">Search: {filters.search}</span>
                                            )}
                                            {filters.category && (
                                                <span className="badge bg-info">{filters.category}</span>
                                            )}
                                            {filters.subCategory && (
                                                <span className="badge bg-info">{filters.subCategory}</span>
                                            )}
                                            {filters.bestseller && (
                                                <span className="badge bg-warning">Bestseller</span>
                                            )}
                                            {(filters.minPrice || filters.maxPrice) && (
                                                <span className="badge bg-success">
                                                    ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '∞'}
                                                </span>
                                            )}
                                        </div>
                                    </Col>
                                </Row>

                                <div className="table-responsive admin-datatable-scroll">
                                <DataTable
                        progressPending={loading}
                        progressComponent={<DataTableSkeleton />}
                                    columns={columns}
                                    data={data}
                                    pagination
                                    paginationPerPage={filters.limit}
                                    paginationRowsPerPageOptions={[10, 20, 30, 50]}
                                    paginationComponentOptions={dataTablePaginationOptions}
                                    paginationServer
                                    paginationTotalRows={pagination.totalProducts}
                                    onChangePage={(page) => setFilters({ ...filters, page })}
                                    onChangeRowsPerPage={(newLimit) => setFilters({ ...filters, limit: newLimit, page: 1 })}
                                    customStyles={dataTableProductStyles}
                                    highlightOnHover
                                    striped
                                    fixedHeader
                                    fixedHeaderScrollHeight="480px"
                                />
                                </div>

                                {/* Pagination Info */}
                                {pagination.totalProducts > 0 && (
                                    <div className="mt-3 text-muted">
                                        Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
                                        {Math.min(pagination.currentPage * filters.limit, pagination.totalProducts)} of{' '}
                                        {pagination.totalProducts} products
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Modal isOpen={Boolean(viewProduct)} toggle={() => setViewProduct(null)} size="lg" centered>
                    <ModalHeader toggle={() => setViewProduct(null)}>
                        Product Details — {viewProduct?.name || 'Product'}
                    </ModalHeader>
                    <ModalBody>
                        {viewProduct && <ProductDetailsContent product={viewProduct} />}
                    </ModalBody>
                </Modal>

                {/* Confirm Modal */}
                <ConfirmModal
                    show={confirm}
                    onConfirm={onConfirm}
                    onCloseClick={() => {
                        setConfirm(false);
                        setCurrentData(null);
                    }}
                    data={currentData}
                />

                <Footer />
            </div>
        </>
    )
}

export default Product;
