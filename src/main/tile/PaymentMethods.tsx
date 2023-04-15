import { useContext, useEffect, useState } from "react";
import {Col, OverlayTrigger, ProgressBar, Row, Tooltip } from "react-bootstrap";
import { currencyFormatter, formatDate, getLastMonth } from "./Utility";
import { TokenContext } from "../../App";
import DiwaButtonGroup from "../../components/button/DiwaButtonGroup";
import DiwaCard from "../../components/card/DiwaCard";
import DiwaRefreshButton from "../../components/button/DiwaRefreshButton";

export default function PaymentMethods() {
    const { callAPI } = useContext(TokenContext);
    const [reportData, setReportData] = useState({ data: [{ total: 0, "payment mode": "" }] });
    const [total, setTotal] = useState(-1);
    const [dayReportData, setDayReportData] = useState({ data: [{ total: 0, "payment mode": "" }] });
    const [dayTotal, setDayTotal] = useState(-1);
    const buttonState = useState(0);
    const [, setActiveButtonIndex] = buttonState;
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${formatDate(startDate)}&report_type=by_payment_mode&end_date=${formatDate(endDate)}&app_type=web`
        callAPI(apiURL, (data: any) => {
            data.data = data.data.sort((a: any, b: any) => {
                return b.total - a.total;
            });
            setReportData(data);
            setTotal(calculateToday(data));
            const dayApiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${formatDate(new Date())}&report_type=by_payment_mode&end_date=${formatDate(new Date())}&app_type=web`
            callAPI(dayApiURL, (dayData: any) => {
                dayData.data = dayData.data.sort((a: any, b: any) => {
                    return b.total - a.total;
                });
                setDayReportData(dayData);
                setDayTotal(calculateToday(dayData));
                setLoading(false);
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
    }, [startDate, endDate, callAPI]);

    const refresh = () => {
        const dt = new Date();
        setEndDate(dt);
        setStartDate(new Date(dt.getFullYear(), dt.getMonth(), 1));
        setActiveButtonIndex(0);
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
        } else {
            const date = new Date();
            const lastMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
            setStartDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
            setEndDate(new Date(lastMonthDate.getTime() - 1));
        }
        // setTimeout(()=> refresh(), 1);
    }

    const buttons = [
        { title: (new Date()).toLocaleDateString('en-GB', { month: 'long' }), onClick: () => setDuration('current') },
        { title: getLastMonth().toLocaleDateString('en-GB', { month: 'long' }), onClick: () => setDuration('previous') }
    ]

    return (

        <DiwaCard varient="purple" loadingTracker={loading}>
            <DiwaButtonGroup buttons={buttons} state={buttonState} />
            <div className="position-relative">
                <h3>Payments for {startDate.toLocaleDateString('en-GB', { month: 'long' })}</h3>
                <DiwaRefreshButton refresh={() => refresh()} />
            </div>
            {
                reportData.data.map((val, index) => {
                    const targetPercentage = Math.round(val.total * 100 / total)
                    return (
                        <Row key={'paymentmethod' + index}>
                            <Col lg={4} xs={5}>{getPaymentMethodName(val["payment mode"])}</Col>
                            <Col xs={7} className="d-lg-none text-end align-bottom">{currencyFormatter.format(val.total)} ({targetPercentage}%)</Col>
                            <Col lg={4} className="mt-2">
                                <OverlayTrigger overlay={
                                    <Tooltip id="tooltip-disabled">{targetPercentage}% Achieved</Tooltip>}>
                                    <ProgressBar now={targetPercentage} style={{ height: 6, marginBottom: 12 }} variant="danger" />
                                </OverlayTrigger>
                            </Col>
                            <Col lg={4} className="d-none d-lg-block">{currencyFormatter.format(val.total)}</Col>
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
                            <Col xs={7} className="d-lg-none text-end align-bottom">{currencyFormatter.format(val.total)} ({targetPercentage}%)</Col>
                            <Col lg={4} className="mt-2">
                                <OverlayTrigger overlay={
                                    <Tooltip id="tooltip-disabled">{targetPercentage}% Achieved</Tooltip>}>
                                    <ProgressBar now={targetPercentage} style={{ height: 6, marginBottom: 12 }} variant="danger" />
                                </OverlayTrigger>
                            </Col>
                            <Col lg={4} className="d-none d-lg-block">{currencyFormatter.format(val.total)}</Col>
                        </Row>)
                })
            }
        </DiwaCard>
    )
}
