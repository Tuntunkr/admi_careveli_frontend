import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import { Card, CardBody, CardTitle, Row, Col, Modal, ModalBody, Label } from 'reactstrap'
import { Button } from 'react-bootstrap';
import { AvForm, AvField } from "availity-reactstrap-validation";
import { del, get, post, put } from '../../helper/api_helper';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import ConfirmModal from '../../components/ConfirmModal';
import Footer from '../../layouts/Footer';
import * as Utils from "../../Utils";
import Loader from '../../layouts/Loader';
import moment from 'moment';

function BannerManagement() {

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
    const [file, setFile] = useState(null);
    const [image, setImage] = useState(null);

    useEffect(() => {
        console.log("Token check:", token);
        console.log("User state:", user);
        if (token) {
            getData();
        } else {
            toast.error("No authentication token found. Please login again.");
        }
    }, [token]);

    useEffect(() => {
        setColumns([
            {
                name: 'Image',
                cell: (row) => <>
                    <img src={row?.image} alt="Banner" style={{ width: 100, height: 60, padding: 5, objectFit: 'cover' }} />
                </>,
                maxWidth: '200px',
                minWidth: '120px'
            },
            {
                name: 'Title',
                selector: row => row?.title || '-',
                sortable: true,
                wrap: true,
                maxWidth: '250px',
                minWidth: '150px'
            },
            {
                name: 'Date',
                selector: row => moment(row?.createdAt).format("DD-MMM-YYYY"),
                sortable: true,
                minWidth: '130px'
            },
            {
                cell: (row) => <>
                    <Button onClick={() => handleUpdateStatus(row)}
                        title={row?.isActive ? "Active" : "Inactive"}
                        className={`btn_status ${row?.isActive && 'active'}`}
                    >
                        <span className="text-white">
                            {row?.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </Button>
                </>,
                name: 'Status',
                ignoreRowClick: true,
                maxWidth: '110px'
            },
            {
                cell: (row) => <>
                    <Button onClick={() => handleUpdateBanner(row)}
                        title={"Edit"} variant="primary"
                        style={{ marginRight: 10, padding: 5, paddingLeft: 8, paddingRight: 8, border: 'none' }}>
                        <span className="ri-edit-fill" style={{ fontSize: 15 }}></span>
                    </Button>
                    <Button onClick={() => handleDeleteBanner(row)}
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
            setFile(null);
            setImage(null);
        }
    }, [isAdd]);

    const getData = () => {
        if (!loading) {
            setLoading(true);
            console.log("Fetching banners with token:", token ? "Token exists" : "No token");
            get("banner/admin/list", { token: token })
                .then(res => {
                    setLoading(false);
                    console.log("Banner API Response:", res);
                    if (res?.statusCode === 200) {
                        console.log("Banner data received:", res?.data);
                        setData(res?.data || []);
                        if (!res?.data || res?.data.length === 0) {
                            toast.info("No banners found");
                        }
                    } else {
                        console.error("Banner API Error:", res);
                        toast.error(res?.message || res?.error || "Failed to fetch banners");
                    }
                })
                .catch(err => {
                    setLoading(false);
                    console.error("Error fetching banners:", err);
                    toast.error("Something Went Wrong! Check console for details.");
                })
        }
    }

    const handleUpdateStatus = (row) => {
        setCurrentData({ ...row, actionType: "ToggleStatus" });
        setConfirm(true);
    }

    const updateBannerStatus = () => {
        if (!loading) {
            setLoading(true);
            fetch(`${Utils.API_URL}banner/toggle/${currentData?._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(res => {
                    setLoading(false);
                    if (res?.statusCode === 200) {
                        setConfirm(false);
                        toast.success("Status updated successfully");
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

    const handleUpdateBanner = (row) => {
        setCurrentData(row);
        setImage(row?.image);
        setIsAdd(true);
    }

    const handleDeleteBanner = (row) => {
        setCurrentData({ ...row, actionType: "Delete" });
        setConfirm(true);
    }

    const onConfirm = () => {
        if (currentData?.actionType === 'Delete') {
            deleteBannerAction();
        } else if (currentData?.actionType === 'ToggleStatus') {
            updateBannerStatus();
        }
    }

    const deleteBannerAction = () => {
        if (!loading) {
            setLoading(true);
            fetch(`${Utils.API_URL}banner/delete/${currentData?._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(res => {
                    setLoading(false);
                    if (res?.statusCode === 200) {
                        setConfirm(false);
                        toast.success("Banner deleted successfully");
                        getData();
                    } else {
                        toast.error(res?.message || res?.error || "Failed to delete banner");
                    }
                })
                .catch(err => {
                    setLoading(false);
                    console.error("Error deleting banner:", err);
                    toast.error("Something Went Wrong!");
                });
        }
    }

    const urltoFile = (url, filename, mimeType) => {
        return (fetch(url)
            .then(function (res) { return res.arrayBuffer(); })
            .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
        );
    }

    const handleValidSubmit = async (e, v) => {
        if (!loading) {
            setLoading(true);

            try {
                const formData = new FormData();

                // Add title (optional string field)
                if (v.title && v.title.trim()) {
                    formData.append('title', v.title.trim());
                }

                // Add isActive status
                formData.append('isActive', v.isActive === 'true' || v.isActive === true);

                // Handle image upload
                if (image && image.substring(0, 4) === 'data') {
                    const imgFile = await urltoFile(image, new Date().getTime() + '.png', 'image/png');
                    formData.append('image', imgFile);
                } else if (!currentData?._id && !image) {
                    setLoading(false);
                    toast.error("Please select an image!");
                    return;
                }

                const url = currentData?._id
                    ? `${Utils.API_URL}banner/update/${currentData._id}`
                    : `${Utils.API_URL}banner/add`;

                const method = currentData?._id ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const res = await response.json();
                setLoading(false);

                if (res?.statusCode === 200) {
                    setIsAdd(false);
                    setCurrentData(null);
                    setImage(null);
                    setFile(null);
                    toast.success(`Banner ${currentData?._id ? 'updated' : 'added'} successfully`);
                    getData();
                } else {
                    toast.error(res?.error || res?.message || "Operation failed");
                }
            } catch (err) {
                setLoading(false);
                console.error("Error submitting banner:", err);
                toast.error("Something Went Wrong!");
            }
        }
    }

    const handleImgChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(URL.createObjectURL(selectedFile));
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target.result);
            };
            reader.readAsDataURL(selectedFile);
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
            {loading && <Loader />}

            <div className="main main-app p-3 p-lg-4">
                <Card>
                    <Row className='mb-4'>
                        <Col md={11}>
                            <CardBody>
                                <CardTitle><b>Banner Management</b></CardTitle>
                            </CardBody>
                        </Col>
                        <Col md={1}>
                            <div className='action-btn'>
                                <button
                                    type="button"
                                    style={{ border: 'none', backgroundColor: Utils.themeColor }}
                                    className="btn btn-dark"
                                    onClick={() => { setCurrentData(null); setIsAdd(true) }}
                                >
                                    <i className={'ri-add-fill'} />
                                </button>
                            </div>
                        </Col>
                    </Row>
                    <DataTable
                        columns={columns}
                        data={data}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 20, 30, 50]}
                        conditionalRowStyles={[{
                            when: row => row?.style,
                            style: row => ({ width: row?.style?.width }),
                        }]}
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
                </Card>
            </div>
            <Footer />

            <Modal isOpen={isAdd} centered={true} size="lg">
                <ModalBody>
                    <div className="p-2">
                        <h4 className="text-black font-size-20 mb-4">{currentData ? 'Update Banner' : 'Add New Banner'}</h4>
                        <AvForm
                            className="form-horizontal"
                            onValidSubmit={handleValidSubmit}
                        >
                            <div className="mb-4">
                                <Label>Banner Image *</Label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleImgChange}
                                />
                                {image && (
                                    <div className="mt-3">
                                        <img src={image} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <AvField
                                    name="title"
                                    label="Banner Title (Optional)"
                                    placeholder="Enter banner title"
                                    type="text"
                                    value={currentData?.title || ''}
                                />
                            </div>

                            <div className="mb-4">
                                <AvField
                                    type="select"
                                    name="isActive"
                                    label="Status"
                                    value={currentData ? (currentData.isActive ? 'true' : 'false') : 'true'}
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </AvField>
                            </div>

                            <div className="mt-4">
                                <Row>
                                    <Col md={6}>
                                        <button
                                            className="btn btn-secondary w-100"
                                            onClick={() => { setIsAdd(false); setCurrentData(null); setImage(null); }}
                                            type="button"
                                        >
                                            Cancel
                                        </button>
                                    </Col>
                                    <Col md={6}>
                                        <button
                                            className="btn btn-danger w-100"
                                            type="submit"
                                        >
                                            {currentData ? 'Update' : 'Add'}
                                        </button>
                                    </Col>
                                </Row>
                            </div>
                        </AvForm>
                    </div>
                </ModalBody>
            </Modal>
        </React.Fragment>
    )
}

export default BannerManagement
