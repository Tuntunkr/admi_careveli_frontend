import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

function SkeletonBar({ width = '100%', height = 12, className = '' }) {
    return (
        <div
            className={`analytics-skeleton__bar ${className}`}
            style={{ width, height }}
            aria-hidden="true"
        />
    );
}

function StatCardSkeleton() {
    return (
        <Card className="border-0 shadow-sm">
            <Card.Body>
                <div className="d-flex align-items-center gap-3">
                    <div className="analytics-skeleton__icon" />
                    <div className="flex-grow-1">
                        <SkeletonBar width="55%" height={10} className="mb-2" />
                        <SkeletonBar width="40%" height={22} />
                        <SkeletonBar width="70%" height={8} className="mt-2" />
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}

function QuickActionSkeleton() {
    return (
        <Card className="border-0 shadow-sm">
            <Card.Body className="py-3">
                <div className="d-flex align-items-center gap-3">
                    <div className="analytics-skeleton__icon" style={{ width: 40, height: 40 }} />
                    <SkeletonBar width="60%" height={14} />
                </div>
            </Card.Body>
        </Card>
    );
}

function ChartCardSkeleton({ tall = false }) {
    return (
        <Card className="border-0 shadow-sm h-100">
            <Card.Body>
                <SkeletonBar width="45%" height={14} className="mb-2" />
                <SkeletonBar width="30%" height={10} className="mb-4" />
                <div
                    className="analytics-skeleton__chart"
                    style={{ height: tall ? 280 : 220 }}
                />
            </Card.Body>
        </Card>
    );
}

function TableCardSkeleton({ rows = 5 }) {
    return (
        <Card className="border-0 shadow-sm h-100">
            <Card.Body>
                <div className="d-flex justify-content-between mb-3">
                    <SkeletonBar width="50%" height={14} />
                    <SkeletonBar width="60px" height={10} />
                </div>
                <div className="analytics-skeleton__table">
                    <div className="analytics-skeleton__table-head">
                        <SkeletonBar width="25%" />
                        <SkeletonBar width="25%" />
                        <SkeletonBar width="20%" />
                        <SkeletonBar width="15%" />
                    </div>
                    {Array.from({ length: rows }).map((_, index) => (
                        <div key={index} className="analytics-skeleton__table-row analytics-skeleton__table-row--4">
                            <SkeletonBar width="70%" />
                            <SkeletonBar width="50%" />
                            <SkeletonBar width="30%" />
                            <SkeletonBar width="20%" />
                        </div>
                    ))}
                </div>
            </Card.Body>
        </Card>
    );
}

function AnalyticsDashboardSkeleton() {
    return (
        <div className="analytics-dashboard-skeleton" aria-busy="true" aria-label="Loading analytics">
            <Row className="g-3 mb-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <Col xs={12} sm={6} xl={3} key={`stat-${index}`}>
                        <StatCardSkeleton />
                    </Col>
                ))}
            </Row>

            <Row className="g-3 mb-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Col xs={6} md={3} key={`qa-${index}`}>
                        <QuickActionSkeleton />
                    </Col>
                ))}
            </Row>

            <Row className="g-3 mb-4">
                <Col xs={12} lg={8}>
                    <ChartCardSkeleton tall />
                </Col>
                <Col xs={12} lg={4}>
                    <ChartCardSkeleton />
                </Col>
            </Row>

            <Row className="g-3 mb-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Col xs={12} lg={4} key={`pipe-${index}`}>
                        <ChartCardSkeleton />
                    </Col>
                ))}
            </Row>

            <Row className="g-3 mb-4">
                <Col xs={12} lg={5}>
                    <TableCardSkeleton rows={5} />
                </Col>
                <Col xs={12} lg={4}>
                    <TableCardSkeleton rows={5} />
                </Col>
                <Col xs={12} lg={3}>
                    <TableCardSkeleton rows={5} />
                </Col>
            </Row>
        </div>
    );
}

export default AnalyticsDashboardSkeleton;
