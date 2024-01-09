import { useContext, useEffect, useState } from "react";
import { Col, OverlayTrigger, ProgressBar, Row, Tooltip, Offcanvas } from "react-bootstrap";
import { currencyFormatter, formatDate, getLastMonth } from "./Utility";
import { subDays } from 'date-fns';
import { TokenContext } from "../../App";
import DiwaButtonGroup from "../../components/button/DiwaButtonGroup";
import DiwaCard from "../../components/card/DiwaCard";
import DiwaRefreshButton from "../../components/button/DiwaRefreshButton";

export default function PaymentMethods() {
    const { callAPI } = useContext(TokenContext);
    const [reportData, setReportData] = useState({ data: [{ total: 0, "payment mode": "" }] });
    const [total, setTotal] = useState(-1);
    const [dayReportData, setDayReportData] = useState({ data: [{ total: 0, "payment mode": "", count: 0 }] });
    const [dayTotal, setDayTotal] = useState(-1);
    const buttonState = useState(0);
    const todayButtonState = useState(0);
    const [, setActiveButtonIndex] = buttonState;
    const [, setTodaysButtonIndex] = todayButtonState;
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
    const [loading, setLoading] = useState(true);
    const [show, setShow] = useState(false);
    const [paymentTypes, setPaymentTypes] = useState([{ name: "", value: 0 }]);
    const [todaysBills, setTodaysBills] = useState([{ user: { fname: "", lname: "" }, bill_payments: [{ payment_mode: 0, amount: 0 }] }]);
    const [singleDate, setSingleDate] = useState(new Date());

    useEffect(() => {
        setLoading(true);
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${formatDate(startDate)}&report_type=by_payment_mode&end_date=${formatDate(endDate)}&app_type=web`
        callAPI(apiURL, (data: any) => {
            data.data = data.data.sort((a: any, b: any) => {
                return b.total - a.total;
            });
            setReportData(data);
            setTotal(calculateToday(data));
            const dayApiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${formatDate(singleDate)}&report_type=by_payment_mode&end_date=${formatDate(singleDate)}&app_type=web`
            callAPI(dayApiURL, (dayData: any) => {
                dayData.data = dayData.data.sort((a: any, b: any) => {
                    return b.total - a.total;
                });
                setDayReportData(dayData);
                setDayTotal(calculateToday(dayData));
                setLoading(false);
            });
        });

        const paymentTypeAPIURL = "https://api.dingg.app/api/v1/payment_mode";
        callAPI(paymentTypeAPIURL, (data: any) => {
            setPaymentTypes(data.data);
        });

        const todaysBillsURL = `https://api.dingg.app/api/v1/vendor/bills/?web=true&page=1&limit=1000&start=${formatDate(singleDate)}&end=${formatDate(singleDate)}&term=&is_product_only=`;
        callAPI(todaysBillsURL, (data: any) => {
            setTodaysBills(data.data);
        });

        const calculateToday = (data: { data: string | any[]; }) => {
            const len = data.data.length;
            let sum = 0;
            for (let i = 0; i < len; i++) {
                sum += data.data[i].total;
            }
            return sum;
        }
    }, [startDate, endDate, singleDate, callAPI]);

    const refresh = () => {
        const dt = new Date();
        setEndDate(dt);
        setStartDate(new Date(dt.getFullYear(), dt.getMonth(), 1));
        setSingleDate(dt);
        setActiveButtonIndex(0);
        setTodaysButtonIndex(0);
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

    const setSingleDateDuration = (type: string) => {
        type === "today" ? setSingleDate(new Date()) : setSingleDate(subDays(new Date(), 1));
    }

    const buttons = [
        { title: (new Date()).toLocaleDateString('en-GB', { month: 'long' }), onClick: () => setDuration('current') },
        { title: getLastMonth().toLocaleDateString('en-GB', { month: 'long' }), onClick: () => setDuration('previous') }
    ]

    const todayButtons = [
        { title: "Today", onClick: () => setSingleDateDuration('today') },
        { title: "Yesterday", onClick: () => setSingleDateDuration('yesterday') }
    ]

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
    const [bills, setBills] = useState([{ name: "", amount: 0 }]);

    const getPaymentModeId = (name: string) => {
        return paymentTypes.find((v: { name: string; }) => v.name.toLowerCase() === name.toLowerCase())?.value;
    }

    const openDetails = (mode: string) => {
        setSelectedPaymentMode(mode);
        const id = getPaymentModeId(mode);
        console.log(id);
        console.log(todaysBills);
        const bills = todaysBills.filter((v: { bill_payments: { payment_mode: number; }[]; }) => v.bill_payments.find((v2: { payment_mode: number; }) => v2.payment_mode === id));
        const displayBills = bills.map((v: { user: { fname: string, lname: string }, bill_payments: { payment_mode: number; amount: number; }[]; }) => {
            return {
                name: v.user.fname + " " + v.user.lname,
                amount: v.bill_payments.find((v2: { payment_mode: number; }) => v2.payment_mode === id)?.amount || 0
            }
        });
        setBills(displayBills);
        console.log(displayBills);
        handleShow();
    }

    return (

        <DiwaCard varient="purple" loadingTracker={loading}>
            <DiwaButtonGroup buttons={buttons} state={buttonState} />
            <div className="position-relative">
                <h3>Payments for {startDate.toLocaleDateString('en-GB', { month: 'long' })}</h3>
                <DiwaRefreshButton refresh={() => refresh()} />
            </div>
            <Offcanvas show={show} className="h-auto text-color" placement="bottom" backdrop={true} scroll={false} keyboard={false} id="offcanvasBottom" onHide={handleClose}>
                <Offcanvas.Header closeButton closeVariant="white"><h5>{getPaymentMethodName(selectedPaymentMode)} transactions</h5></Offcanvas.Header>
                <Offcanvas.Body className="pt-0">
                    <ul className="list-group list-group-flush">
                        {

                            bills.map((val, index) => {
                                return (
                                    <li className="list-group-item bg-transparent text-color border-color ps-0" key={val + 'item' + index}>
                                        <div className="w-100 pe-2 pb-2">
                                            <div className="text-start d-inline">{val.name}</div>
                                            <div className="text-end d-inline float-end">{currencyFormatter.format(val.amount)}</div>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
    
                </Offcanvas.Body>
            </Offcanvas>
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
            <div className="mt-2">&nbsp;</div>
            <DiwaButtonGroup buttons={todayButtons} state={todayButtonState} />
            <div className="position-relative mt-4">
                <h3>Payments for Today</h3>
            </div>
            {
                dayReportData.data.map((val, index) => {
                    const targetPercentage = Math.round(val.total * 100 / dayTotal)
                    return (
                        <Row key={'paymentmethodtoday' + index} onClick={() => openDetails(val["payment mode"])}>
                            <Col lg={4} xs={5}>{getPaymentMethodName(val["payment mode"])}</Col>
                            <Col xs={7} className="d-lg-none text-end align-bottom">{currencyFormatter.format(val.total)} <span className="small text-color-50">({val.count} payments)</span></Col>
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
