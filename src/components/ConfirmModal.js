import React from "react"
import * as Utils from '../Utils'
import { Col, Modal, ModalBody, Row } from "reactstrap"
import { Badge, Form } from 'react-bootstrap'
import { getStatusBadgeColor } from '../helper/order_helper'

const ConfirmModal = ({ show, onConfirm, onCloseClick, data }) => {
  return (
    <Modal isOpen={show} centered={true}>
      <ModalBody className="py-3 px-5">
        <Row>
          <Col lg={12}>
            <div className="text-center">
              <i
                className="ri-alert-fill"
                style={{ fontSize: "9em", color: Utils.themeColor }}
              />
              {/* } */}
              <h2>Are you sure?</h2>
              {(data?.actionType == 'Status' || data?.actionType == 'ToggleStatus') &&
                <h4>You want to change the status to {data?.isActive ? 'Inactive' : 'Active'}!</h4>
              }
              {data?.actionType == 'OrderStatusUpdate' &&
                <>
                  <h4>You want to update the order status!</h4>
                  <div className="mt-4">
                    <p>Current Status: <Badge bg={getStatusBadgeColor(data.currentStatus)}>{data.currentStatus}</Badge></p>
                    <Form.Group>
                      <Form.Label>Select New Status:</Form.Label>
                      <Form.Select
                        value={data.newStatus}
                        onChange={(e) => data.setNewStatus(e.target.value)}
                      >
                        {data.orderStatuses?.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                </>
              }
              {data?.actionType == 'CreateShipment' &&
                <>
                  <h4>Create shipment on Shipclues</h4>
                  <p className="text-muted mt-3 mb-0">
                    Order <strong>{data?.orderNumber}</strong> will be sent to Shipclues for shipment creation.
                  </p>
                </>
              }
              {data?.actionType == 'OrderBulkStatusUpdate' &&
                <>
                  <h4>Update status for {data.selectedCount} selected order(s)</h4>
                  <div className="mt-4">
                    <Form.Group>
                      <Form.Label>Select New Status:</Form.Label>
                      <Form.Select
                        value={data.newStatus}
                        onChange={(e) => data.setNewStatus(e.target.value)}
                      >
                        {data.orderStatuses?.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                </>
              }
              {data?.actionType == 'Delete' &&
                <h4>{data?.message || "You won't be able to revert this!"}</h4>
              }
              {data?.actionType == 'Eng' &&
                <h4>{`Are you sure, You want to assign ${data?.engName} for this complaint!`}</h4>
              }
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <div className="text-center mt-5 w-100">
              <button
                type="button"
                className="btn btn-success btn-lg me-2 w-100"
                onClick={onConfirm}
              >
                {(data?.actionType == 'Status' || data?.actionType == 'ToggleStatus') &&
                  <>{data?.isActive ? 'Inactive it!' : 'Active it!'
                  }</>
                }
                {data?.actionType == 'OrderStatusUpdate' &&
                  'Update Status'
                }
                {data?.actionType == 'OrderBulkStatusUpdate' &&
                  'Update Selected'
                }
                {data?.actionType == 'CreateShipment' &&
                  'Create Shipment'
                }
                {data?.actionType == 'Delete' &&
                  'Yes, delete it!'
                }
                {data?.actionType == 'Eng' &&
                  'Yes, assgin!'
                }
              </button>
            </div>
          </Col>
          <Col md={6}>
            <div className="text-center mt-5 w-100">
              <button
                type="button"
                className="btn btn-dark btn-lg me-2 w-100"
                onClick={onCloseClick}
              >
                Cancel
              </button>
            </div>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default ConfirmModal
