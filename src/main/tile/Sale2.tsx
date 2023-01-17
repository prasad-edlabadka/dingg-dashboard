import {useEffect, useState } from "react";
import { Button, ButtonGroup, Card, Col, Row, Spinner } from "react-bootstrap";
import * as Icon from 'react-bootstrap-icons';
import callAPI, { addDays, formatDate, formatDisplayDate, formatWeekDay, getFirstDayOfWeek } from "./Utility";

export default function Sale2({ token, setToken }: { token: string, setToken: any }) {
    const dataStructure = { price: -1, discount: -1, tax: -1, woTax: -1, total: -1, start: "", end: "" };
    const [loading, setLoading] = useState(true);
    const [displaySale, setDisplaySale] = useState(dataStructure);
    const [displayPreviousSale, setDisplayPreviousSale] = useState(dataStructure);
    const [displayVariation, setDisplayVariation] = useState(dataStructure);
    //const [displayDuration, setDisplayDuration] = useState('day');
    const [displaySubDuration, setDisplaySubDuration] = useState(new Date().toLocaleDateString());
    const [activeButtonIndex, setActiveButtonIndex] = useState(0);
    const [todayData, setTodayData] = useState(dataStructure);
    const [yesterdayData, setYesterdayData] = useState(dataStructure);
    const [currentWeekData, setCurrentWeekData] = useState(dataStructure);
    const [previousWeekData, setPreviousWeekData] = useState(dataStructure);
    const [currentMonthData, setCurrentMonthData] = useState(dataStructure);
    const [previousMonthData, setPreviousMonthData] = useState(dataStructure);
    const [currentFinMonthData, setCurrentFinMonthData] = useState(dataStructure);
    const [previousFinMonthData, setPreviousFinMonthData] = useState(dataStructure);

    const formatter = Intl.NumberFormat('en-in', { style: "currency", currency: "INR", maximumFractionDigits: 0 });

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = () => {
        const today = new Date();
        const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        const startOfTheWeek = getFirstDayOfWeek(today);
        const startOfPrevWeek = addDays(startOfTheWeek, -7);
        const endOfPrevWeek = addDays(startOfPrevWeek, 6);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfPrevMonth = addDays(new Date(today.getFullYear(), today.getMonth(), 1), -1);
        const startOfFinMonth = new Date(today.getFullYear(), today.getDate() > 9 ? today.getMonth() : today.getMonth() - 1, 10);
        const startOfPrevFinMonth = new Date(today.getFullYear(), today.getDate() > 9 ? today.getMonth() - 1 : today.getMonth() - 2, 10);
        const endOfPrevFinMonth = new Date(today.getFullYear(), today.getDate() > 9 ? today.getMonth() : today.getMonth() - 1, 9);

        getReportForDateRange(today, today, (data) => {
            setTodayData(data);
            getReportForDateRange(yesterday, yesterday, (data2) => {
                setYesterdayData(data2);
                calculateToday(data, data2);
                setActiveButtonIndex(0);
                setLoading(false);
                getReportForDateRange(startOfTheWeek, today, setCurrentWeekData);
                getReportForDateRange(startOfPrevWeek, endOfPrevWeek, setPreviousWeekData);
                getReportForDateRange(startOfMonth, today, setCurrentMonthData);
                getReportForDateRange(startOfPrevMonth, endOfPrevMonth, setPreviousMonthData);
                getReportForDateRange(startOfFinMonth, today, setCurrentFinMonthData);
                getReportForDateRange(startOfPrevFinMonth, endOfPrevFinMonth, setPreviousFinMonthData);
            });
        });
    }

    const getReportForDateRange = (start: Date, end: Date, cb: (arg0: { price: number; discount: number; tax: number; woTax: number; total: number; start: string; end: string;}) => void) => {
        const startDate = formatDate(start);
        const endDate = formatDate(end);
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${startDate}&end_date=${endDate}&report_type=by_type&app_type=web`;
        callAPI(apiURL, token, setToken, (data: any) => {
            let price = 0;
            let discount = 0;
            let tax = 0;
            let woTax = 0;
            let total = 0;
            for (let d in data.data) {
                const info = data.data[d];
                price += info.price;
                discount += info.discount;
                tax += info.tax;
                woTax += info["total w/o tax"];
                total += info.total;
            }
            cb({
                price: price,
                discount: discount,
                tax: tax,
                woTax: woTax,
                total: total,
                start: start.toString(),
                end: end.toString()
            });
        });
    }

    const refresh = () => {
        setDisplaySale(dataStructure);
        setLoading(true);
        loadData();
    }

    // const durationValue: { [key: string]: string } = {
    //     "day": "Today",
    //     "week": "This Week",
    //     "month": "Financial Month",
    //     "cal_month": "Calendar Month"
    // }

    const setDuration = (duration: string) => {
        //setDisplayDuration(durationValue[duration]);
        switch (duration) {
            case "day":
                calculateToday(todayData, yesterdayData);
                setActiveButtonIndex(0);
                break;
            case "week":
                calculateWeek();
                setActiveButtonIndex(1);
                break;
            case "month":
                calculateMonth();
                setActiveButtonIndex(2);
                break;
            case "cal_month":
                calculateCalendarMonth();
                setActiveButtonIndex(3);
                break;
            default:
                setDisplaySale(dataStructure);
                setDisplayPreviousSale(dataStructure);
                setDisplayVariation(dataStructure);
                break;
        }
    }

    const getVariation = (current: { price: number; discount: number; tax: number; woTax: number; total: number; start: string; end: string;}, previous: { price: number; discount: number; tax: number; woTax: number; total: number; start: string; end: string;}) => {
        return { 
            price: Math.round(((current.price - previous.price) / (previous.price===0?100:previous.price)) * 100), 
            discount: Math.round(((current.discount - previous.discount) / (previous.discount===0?100:previous.discount)) * 100), 
            tax: Math.round(((current.tax - previous.tax) / (previous.tax===0?100:previous.tax)) * 100), 
            woTax: Math.round(((current.woTax - previous.woTax) / (previous.woTax===0?100:previous.woTax)) * 100), 
            total: Math.round(((current.total - previous.total) / (previous.total===0?100:previous.total)) * 100), 
            start: current.start,
            end: current.end
        };
    }

    const calculateToday = (todayDataFromAPI: { price: number; discount: number; tax: number; woTax: number; total: number; start: string; end: string; }, yesterdayDataFromAPI: { price: number; discount: number; tax: number; woTax: number; total: number; start: string; end: string; }) => {
        setDisplaySale(todayDataFromAPI);
        setDisplayPreviousSale(yesterdayDataFromAPI);
        setDisplayVariation(getVariation(todayDataFromAPI, yesterdayDataFromAPI));
        setDisplaySubDuration(formatDisplayDate(new Date()));
    }

    const calculateWeek = () => {
        setDisplaySale(currentWeekData);
        setDisplayPreviousSale(previousWeekData);
        setDisplayVariation(getVariation(currentWeekData, previousWeekData));
        setDisplaySubDuration(formatWeekDay(new Date(currentWeekData.start)) + " to " + formatWeekDay(new Date(currentWeekData.end)));
    }

    const calculateMonth = () => {
        setDisplaySale(currentFinMonthData);
        setDisplayPreviousSale(previousFinMonthData);
        setDisplayVariation(getVariation(currentFinMonthData, previousFinMonthData));
        setDisplaySubDuration(formatDisplayDate(new Date(currentFinMonthData.start)) + " to " + formatDisplayDate(new Date(currentFinMonthData.end)));
    }

    const calculateCalendarMonth = () => {
        setDisplaySale(currentMonthData);
        setDisplayPreviousSale(previousMonthData);
        setDisplayVariation(getVariation(currentMonthData, previousMonthData));
        setDisplaySubDuration(formatDisplayDate(new Date(currentMonthData.start)) + " to " + formatDisplayDate(new Date(currentMonthData.end)));
    }
    return (
        <Card className="shadow" bg={displayVariation.total > 0 ? "success" : "danger"} text="light">
            {
                loading ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                    <Card.Body>
                        <div className="position-relative">
                            <ButtonGroup size="sm">
                                <Button variant={activeButtonIndex === 0 ? "dark" : "light"} onClick={() => setDuration('day')}>Today</Button>
                                <Button variant={activeButtonIndex === 1 ? "dark" : "light"} onClick={() => setDuration('week')}>Week</Button>
                                <Button variant={activeButtonIndex === 2 ? "dark" : "light"} onClick={() => setDuration('month')}>Finance Month</Button>
                                <Button variant={activeButtonIndex === 3 ? "dark" : "light"} onClick={() => setDuration('cal_month')}>Calendar Month</Button>
                            </ButtonGroup>

                        </div>
                        <div className="mt-2">


                            {/* <h6>Sale for {displayDuration}<Button style={{ marginLeft: 8, backgroundColor: "transparent", border: "none" }} variant={displayVariation.total > 0 ? "success" : "danger"} onClick={() => refresh()}><Icon.ArrowClockwise /></Button><p style={{ marginTop: -10 }}><small>{displaySubDuration}</small></p></h6> */}
                            <Row className="border-bottom border-white pb-2 pt-2">
                                <Col xs="12" className="">Sale for {displaySubDuration}<Button className="align-self-center" style={{ marginLeft: 8, backgroundColor: "transparent", border: "none" }} variant={displayVariation.total > 0 ? "success" : "danger"} onClick={() => refresh()}><Icon.ArrowClockwise /></Button></Col>
                            </Row>
                            <Row className="border-bottom border-white border-opacity-25 pb-1 pt-1">
                                <Col xs="5" className="align-self-center text-white text-opacity-75">Total Sale</Col>
                                <Col xs="7">
                                    <h3 className="align-self-center mb-0 text-white text-opacity-75">{formatter.format(displaySale.price)}</h3>
                                    <div className="small text-white-50" style={{marginTop:-2}}>previous {formatter.format(displayPreviousSale.price)} ({displayVariation.price > 0 ?
                                        <Icon.CaretUpFill className="ms-0 me-1" /> : <Icon.CaretDownFill className="ms-0 me-1" />}{Math.abs(displayVariation.price)}%)</div>
                                    <span className="small align-self-center ps-2 float-end text-white-50"></span>
                                </Col>
                            </Row>
                            <Row className="border-bottom border-white border-opacity-25 pb-1 pt-1">
                                <Col xs="5" className="align-self-center text-white text-opacity-75">Discount</Col>
                                <Col xs="7">
                                    <h3 className="align-self-center mb-0 text-white text-opacity-75">{formatter.format(displaySale.discount)}</h3>
                                    <div className="small text-white-50" style={{marginTop:-2}}>previous {formatter.format(displayPreviousSale.discount)} ({displayVariation.discount > 0 ?
                                        <Icon.CaretUpFill className="ms-0 me-1" /> : <Icon.CaretDownFill className="ms-0 me-1" />}{Math.abs(displayVariation.discount)}%)</div>
                                    <span className="small align-self-center ps-2 float-end text-white-50"></span>
                                </Col>
                                
                            </Row>
                            <Row className="border-bottom border-white border-opacity-25 pb-1 pt-1">
                                <Col xs="5" className="align-self-center">Net Before Tax</Col>
                                <Col xs="7">
                                    <h2 className="align-self-center mb-0 fw-bolder neonText">{formatter.format(displaySale.total)}</h2>
                                    <div className="small text-white-50" style={{marginTop:-2}}>previous {formatter.format(displayPreviousSale.total)} ({displayVariation.total > 0 ?
                                        <Icon.CaretUpFill className="ms-0 me-1" /> : <Icon.CaretDownFill className="ms-0 me-1" />}{Math.abs(displayVariation.total)}%)</div>
                                    <span className="small align-self-center ps-2 float-end text-white-50"></span>
                                </Col>
                                
                            </Row>
                            <Row className="border-bottom border-white border-opacity-25 pb-1 pt-1">
                                <Col xs="5" className="align-self-center text-white text-opacity-75">Tax</Col>
                                <Col xs="7">
                                    <h3 className="align-self-center mb-0 text-white text-opacity-75">{formatter.format(displaySale.tax)}</h3>
                                    <div className="small text-white-50" style={{marginTop:-2}}>previous {formatter.format(displayPreviousSale.tax)} ({displayVariation.tax > 0 ?
                                        <Icon.CaretUpFill className="ms-0 me-1" /> : <Icon.CaretDownFill className="ms-0 me-1" />}{Math.abs(displayVariation.tax)}%)</div>
                                    <span className="small align-self-center ps-2 float-end text-white-50"></span>
                                </Col>
                            </Row>
                            <Row className="border-bottom border-white border-opacity-25 pb-1 pt-1">
                                <Col xs="5" className="align-self-center text-white text-opacity-75">Net After Tax</Col>
                                <Col xs="7">
                                    <h3 className="align-self-center mb-0 text-white text-opacity-75">{formatter.format(displaySale.woTax)}</h3>
                                    <div className="small text-white-50" style={{marginTop:-2}}>previous {formatter.format(displayPreviousSale.woTax)} ({displayVariation.woTax > 0 ?
                                        <Icon.CaretUpFill className="ms-0 me-1" /> : <Icon.CaretDownFill className="ms-0 me-1" />}{Math.abs(displayVariation.woTax)}%)</div>
                                    <span className="small align-self-center ps-2 float-end text-white-50"></span>
                                </Col>
                            </Row>
                            <p></p>
                        </div>
                    </Card.Body>
            }

        </Card>
    )
}

