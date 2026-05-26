import React, { useEffect, useState, useRef } from 'react'
import Header from '../../layouts/Header'
import { Card, CardBody, CardSubtitle, CardTitle, Row, Col, Modal, ModalBody } from 'reactstrap'
import { Button } from 'react-bootstrap';
import { AvForm, AvField } from "availity-reactstrap-validation";
import { del, get, post, put, upload } from '../../helper/api_helper';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import ConfirmModal from '../../components/ConfirmModal';
import Footer from '../../layouts/Footer';
import moment from "moment";
import * as Utils from "../../Utils";
import Loader from '../../layouts/Loader';

function Recommended() {

    const user = useSelector(state => state.user);
    const [isAdd, setIsAdd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [currentData, setCurrentData] = useState(null);
    const [confirm, setConfirm] = useState(false);
    const [cats, setCats] = useState([]);
    const [subCats, setSubCats] = useState([]);
    const [selectedCat, setSelectedCat] = useState("");


    useEffect(() => {
        if (user?.token) {
            getCats();
            getData();
            getSubCats();
        }

    }, [user]);

    const getCats = () => {
        get("category", { token: user?.token })
            .then(res => {
                if (res?.statusCode == 200) {
                    setCats(res?.data);
                }
            })
            .catch(err => {
                toast.error("Something Went Wrong!");
            });
    }


    useEffect(() => {
        getSubCats();
    }, [selectedCat])

    const getSubCats = () => {
        post("subcategory/filter", { token: user?.token, catId: selectedCat })
            .then(res => {
                if (res.statusCode == 200) {
                    setSubCats(res?.data);
                }
            })
            .catch(err => {
                toast.error("Something Went Wrong!");
            })
    }

    useEffect(() => {
        setColumns([
            {
                name: 'Category',
                selector: row => row.cat,
            },
            {
                name: 'Sub Category',
                selector: row => row.subcat,
            },
            {
                name: 'Name',
                selector: row => row.name,
                // maxWidth: '100px'
            },
            {
                cell: (row) => <>
                    <Button onClick={() => handleUpdateStatus(row)}
                        modelNo={row?.isActive ? "No" : "Yes"}
                        className={`btn_status ${row?.isActive && 'active'}`}
                    >
                        <span className="text-white" style={{}}>
                            {!row?.isActive ? 'No' : 'Yes'}
                        </span>
                    </Button>
                </>,
                name: 'Recommended',
                ignoreRowClick: true,
                maxWidth: '150px'
            },
            {
                cell: (row) => <>
                    <Button onClick={() => handleUpdateProj(row)}
                        title={"Edit"} variant="danger"
                        style={{ marginRight: 10, padding: 5, paddingLeft: 8, paddingRight: 8, border: 'none' }}><span className="ri-edit-fill" style={{ fontSize: 15 }}></span></Button>
                    <Button onClick={() => handleDeleteProj(row)}
                        title={"Delete"} variant="danger"
                        style={{ marginRight: 10, padding: 5, paddingLeft: 8, paddingRight: 8, border: 'none' }}><span className="ri-delete-bin-6-line" style={{ fontSize: 15 }}></span></Button>
                </>,
                name: 'Action',
                ignoreRowClick: true,
                maxWidth: '100px'
            },
        ])
    }, [data]);

    const getData = () => {
        if (!loading) {
            setLoading(true);
            get("recommended", { token: user?.token })
                .then(res => {
                    setLoading(false);
                    if (res?.statusCode == 200) {
                        setData(res?.data);
                    }
                })
                .catch(err => {
                    setLoading(false);
                    toast.error("Something Went Wrong!");
                })
        }
    }

    const handleValidSubmit = async (e, v) => {
        if (!loading) {
            setLoading(true);
            let body = {
                ...v,
                token: user?.token
            }
            if (currentData?._id) {
                body = { ...body, recommendedId: currentData?._id }
                //body = { ...body, subcatId: currentData?._id }
                put("recommended", body)
                    .then(res => {
                        setLoading(false);
                        if (res?.statusCode == 200) {
                            toast.success(res?.message)
                            setIsAdd(false);
                            getData()
                        } else
                            toast.error("" + res?.error);
                    })
                    .catch(err => {
                        setLoading(false);
                        console.error("error while updating data", err);
                        toast.error("Something Went Wrong!");
                    })
            } else {
                post("recommended", body)
                    .then(res => {
                        setLoading(false);
                        if (res?.statusCode == 200) {
                            toast.success(res?.message);
                            setIsAdd(false);
                            getData();
                        } else {
                            toast.error(res?.error);
                        }
                    })
                    .catch(err => {
                        setLoading(false);
                        console.error("Error while adding city", err);
                        toast.error("Something Went Wrong!");
                    })
            }
        }
    }

    const handleUpdateStatus = (row) => {
        setCurrentData({ ...row, actionType: "Status" });
        setConfirm(true);
    }

    const handleUpdateProj = (row) => {
        setCurrentData(row);
        // setFile(row?.image);
        setIsAdd(true);
    }

    const handleDeleteProj = (row) => {
        setCurrentData({ ...row, actionType: "Delete" });
        setConfirm(true);
    }

    const onConfirm = () => {
        if (!loading) {
            console.log("active");
            setLoading(true);
            let body = {
                recommendedId: currentData?._id,
                token: user?.token
            }
            if (currentData?.actionType == 'Status') {
                body = { ...body, isActive: !currentData?.isActive }
                put("recommended", body)
                    .then(res => {
                        setLoading(false);
                        if (res?.statusCode == 200) {
                            toast.success(res?.message);
                            setConfirm(false);
                            getData()
                        } else
                            toast.error("" + res?.error);
                    })
                    .catch(err => {
                        setLoading(false);
                        console.error("error while updating data", err);
                        toast.error("Something Went Wrong!");
                    })
            }
            if (currentData?.actionType == 'Delete') {
                del("recommended", body)
                    .then(res => {
                        setLoading(false);
                        if (res?.statusCode == 200) {
                            setConfirm(false);
                            toast.success(res?.message);
                            getData()
                        } else
                            toast.error("" + res?.error);
                    })
                    .catch(err => {
                        setLoading(false);
                        console.error("error while updating data", err);
                        toast.error("Something Went Wrong!");
                    })
            }
        }
    }

    const ExpandedComponent = ({ data }) =>
        <div className='expending_box'>
            <Row>
                <Col lg={6}>
                    <div className='expend_detail'>
                        <h4>Address</h4>
                    </div>
                </Col>
                <Col lg={6}>
                    <div className='expend_detail'>
                        <p>{data?.add}</p>
                    </div>
                </Col>
            </Row>

        </div>

    return (
        <React.Fragment>
            <Header />
            <ConfirmModal
                show={confirm}
                onConfirm={onConfirm}
                onCloseClick={() => setConfirm(false)}
                data={currentData}
            />
            {
                loading == true && <Loader />
            }
            <div className="main main-app p-3 p-lg-4">
                <Card>
                    <Row className='mb-4'>
                        <Col md={11}>
                            <CardBody>
                                <CardTitle><b>Recommendeds</b></CardTitle>
                            </CardBody>
                        </Col>
                        <Col md={1}>
                            <div className='action-btn'>
                                <button type="button" style={{ border: 'none', backgroundColor: Utils.themeColor }} className="btn btn-dark" onClick={() => { setCurrentData(null); setIsAdd(true) }}><i className={'ri-add-fill'} /></button>
                            </div>
                        </Col>
                    </Row>
                    <DataTable
                        columns={columns}
                        data={data}
                        pagination
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
                </Card>
                <Footer />
            </div>
            <Modal isOpen={isAdd} centered>
                <ModalBody>
                    <Card>
                        <CardBody>
                            <Row>
                                <Col md={10}>
                                    <CardTitle className='mb-4'><b>{currentData?._id ? 'Update' : 'Add Recommended Form'}</b></CardTitle>
                                </Col>
                            </Row>
                            <AvForm onValidSubmit={handleValidSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <div className='mb-4'>
                                            <AvField
                                                name="catId"
                                                label="Category"
                                                value={selectedCat}
                                                onChange={(e) => setSelectedCat(e.target.value)}
                                                required
                                                type="select"
                                            >
                                                <option value={""}>Select Category</option>
                                                {cats?.map((item) => (
                                                    <option value={item?._id}>{item?.categoryName}</option>
                                                ))}
                                            </AvField>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className='mb-4'>
                                            <AvField
                                                name="subcatId"
                                                label="Sub Category"
                                                value={currentData?.subcatId}
                                                required
                                                type="select"
                                            >
                                                <option value={""}>Select Sub Category</option>
                                                {subCats?.map((item) => (
                                                    <option value={item?._id}>{item?.subcategoryName}</option>
                                                ))}
                                            </AvField>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <div className='mb-4'>
                                            <AvField
                                                name="name"
                                                label="Name"
                                                placeholder="Name"
                                                // label="Title"
                                                value={currentData?.name}
                                                required
                                            />
                                        </div>
                                    </Col>
                                    <div className='mb-4'>
                                        <AvField
                                            name="add"
                                            label="Address"
                                            placeholder="Enter address"
                                            value={currentData?.add}
                                            required
                                            type="textarea"
                                            rows={1}
                                        />
                                    </div>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <button
                                            className="btn btn-dark w-100 waves-effect waves-light"
                                            style={{ border: 'none', backgroundColor: Utils.themeColor }} onClick={() => setIsAdd(false)} type="reset">  Cancel
                                        </button>
                                    </Col>
                                    <Col md={6}>
                                        <button
                                            className="btn btn-dark w-100 waves-effect waves-light"
                                            style={{ border: 'none', backgroundColor: Utils.themeColor }} type="submit" > {currentData?._id ? 'Update' : 'Add'}
                                        </button>
                                    </Col>
                                </Row>
                            </AvForm>
                        </CardBody>
                    </Card>
                </ModalBody>
            </Modal>
        </React.Fragment>
    )
}

export default Recommended;