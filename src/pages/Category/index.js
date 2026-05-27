import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom';
import Header from '../../layouts/Header'
import { Card, CardBody, CardTitle, Row, Col, Modal, ModalBody, Label, Input } from 'reactstrap'
import { Button } from 'react-bootstrap';
import { AvForm, AvField } from "availity-reactstrap-validation";
import { del, get, post, put } from '../../helper/api_helper';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import DataTableSkeleton from '../../components/DataTableSkeleton';
import ConfirmModal from '../../components/ConfirmModal';
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import Footer from '../../layouts/Footer';
import AdminAddButton from '../../components/admin/AdminAddButton';
import { dataTableCustomStyles, dataTablePaginationOptions } from '../../components/admin/dataTableConfig';
import * as Utils from "../../Utils";
import Loader from '../../layouts/Loader';
import moment from 'moment';

function CategoryManagement() {

    const userState = useSelector(state => state.user);
    // Handle both direct token access and nested user object
    const user = userState?.user || userState;
    const token = user?.token || localStorage.getItem("adminToken");

    const [isAdd, setIsAdd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [currentData, setCurrentData] = useState(null);
    const [confirm, setConfirm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return data;
        const q = searchTerm.trim().toLowerCase();
        return data.filter(item =>
            String(item?.title || item?.name || '').toLowerCase().includes(q)
        );
    }, [data, searchTerm]);

    useEffect(() => {
        if (token) {
            getData();
        } else {
            toast.error("No authentication token found. Please login again.");
        }
    }, [token]);

    useEffect(() => {
        setColumns([
            {
                name: 'Sr. No.',
                selector: (row, index) => index + 1,
                sortable: false,
                width: '100px'
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
                selector: row => row?.createdAt ? moment(row.createdAt).format("DD-MMM-YYYY") : '-',
                sortable: true,
                minWidth: '150px'
            },
            {
                cell: (row) => <>
                    <Button onClick={() => handleUpdateStatus(row)}
                        title={row?.isActive ? "Active" : "Inactive"}
                        className={`btn_status ${row?.isActive ? 'active' : ''}`}
                    >
                        <span className="text-white">
                            {row?.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </Button>
                </>,
                name: 'Status',
                ignoreRowClick: true,
                maxWidth: '120px'
            },
            {
                cell: (row) => <>
                    <Button onClick={() => handleUpdateCategory(row)}
                        title={"Edit"} variant="primary"
                        style={{ marginRight: 10, padding: 5, paddingLeft: 8, paddingRight: 8, border: 'none' }}>
                        <span className="ri-edit-fill" style={{ fontSize: 15 }}></span>
                    </Button>
                    <Button onClick={() => handleDeleteCategory(row)}
                        title={"Delete"} variant="danger"
                        style={{ marginRight: 10, padding: 5, paddingLeft: 8, paddingRight: 8, border: 'none' }}>
                        <span className="ri-delete-bin-6-line" style={{ fontSize: 15 }}></span>
                    </Button>
                </>,
                name: 'Action',
                ignoreRowClick: true,
                maxWidth: '130px'
            },
        ]);
    }, [data]);

    useEffect(() => {
        if (!isAdd) {
            // Reset state on modal close
        }
    }, [isAdd]);

    const getData = () => {
        if (!loading) {
            setLoading(true);
            fetch(`${Utils.API_URL}category/admin/list`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'token': token
                }
            })
                .then(res => res.json())
                .then(res => {
                    setLoading(false);
                    // Add robust parsing since response may vary in format
                    if (res?.success !== false) {
                        const items = res?.categories || res?.data || res || [];
                        setData(Array.isArray(items) ? items : []);
                        if (!items || items.length === 0) {
                            toast.info("No categories found");
                        }
                    } else {
                        toast.error(res?.message || res?.error || "Failed to fetch categories");
                    }
                })
                .catch(err => {
                    setLoading(false);
                    console.error("Error fetching categories:", err);
                    toast.error("Something Went Wrong! Check console for details.");
                })
        }
    }

    const handleUpdateStatus = (row) => {
        setCurrentData({ ...row, actionType: "ToggleStatus" });
        setConfirm(true);
    }

    const updateCategoryStatus = () => {
        if (!loading) {
            setLoading(true);
            fetch(`${Utils.API_URL}category/toggle-status/${currentData?._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'token': token
                }
            })
                .then(res => res.json())
                .then(res => {
                    setLoading(false);
                    if (res?.success !== false) {
                        setConfirm(false);
                        toast.success(res?.message || "Status updated successfully");
                        getData();
                    } else {
                        toast.error(res?.message || res?.error || "Failed to update status");
                    }
                })
                .catch(err => {
                    setLoading(false);
                    console.error("Error updating status:", err);
                    toast.error("Something Went Wrong!");
                });
        }
    }

    const handleUpdateCategory = (row) => {
        setCurrentData(row);
        setIsAdd(true);
    }

    const handleDeleteCategory = (row) => {
        setCurrentData({ ...row, actionType: "Delete" });
        setConfirm(true);
    }

    const onConfirm = () => {
        if (currentData?.actionType === 'Delete') {
            deleteCategoryAction();
        } else if (currentData?.actionType === 'ToggleStatus') {
            updateCategoryStatus();
        }
    }

    const deleteCategoryAction = () => {
        if (!loading) {
            setLoading(true);
            fetch(`${Utils.API_URL}category/delete/${currentData?._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'token': token
                }
            })
                .then(res => res.json())
                .then(res => {
                    setLoading(false);
                    if (res?.success !== false) { // Assuming response succeeds
                        setConfirm(false);
                        toast.success("Deleted Successfully");
                        getData();
                    } else {
                        toast.error(res?.message || "Failed to delete");
                    }
                })
                .catch(err => {
                    setLoading(false);
                    toast.error("Something Went Wrong!");
                });
        }
    }

    const handleSubmit = (e, v) => {
        if (!loading) {
            setLoading(true);

            const endpoint = currentData?._id ? `category/update/${currentData._id}` : `category/add`;
            const method = currentData?._id ? 'PUT' : 'POST';

            const payload = {
                title: v && v.title ? v.title : '',
                isActive: v && v.isActive !== undefined ? (v.isActive === 'true' || v.isActive === true) : true
            };

            fetch(`${Utils.API_URL}${endpoint}`, {
                method: method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'token': token
                },
                body: JSON.stringify(payload)
            })
                .then(res => res.json())
                .then(res => {
                    setLoading(false);
                    if (res?.success !== false) {
                        toast.success(currentData?._id ? "Category Updated Successfully!" : "Category Added Successfully!");
                        setIsAdd(false);
                        setCurrentData(null);
                        getData();
                    } else {
                        toast.error(res?.message || "Failed to save category");
                    }
                }).catch(err => {
                    setLoading(false);
                    toast.error("Something went wrong!");
                });
        }
    }


    return (
        <React.Fragment>
            <Header />
            <ConfirmModal
                show={confirm}
                onConfirm={onConfirm}
                onCloseClick={() => setConfirm(false)}
                data={currentData}
            />
            <div className="main main-app p-3 p-lg-4">
                <div className="main-page-header d-md-flex align-items-center justify-content-between mb-3">
                    <div>
                        <ol className="breadcrumb fs-sm mb-1">
                            <li className="breadcrumb-item"><Link to="/admin/dashboard">Dashboard</Link></li>
                            <li className="breadcrumb-item active" aria-current="page">Category Management</li>
                        </ol>
                        <h4 className="main-title mb-0 admin-page-title">Category Management</h4>
                    </div>
                    <AdminAddButton label="Add Category" onClick={() => { setCurrentData(null); setIsAdd(true) }} />
                </div>
                <Card>
                    <CardBody className="pb-0">
                        <div className="admin-search-wrap mb-3" style={{ maxWidth: '360px' }}>
                            <i className="ri-search-line admin-search-icon" />
                            <Input
                                type="search"
                                className="form-control"
                                placeholder="Search categories…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardBody>
                    <DataTable
                        progressPending={loading}
                        progressComponent={<DataTableSkeleton />}
                        columns={columns}
                        data={filteredData}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 20, 30, 50]}
                        paginationComponentOptions={dataTablePaginationOptions}
                        customStyles={dataTableCustomStyles}
                        striped
                        highlightOnHover
                    />
                </Card>
                <Footer />
            </div>

            <Modal isOpen={isAdd} toggle={() => setIsAdd(false)} size="md" centered className="modal-dialog-centered">
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">{currentData ? "Update Category" : "Add Category"}</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setIsAdd(false)}></button>
                </div>
                <div className="modal-body">
                    <AvForm onValidSubmit={handleSubmit}>
                        <div className="mb-3">
                            <Label htmlFor="title" className="form-label mb-1">Title</Label>
                            <AvField
                                name="title"
                                type="text"
                                className="form-control"
                                id="title"
                                value={currentData?.title || ''}
                                required
                                placeholder="Enter Category Title"
                                errorMessage="Title is Required"
                            />
                        </div>

                        <div className="text-end">
                            <Button type="button" className="btn-light" onClick={() => setIsAdd(false)} style={{ marginRight: 10 }}>Cancel</Button>
                            <Button type="submit" className="btn-primary" disabled={loading} style={{ backgroundColor: Utils.themeColor, border: 'none' }}>{currentData ? "Update" : "Save"}</Button>
                        </div>
                    </AvForm>
                </div>
            </Modal>
        </React.Fragment>
    )
}

export default CategoryManagement