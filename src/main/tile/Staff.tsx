import { useEffect, useState } from "react";
import { Button, Card, Col, OverlayTrigger, ProgressBar, Row, Spinner, Tooltip } from "react-bootstrap";
import callAPI, { formatDate } from "./Utility";
import * as Icon from 'react-bootstrap-icons';

export default function Staff({ token, setToken }: { token: string, setToken: any }) {
    const [reportData, setReportData] = useState({ data: [{ "service price": 0, stylist: "" }] });
    const [total, setTotal] = useState(-1);
    const currFormatter = Intl.NumberFormat('en-in', {style:"currency", currency:"INR", maximumFractionDigits: 0});

    const staffTargets = {
        "Anand": 88000,
        "Pooja": 60000,
        "Deepa": 46000,
        "Jassi": 112000,
        "Manager": 52000,
        "Prasad": 72000,
        "Rutuja": 40000,
        "Janvi (B)": 40000,
        "Talib": 120000,
    }

    const defaultTarget = 100000;

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = () => {
        const date = new Date();
        const lastMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const startDate = formatDate(lastMonthDate);
        const endDate = formatDate(date);
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${startDate}&report_type=staff_service_summary&end_date=${endDate}&app_type=web`
        callAPI(apiURL, token, setToken, (data: any) => {
            data.data = data.data.sort((a:any, b:any) => {
                return b["service price"] - a["service price"];
            });
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
            sum += data.data[i]["service price"];
        }
        setTotal(sum);
    }

    return (
        <Card className="shadow indigoBg" text="light">
            {
                total === -1 ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                    <Card.Body>
                        <div className="position-relative">
                            <h2>Staff Sales Target</h2>
                            <div className="position-absolute top-0 end-0" style={{ marginTop: -10 }}>
                                <Button variant="indigo" className="text-light" size="lg" onClick={() => refresh()}><Icon.ArrowClockwise /></Button>
                            </div>
                            </div>
                            {
                                reportData.data.map((val, index) => {
                                    const target = (staffTargets[val.stylist.trim() as keyof typeof staffTargets] || defaultTarget)
                                    const targetPercentage = Math.round(val["service price"] * 100 / target);
                                    return(
                                    <Row key={'staff'+index}>
                                        <Col lg={4} xs={5}>{val.stylist}</Col>
                                        <Col xs={7} className="d-lg-none text-end align-bottom">{currFormatter.format(val["service price"])} of {currFormatter.format(target)}</Col>
                                        <Col lg={4} className="mt-2">
                                        <OverlayTrigger overlay={
                                        <Tooltip id="tooltip-disabled">{targetPercentage}% Achieved</Tooltip>}>
                                            <ProgressBar now={Math.round(val["service price"] * 100 / (staffTargets[val.stylist.trim() as keyof typeof staffTargets] || 100000))} style={{height: 6, marginBottom: 12}} variant="danger"/>
                                            </OverlayTrigger>
                                        </Col>
                                        <Col lg={4} className="d-none d-lg-block">{currFormatter.format(val["service price"])}</Col>
                                    </Row>)
                                })
                            }
                    </Card.Body>
            }

        </Card>
    )
}
