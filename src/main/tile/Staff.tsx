import { useEffect, useState, useContext } from "react";
import { Col, OverlayTrigger, ProgressBar, Row, Tooltip } from "react-bootstrap";
import { currencyFormatter, formatDate, getLastMonth } from "./Utility";
import { TokenContext } from "../../App";
import DiwaButtonGroup from "../../components/button/DiwaButtonGroup";
import DiwaCard from "../../components/card/DiwaCard";
import DiwaRefreshButton from "../../components/button/DiwaRefreshButton";

export default function Staff() {
    const { callAPI } = useContext(TokenContext)
    const [reportData, setReportData] = useState({ data: [{ "service price": 0, stylist: "" }] });
    const buttonState = useState(0);
    const [, setActiveButtonIndex] = buttonState;
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${formatDate(startDate)}&report_type=staff_service_summary&end_date=${formatDate(endDate)}&app_type=web`
        callAPI(apiURL, (data: any) => {
            data.data = data.data.sort((a: any, b: any) => {
                return b["service price"] - a["service price"];
            });
            setReportData(data);
            setLoading(false);
        });
    }, [startDate, endDate, callAPI]);

    const refresh = () => {
        setDuration('current');
        setActiveButtonIndex(0);
    }

    const date = new Date();
    const setDuration = (type: string) => {
        if (type === 'current') {
            setStartDate(new Date(date.getFullYear(), date.getMonth(), 1));
            setEndDate(date);
        } else {
            const lastMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
            setStartDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
            setEndDate(new Date(lastMonthDate.getTime() - 1));
        }
    }

    const buttons = [
        { title: (new Date()).toLocaleDateString('en-GB', { month: 'long' }), onClick: () => setDuration('current') },
        { title: getLastMonth().toLocaleDateString('en-GB', { month: 'long' }), onClick: () => setDuration('previous') }
    ];

    return (
        <DiwaCard varient="indigo" loadingTracker={loading}>
            <div className="position-relative">
                <h2>Staff Sales Target</h2>
                <DiwaRefreshButton refresh={() => refresh()} />
            </div>
            <DiwaButtonGroup buttons={buttons} state={buttonState} />
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
        </DiwaCard>
    )
}
