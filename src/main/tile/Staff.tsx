import { useEffect, useState, useContext } from "react";
import { Button, ButtonGroup, Card, Col, OverlayTrigger, ProgressBar, Row, Spinner, Tooltip } from "react-bootstrap";
import { currencyFormatter, formatDate, getLastMonth } from "./Utility";
import * as Icon from 'react-bootstrap-icons';
import { TokenContext } from "../../App";

export default function Staff() {
    const { callAPI } = useContext(TokenContext)
    const [reportData, setReportData] = useState({ data: [{ "service price": 0, stylist: "" }] });
    const [total, setTotal] = useState(-1);
    const [activeButtonIndex, setActiveButtonIndex] = useState(0);
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date(endDate.getFullYear(), endDate.getMonth(), 1));

    const staffTargets = {
        "Anand": 88000,
        "Pooja": 60000,
        "Deepa": 46000,
        "Jassi": 112000,
        "Manager": 52000,
        "Prasad": 72000,
        "Rutuja": 40000,
        "Janvi (B)": 50000,
        "Talib": 120000,
    }

    const defaultTarget = 100000;

    useEffect(() => {
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${formatDate(startDate)}&report_type=staff_service_summary&end_date=${formatDate(endDate)}&app_type=web`
        callAPI(apiURL, (data: any) => {
            data.data = data.data.sort((a: any, b: any) => {
                return b["service price"] - a["service price"];
            });
            setReportData(data);
            calculateToday(data);
        });
        const calculateToday = (data: { data: string | any[]; }) => {
            const len = data.data.length;
            let sum = 0;
            for (let i = 0; i < len; i++) {
                sum += data.data[i]["service price"];
            }
            setTotal(sum);
        }
    }, [startDate, endDate, callAPI]);

    const refresh = () => {
        setTotal(-1);
        setEndDate(new Date());
        setStartDate(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
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
                        <div className="position-relative mt-3">
                            <ButtonGroup size="sm">
                                <Button variant={activeButtonIndex === 0 ? "dark" : "light"} onClick={() => setDuration('current')}>{(new Date()).toLocaleDateString('en-GB', { month: 'long' })}</Button>
                                <Button variant={activeButtonIndex === 1 ? "dark" : "light"} onClick={() => setDuration('previous')}>{getLastMonth().toLocaleDateString('en-GB', { month: 'long' })}</Button>
                            </ButtonGroup>
                        </div>
                        {
                            reportData.data.map((val, index) => {
                                const target = (staffTargets[val.stylist.trim() as keyof typeof staffTargets] || defaultTarget)
                                const targetPercentage = Math.round(val["service price"] * 100 / target);
                                const targetNoDiscountPercentage = Math.round(val["service amount"] * 100 / target);
                                return (
                                    <Row key={'staff' + index} className="mt-3 pt-2 rounded black-bg">
                                        <Col lg={4} xs={5}><h3>{val.stylist}</h3></Col>
                                        <Col xs={7} className="text-end align-bottom text-white-50">Target {currencyFormatter.format(target)}</Col>
                                        <Col lg={4} xs={5} className="text-white-50">Without discount</Col>
                                        <Col xs={7} className="text-end align-bottom">{currencyFormatter.format(val["service price"])}</Col>
                                        <Col lg={4} className="mt-1">
                                            <OverlayTrigger overlay={
                                                <Tooltip id="tooltip-disabled">{targetPercentage}% Achieved</Tooltip>}>
                                                <ProgressBar now={Math.round(val["service price"] * 100 / (staffTargets[val.stylist.trim() as keyof typeof staffTargets] || 100000))} style={{ height: 6, marginBottom: 12 }} variant="danger" />
                                            </OverlayTrigger>
                                        </Col>
                                        <Col lg={4} xs={5} className="text-white-50">With discount</Col>
                                        <Col xs={7} className="text-end align-bottom">{currencyFormatter.format(val["service amount"])}</Col>
                                        <Col lg={4} className="mt-1">
                                            <OverlayTrigger overlay={
                                                <Tooltip id="tooltip-disabled">{targetNoDiscountPercentage}% Achieved</Tooltip>}>
                                                <ProgressBar now={Math.round(val["service amount"] * 100 / (staffTargets[val.stylist.trim() as keyof typeof staffTargets] || 100000))} style={{ height: 6, marginBottom: 12 }} variant="danger" />
                                            </OverlayTrigger>
                                        </Col>
                                    </Row>)
                            })
                        }
                    </Card.Body>
            }

        </Card>
    )
}
