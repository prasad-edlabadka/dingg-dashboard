import { useEffect, useState } from "react";
import { Button, ButtonGroup, Card, Col, OverlayTrigger, ProgressBar, Row, Spinner, Tooltip } from "react-bootstrap";
import callAPI, { formatDate } from "./Utility";
import * as Icon from 'react-bootstrap-icons';

export default function PaymentMethods({ token, setToken }: { token: string, setToken: any }) {
    const [reportData, setReportData] = useState({ data: [{ total: 0, "payment mode": "" }] });
    const [total, setTotal] = useState(-1);
    const [dayReportData, setDayReportData] = useState({ data: [{ total: 0, "payment mode": "" }] });
    const [dayTotal, setDayTotal] = useState(-1);
    const [activeButtonIndex, setActiveButtonIndex] = useState(0);
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date(endDate.getFullYear(), endDate.getMonth(), 1));

    const currFormatter = Intl.NumberFormat('en-in', { style: "currency", currency: "INR", maximumFractionDigits: 0 });

    useEffect(() => {
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${formatDate(startDate)}&report_type=by_payment_mode&end_date=${formatDate(endDate)}&app_type=web`
        callAPI(apiURL, token, setToken, (data: any) => {
            data.data = data.data.sort((a: any, b: any) => {
                return b.total - a.total;
            });
            setReportData(data);
            setTotal(calculateToday(data));
            const dayApiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${formatDate(new Date())}&report_type=by_payment_mode&end_date=${formatDate(new Date())}&app_type=web`
            callAPI(dayApiURL, token, setToken, (dayData: any) => {
                dayData.data = dayData.data.sort((a: any, b: any) => {
                    return b.total - a.total;
                });
                setDayReportData(dayData);
                setDayTotal(calculateToday(dayData));
            });
        });
        const calculateToday = (data: { data: string | any[]; }) => {
            const len = data.data.length;
            let sum = 0;
            for (let i = 0; i < len; i++) {
                sum += data.data[i].total;
            }
            return sum;
        }
    }, [startDate, endDate, token, setToken]);

    const refresh = () => {
        setStartDate(new Date());
        setEndDate(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
    }

    const methods = {
        "marideal": "Payal's QR",
        "defideal": "Mrunalini's QR",
        "deal.mu": "Renuka's QR"
    }
    const getPaymentMethodName = (n: string) => {
        return methods[n.toLowerCase()] || titleCase(n);
    };

    function titleCase(st: string) {
        return st.toLowerCase().split(" ").reduce((s, c) =>
            s + "" + (c.charAt(0).toUpperCase() + c.slice(1) + " "), '');
    }

    const setDuration = (type: string) => {
        if (type === 'current') {
            const date = new Date();
            const lastMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
            setStartDate(lastMonthDate);
            setEndDate(date);
            setActiveButtonIndex(0);
        } else {
            const date = new Date();
            const lastMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
            setStartDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
            setEndDate(new Date(lastMonthDate.getTime() - 1));
            setActiveButtonIndex(1);
        }
        // setTimeout(()=> refresh(), 1);
    }

    const getLastMonth = () => {
        const date = new Date();
        const lastMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
        return new Date(lastMonthDate.getTime() - 1);
    }

    return (
        <Card className="shadow purpleBg" text="light">
            {
                total === -1 ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                    <Card.Body>
                        <div className="position-relative">
                            <ButtonGroup size="sm">
                                <Button variant={activeButtonIndex === 0 ? "dark" : "light"} onClick={() => setDuration('current')}>{(new Date()).toLocaleDateString('en-GB', { month: 'long' })}</Button>
                                <Button variant={activeButtonIndex === 1 ? "dark" : "light"} onClick={() => setDuration('previous')}>{getLastMonth().toLocaleDateString('en-GB', { month: 'long' })}</Button>
                            </ButtonGroup>
                        </div>
                        <div className="position-relative">
                            <h3>Payments for {startDate.toLocaleDateString('en-GB', { month: 'long' })}</h3>
                            <div className="position-absolute top-0 end-0" style={{ marginTop: -10 }}>
                                <Button variant="indigo" className="text-light" size="lg" onClick={() => refresh()}><Icon.ArrowClockwise /></Button>
                            </div>
                        </div>
                        {
                            reportData.data.map((val, index) => {
                                const targetPercentage = Math.round(val.total * 100 / total)
                                return (
                                    <Row key={'paymentmethod' + index}>
                                        <Col lg={4} xs={5}>{getPaymentMethodName(val["payment mode"])}</Col>
                                        <Col xs={7} className="d-lg-none text-end align-bottom">{currFormatter.format(val.total)} ({targetPercentage}%)</Col>
                                        <Col lg={4} className="mt-2">
                                            <OverlayTrigger overlay={
                                                <Tooltip id="tooltip-disabled">{targetPercentage}% Achieved</Tooltip>}>
                                                <ProgressBar now={targetPercentage} style={{ height: 6, marginBottom: 12 }} variant="danger" />
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
                            dayReportData.data.map((val, index) => {
                                const targetPercentage = Math.round(val.total * 100 / dayTotal)
                                return (
                                    <Row key={'paymentmethodtoday' + index}>
                                        <Col lg={4} xs={5}>{getPaymentMethodName(val["payment mode"])}</Col>
                                        <Col xs={7} className="d-lg-none text-end align-bottom">{currFormatter.format(val.total)} ({targetPercentage}%)</Col>
                                        <Col lg={4} className="mt-2">
                                            <OverlayTrigger overlay={
                                                <Tooltip id="tooltip-disabled">{targetPercentage}% Achieved</Tooltip>}>
                                                <ProgressBar now={targetPercentage} style={{ height: 6, marginBottom: 12 }} variant="danger" />
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
