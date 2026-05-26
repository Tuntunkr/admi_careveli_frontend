import React, { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import { Card, CardBody, CardTitle, Row, Col, Table } from 'reactstrap'
import { get } from '../../helper/api_helper';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import Footer from '../../layouts/Footer';
import Loader from '../../layouts/Loader';
import moment from "moment";
import Modal from 'react-bootstrap/Modal';
import { Link } from 'react-router-dom';




function PetCategory() {

    const user = useSelector(state => state.user);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [cats, setCats] = useState([]);
    const [columns, setColumns] = useState([]);

    const [show, setShow] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    const handleClose = () => { setShow(false); setImageUrl('') }
    function handleShow(url) {
        setImageUrl(url)
        setShow(true)
    };


    useEffect(() => {
        if (user?.token) {
            getData();
        }
    }, [user]);

    useEffect(() => {
        setColumns([
            {
                name: "Image",
                cell: (row) => <>
                    <Link> <img src={row?.image} onClick={() => handleShow(row?.image)} style={{ width: 70, height: 70, padding: 10 }} /></Link>
                </>,
            },
            {
                name: 'User',
                selector: row => row.user?.userName,
                // maxWidth:'200px'
            },
            {
                name: 'Mobile',
                selector: row => row.user?.mobile,
                // maxWidth:'200px'
            },
            {
                name: 'Complaint Type',
                selector: row => row.complaint_type,
                // maxWidth:'200px'
            },
            {
                name: 'Date',
                selector: row => moment(row?.updatedAt).format("DD-MMM-YYYY hh:mm a"),
            },
        ])
    }, [data]);

    const getData = () => {
        if (!loading) {
            setLoading(true);
            get("feedback", { token: user?.token })
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


    const ExpandedComponent = ({ data }) =>
        <div className='expending_box'>
            <Row>
                <Col lg={6}>
                    <div className='expend_detail'>
                        <h4>Feedback</h4>
                    </div>
                </Col>
                <Col lg={6}>
                    <div className='expend_detail'>
                        <p>{data?.feedback}</p>
                    </div>
                </Col>
            </Row>

        </div>
    return (
        <React.Fragment>
            <Header />

            {
                loading == true && <Loader />
            }

            <div className="main main-app p-3 p-lg-4">
                <Card>
                    <Row className='mb-4'>
                        <Col md={10}>
                            <CardBody>
                                <CardTitle><b>Feedback</b></CardTitle>
                            </CardBody>
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
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Image</Modal.Title>
                </Modal.Header>
                <Modal.Body><img src={imageUrl} style={{ width: 460, height: 450, textAlign: 'center' }} /> </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}


export default PetCategory;