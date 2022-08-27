import { useEffect, useState } from "react";
import { Button, Card, Col, OverlayTrigger, ProgressBar, Row, Spinner, Tooltip } from "react-bootstrap";
import callAPI from "./Utility";
import * as Icon from 'react-bootstrap-icons';

export default function Staff({ token, setToken }: { token: string, setToken: any }) {
    const [reportData, setReportData] = useState({ data: [{ services: 0, stylist: "" }] });
    const [total, setTotal] = useState(-1);
    const currFormatter = Intl.NumberFormat('en-in', {style:"currency", currency:"INR", maximumFractionDigits: 0});

    const staffTargets = {
        "Bhushan": 72000,
        "Chanda": 80000,
        "Deepa": 42000,
        "Jassi": 100000,
        "Manager": 52000,
        "Rihan": 88000,
        "Rutja": 40000
    }

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = () => {
        const date = new Date();
        const lastMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const startDate = formatDate(lastMonthDate);
        const endDate = formatDate(date);
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${startDate}&end_date=${endDate}&report_type=staff_by_all&app_type=web`;
        callAPI(apiURL, token, setToken, (data: any) => {
            setReportData(data);
            calculateToday(data);
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
            sum += data.data[i].services;
        }
        setTotal(sum);
    }

    return (
        <Card className="shadow" style={{backgroundColor:"indigo"}} text="light">
            {
                total === -1 ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                    <Card.Body>
                        <div className="position-relative">
                            <h3>Staff Sales Target</h3>
                            <div className="position-absolute top-0 end-0" style={{ marginTop: -10 }}>
                                <Button variant="indigo" className="text-light" size="lg" onClick={() => refresh()}><Icon.ArrowClockwise /></Button>
                            </div>
                            </div>
                            {
                                reportData.data.map(val => {
                                    const target = (staffTargets[val.stylist.trim() as keyof typeof staffTargets] || 100000)
                                    const targetPercentage = Math.round(val.services * 100 / target);
                                    return(
                                    <Row>
                                        <Col lg={4} xs={5}>{val.stylist}</Col>
                                        <Col xs={7} className="d-lg-none text-end align-bottom">{currFormatter.format(val.services)} of {currFormatter.format(target)}</Col>
                                        <Col lg={4} className="mt-2">
                                        <OverlayTrigger overlay={
                                        <Tooltip id="tooltip-disabled">{targetPercentage}% Achieved</Tooltip>}>
                                            <ProgressBar now={Math.round(val.services * 100 / (staffTargets[val.stylist.trim() as keyof typeof staffTargets] || 100000))} style={{height: 6, marginBottom: 12}} variant="danger"/>
                                            </OverlayTrigger>
                                        </Col>
                                        <Col lg={4} className="d-none d-lg-block">{currFormatter.format(val.services)}</Col>
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