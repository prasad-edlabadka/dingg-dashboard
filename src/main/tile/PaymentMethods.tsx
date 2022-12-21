import { useEffect, useState } from "react";
import { Button, Card, Col, OverlayTrigger, ProgressBar, Row, Spinner, Tooltip } from "react-bootstrap";
import callAPI from "./Utility";
import * as Icon from 'react-bootstrap-icons';

export default function PaymentMethods({ token, setToken }: { token: string, setToken: any }) {
    const [reportData, setReportData] = useState({ data: [{ total: 0, "payment mode": "" }] });
    const [total, setTotal] = useState(-1);
    const [dayReportData, setDayReportData] = useState({ data: [{ total: 0, "payment mode": "" }] });
    const [dayTotal, setDayTotal] = useState(-1);
    const currFormatter = Intl.NumberFormat('en-in', { style: "currency", currency: "INR", maximumFractionDigits: 0 });

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = () => {
        const date = new Date();
        const lastMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const startDate = formatDate(lastMonthDate);
        const endDate = formatDate(date);
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${startDate}&report_type=by_payment_mode&end_date=${endDate}&app_type=web`
        callAPI(apiURL, token, setToken, (data: any) => {
            data.data = data.data.sort((a: any, b: any) => {
                return b.total - a.total;
            });
            setReportData(data);
            setTotal(calculateToday(data));
            const dayApiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${endDate}&report_type=by_payment_mode&end_date=${endDate}&app_type=web`
            callAPI(dayApiURL, token, setToken, (dayData: any) => {
                dayData.data = dayData.data.sort((a: any, b: any) => {
                    return b.total - a.total;
                });
                setDayReportData(dayData);
                setDayTotal(calculateToday(dayData));
            });
        });
    }

    const refresh = () => {
        setTotal(-1);
        loadData();
    }

    const calculateToday = (data = reportData) => {
        const len = data.data.length;
        let sum = 0;
        for (let i = 0; i < len; i++) {
            sum += data.data[i].total;
        }
        return sum;
    }

    return (
        <Card className="shadow purpleBg" text="light">
            {
                total === -1 ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                    <Card.Body>
                        <div className="position-relative">
                            <h3>Payments for {(new Date()).toLocaleDateString('en-GB', { month: 'long' })}</h3>
                            <div className="position-absolute top-0 end-0" style={{ marginTop: -10 }}>
                                <Button variant="indigo" className="text-light" size="lg" onClick={() => refresh()}><Icon.ArrowClockwise /></Button>
                            </div>
                        </div>
                        {
                            reportData.data.map(val => {
                                const targetPercentage = Math.round(val.total * 100 / total)
                                return (
                                    <Row>
                                        <Col lg={4} xs={5}>{val["payment mode"]}</Col>
                                        <Col xs={7} className="d-lg-none text-end align-bottom">{currFormatter.format(val.total)} ({targetPercentage}%)</Col>
                                        <Col lg={4} className="mt-2">
                                            <OverlayTrigger overlay={
                                                <Tooltip id="tooltip-disabled">{targetPercentage}% Achieved</Tooltip>}>
                                                <ProgressBar now={targetPercentage} style={{ height: 6, marginBottom: 12 }} variant="danger"  />
                                            </OverlayTrigger>
                                        </Col>
                                        <Col lg={4} className="d-none d-lg-block">{currFormatter.format(val.total)}</Col>
                                    </Row>)
                            })
                        }
                        <div className="position-relative mt-4">
                            <h3>Payments for Today</h3>
                        </div>
                        {
                            dayReportData.data.map(val => {
                                const targetPercentage = Math.round(val.total * 100 / dayTotal)
                                return (
                                    <Row>
                                        <Col lg={4} xs={5}>{val["payment mode"]}</Col>
                                        <Col xs={7} className="d-lg-none text-end align-bottom">{currFormatter.format(val.total)} ({targetPercentage}%)</Col>
                                        <Col lg={4} className="mt-2">
                                            <OverlayTrigger overlay={
                                                <Tooltip id="tooltip-disabled">{targetPercentage}% Achieved</Tooltip>}>
                                                <ProgressBar now={targetPercentage} style={{ height: 6, marginBottom: 12 }} variant="danger"  />
                                            </OverlayTrigger>
                                        </Col>
                                        <Col lg={4} className="d-none d-lg-block">{currFormatter.format(val.total)}</Col>
                                    </Row>)
                            })
                        }
                    </Card.Body>
            }

        </Card>
    )
}

function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

function formatDate(dt: Date): string {
    return [dt.getFullYear(), padTo2Digits(dt.getMonth() + 1), padTo2Digits(dt.getDate())].join('-');
}