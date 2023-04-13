import { useContext, useEffect, useState } from "react";
import { Button, Card, Col, Row, Spinner } from "react-bootstrap";
import * as Icon from 'react-bootstrap-icons';
import { addDays, currencyFormatter, formatDate, formatDisplayDate, formatWeekDay, getFirstDayOfWeek } from "./Utility";
import { TokenContext } from "../../App";
import DiwaButtonGroup from "../../components/button/DiwaButtonGroup";

export default function Sale2() {
    const { callAPI } = useContext(TokenContext);
    const dataStructure = { price: -1, discount: -1, tax: -1, woTax: -1, total: -1, start: "", end: "" };
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [displaySale, setDisplaySale] = useState(dataStructure);
    const [displayPreviousSale, setDisplayPreviousSale] = useState(dataStructure);
    const [displayVariation, setDisplayVariation] = useState(dataStructure);
    //const [displayDuration, setDisplayDuration] = useState('day');
    const [displaySubDuration, setDisplaySubDuration] = useState(new Date().toLocaleDateString());
    const [todayData, setTodayData] = useState(dataStructure);
    const [yesterdayData, setYesterdayData] = useState(dataStructure);
    const [currentWeekData, setCurrentWeekData] = useState(dataStructure);
    const [previousWeekData, setPreviousWeekData] = useState(dataStructure);
    const [currentMonthData, setCurrentMonthData] = useState(dataStructure);
    const [previousMonthData, setPreviousMonthData] = useState(dataStructure);
    const [currentFinMonthData, setCurrentFinMonthData] = useState(dataStructure);
    const [previousFinMonthData, setPreviousFinMonthData] = useState(dataStructure);
    const [reportData, setReportData] = useState(
        {
            total_stat_bill: [{ time_one_count: 0, time_two_count: 0, time_one_avg: 0, time_two_avg: 0 }],
            total_stat: [{ time_one_expense: 0, time_two_expense: 0, time_one_collection: 0, time_two_collection: 0 }],
            membership_detail: [{ count_active_membership: 0, count_membership: 0 }],
            new_cust_time_one: { new_customer: 0, new_customer_rev: 0, existing_customer: 0, existing_customer_rev: 0 },
            new_cust_time_two: { new_customer: 0, new_customer_rev: 0, existing_customer: 0, existing_customer_rev: 0 },
        }
    );

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

    const getStatsReport = (start1: Date, end1: Date, start2: Date, end2: Date) => {
        setStatsLoading(true);
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/consolidated?time_one_start=${formatDate(start1)}&time_one_end=${formatDate(end1)}&time_two_start=${formatDate(start2)}&time_two_end=${formatDate(end2)}`
        callAPI(apiURL, (data: any) => {
            setStatsLoading(false);
            setReportData(data.data.length === 0 ? [] : data.data)
        });
    }

    const getReportForDateRange = (start: Date, end: Date, cb: (arg0: { price: number; discount: number; tax: number; woTax: number; total: number; start: string; end: string; }) => void) => {
        const startDate = formatDate(start);
        const endDate = formatDate(end);
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${startDate}&end_date=${endDate}&report_type=by_type&app_type=web`;
        callAPI(apiURL, (data: any) => {
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


    const setDuration = (duration: string) => {
        //setDisplayDuration(durationValue[duration]);
        switch (duration) {
            case "day":
                calculateToday(todayData, yesterdayData);
                break;
            case "week":
                calculateWeek();
                break;
            case "month":
                calculateMonth();
                break;
            case "cal_month":
                calculateCalendarMonth();
                break;
            default:
                setDisplaySale(dataStructure);
                setDisplayPreviousSale(dataStructure);
                setDisplayVariation(dataStructure);
                break;
        }
    }

    const getVariation = (current: { price: number; discount: number; tax: number; woTax: number; total: number; start: string; end: string; }, previous: { price: number; discount: number; tax: number; woTax: number; total: number; start: string; end: string; }) => {
        return {
            price: Math.round(((current.price - previous.price) / (previous.price === 0 ? 100 : previous.price)) * 100),
            discount: Math.round(((current.discount - previous.discount) / (previous.discount === 0 ? 100 : previous.discount)) * 100),
            tax: Math.round(((current.tax - previous.tax) / (previous.tax === 0 ? 100 : previous.tax)) * 100),
            woTax: Math.round(((current.woTax - previous.woTax) / (previous.woTax === 0 ? 100 : previous.woTax)) * 100),
            total: Math.round(((current.total - previous.total) / (previous.total === 0 ? 100 : previous.total)) * 100),
            start: current.start,
            end: current.end
        };
    }

    const calculateToday = (todayDataFromAPI: { price: number; discount: number; tax: number; woTax: number; total: number; start: string; end: string; }, yesterdayDataFromAPI: { price: number; discount: number; tax: number; woTax: number; total: number; start: string; end: string; }) => {
        setDisplaySale(todayDataFromAPI);
        setDisplayPreviousSale(yesterdayDataFromAPI);
        setDisplayVariation(getVariation(todayDataFromAPI, yesterdayDataFromAPI));
        setDisplaySubDuration(formatDisplayDate(new Date()));
        getStatsReport(new Date(todayDataFromAPI.start), new Date(todayDataFromAPI.end), new Date(yesterdayDataFromAPI.start), new Date(yesterdayDataFromAPI.end));
    }

    const calculateWeek = () => {
        setDisplaySale(currentWeekData);
        setDisplayPreviousSale(previousWeekData);
        setDisplayVariation(getVariation(currentWeekData, previousWeekData));
        setDisplaySubDuration(formatWeekDay(new Date(currentWeekData.start)) + " to " + formatWeekDay(new Date(currentWeekData.end)));
        getStatsReport(new Date(currentWeekData.start), new Date(currentWeekData.end), new Date(previousWeekData.start), new Date(previousWeekData.end));
    }

    const calculateMonth = () => {
        setDisplaySale(currentFinMonthData);
        setDisplayPreviousSale(previousFinMonthData);
        setDisplayVariation(getVariation(currentFinMonthData, previousFinMonthData));
        setDisplaySubDuration(formatDisplayDate(new Date(currentFinMonthData.start)) + " to " + formatDisplayDate(new Date(currentFinMonthData.end)));
        getStatsReport(new Date(currentFinMonthData.start), new Date(currentFinMonthData.end), new Date(previousFinMonthData.start), new Date(previousFinMonthData.end));
    }

    const calculateCalendarMonth = () => {
        setDisplaySale(currentMonthData);
        setDisplayPreviousSale(previousMonthData);
        setDisplayVariation(getVariation(currentMonthData, previousMonthData));
        setDisplaySubDuration(formatDisplayDate(new Date(currentMonthData.start)) + " to " + formatDisplayDate(new Date(currentMonthData.end)));
        getStatsReport(new Date(currentMonthData.start), new Date(currentMonthData.end), new Date(previousMonthData.start), new Date(previousMonthData.end));
    }

    const buttons = [
        { title: "Today", onClick: () => setDuration('day') },
        { title: "Week", onClick: () => setDuration('week') },
        { title: "Finance Month", onClick: () => setDuration('month') },
        { title: "Calendar Month", onClick: () => setDuration('cal_month') }
    ];
    const buttonState = useState(0);
    return (
        <>
            <Card className="shadow" bg={displayVariation.total > 0 ? "success" : "danger"} text="light">
                {
                    loading ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                        <Card.Body>
                            <DiwaButtonGroup buttons={buttons} state={buttonState} />
                            <div className="mt-2">
                                <Row className="border-bottom border-white pb-2 pt-2">
                                    <Col xs="12" className="">Sale for {displaySubDuration}<Button className="align-self-center" style={{ marginLeft: 8, backgroundColor: "transparent", border: "none" }} variant={displayVariation.total > 0 ? "success" : "danger"} onClick={() => refresh()}><Icon.ArrowClockwise /></Button></Col>
                                </Row>
                                <Row className="border-bottom border-white border-opacity-25 pb-1 pt-1">
                                    <Col xs="4" className="align-self-center"><h4>Sale</h4></Col>
                                    <Col xs="8">
                                        <h1 className="align-self-center mb-0 fw-bolder">{currencyFormatter.format(displaySale.total)}</h1>
                                        <div className="small text-white-50" style={{ marginTop: -2 }}>previous {currencyFormatter.format(displayPreviousSale.total)} ({displayVariation.total > 0 ?
                                            <Icon.CaretUpFill className="ms-0 me-1" /> : <Icon.CaretDownFill className="ms-0 me-1" />}{Math.abs(displayVariation.total)}%)</div>
                                        <span className="small align-self-center ps-2 float-end text-white-50"></span>
                                    </Col>

                                </Row>
                                <Row className="border-bottom border-white border-opacity-25 pb-1 pt-1">
                                    <Col xs="4" className="align-self-top text-white text-opacity-75 small">Without Discount</Col>
                                    <Col xs="8">
                                        <h5 className="align-self-center mb-0 text-white text-opacity-75">{currencyFormatter.format(displaySale.price)}</h5>
                                        <div className="small text-white-50" style={{ marginTop: -2 }}>previous {currencyFormatter.format(displayPreviousSale.price)} ({displayVariation.price > 0 ?
                                            <Icon.CaretUpFill className="ms-0 me-1" /> : <Icon.CaretDownFill className="ms-0 me-1" />}{Math.abs(displayVariation.price)}%)</div>
                                        <span className="small align-self-center ps-2 float-end text-white-50"></span>
                                    </Col>
                                </Row>
                                <Row className="border-bottom border-white border-opacity-25 pb-1 pt-1">
                                    <Col xs="4" className="align-self-top text-white text-opacity-75 small">Total Discount</Col>
                                    <Col xs="8">
                                        <h5 className="align-self-center mb-0 text-white text-opacity-75">{currencyFormatter.format(displaySale.discount)}</h5>
                                        <div className="small text-white-50" style={{ marginTop: -2 }}>previous {currencyFormatter.format(displayPreviousSale.discount)} ({displayVariation.discount > 0 ?
                                            <Icon.CaretUpFill className="ms-0 me-1" /> : <Icon.CaretDownFill className="ms-0 me-1" />}{Math.abs(displayVariation.discount)}%)</div>
                                        <span className="small align-self-center ps-2 float-end text-white-50"></span>
                                    </Col>

                                </Row>

                                <Row className="border-bottom border-white border-opacity-25 pb-1 pt-1">
                                    <Col xs="4" className="align-self-top text-white text-opacity-75 small">Tax</Col>
                                    <Col xs="8">
                                        <h5 className="align-self-center mb-0 text-white text-opacity-75">{currencyFormatter.format(displaySale.tax)}</h5>
                                        <div className="small text-white-50" style={{ marginTop: -2 }}>previous {currencyFormatter.format(displayPreviousSale.tax)} ({displayVariation.tax > 0 ?
                                            <Icon.CaretUpFill className="ms-0 me-1" /> : <Icon.CaretDownFill className="ms-0 me-1" />}{Math.abs(displayVariation.tax)}%)</div>
                                        <span className="small align-self-center ps-2 float-end text-white-50"></span>
                                    </Col>
                                </Row>
                                <Row className="border-bottom border-white border-opacity-25 pb-1 pt-1">
                                    <Col xs="4" className="align-self-top text-white text-opacity-75 small">After Tax</Col>
                                    <Col xs="8">
                                        <h5 className="align-self-center mb-0 text-white text-opacity-75">{currencyFormatter.format(displaySale.woTax)}</h5>
                                        <div className="small text-white-50" style={{ marginTop: -2 }}>previous {currencyFormatter.format(displayPreviousSale.woTax)} ({displayVariation.woTax > 0 ?
                                            <Icon.CaretUpFill className="ms-0 me-1" /> : <Icon.CaretDownFill className="ms-0 me-1" />}{Math.abs(displayVariation.woTax)}%)</div>
                                        <span className="small align-self-center ps-2 float-end text-white-50"></span>
                                    </Col>
                                </Row>
                                <p></p>
                            </div>
                        </Card.Body>
                }

            </Card>
            <Card className="shadow mb-3 mt-3" bg={reportData.total_stat[0].time_one_collection - reportData.total_stat[0].time_one_expense > 0 ? "success" : "danger"} text="light">
                {statsLoading ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                    <Card.Body>
                        <Row>
                            <Col xs="4" className="pe-0">
                                <h6 className="mb-0">Earning</h6>
                                <h4 className="align-self-center mb-0">{currencyFormatter.format(reportData.total_stat[0].time_one_collection)}</h4>
                                <div className="small text-white-50" style={{ marginTop: -2 }}>last {currencyFormatter.format(reportData.total_stat[0].time_two_collection)}</div>
                            </Col>
                            <Col xs="4" className="pe-0">
                                <h6 className="mb-0">Expenses</h6>
                                <h4 className="align-self-center mb-0">{currencyFormatter.format(reportData.total_stat[0].time_one_expense)}</h4>
                                <div className="small text-white-50" style={{ marginTop: -2 }}>last {currencyFormatter.format(reportData.total_stat[0].time_two_expense)}</div>
                            </Col>

                            <Col xs="4" className="pe-0">
                                <h6 className="mb-0">P&L</h6>
                                <h4 className="align-self-center mb-0">{currencyFormatter.format(reportData.total_stat[0].time_one_collection - reportData.total_stat[0].time_one_expense)}</h4>
                                <div className="small text-white-50" style={{ marginTop: -2 }}>last {currencyFormatter.format(reportData.total_stat[0].time_two_collection - reportData.total_stat[0].time_two_expense)}</div>
                            </Col>
                        </Row>
                    </Card.Body>}
            </Card>
            <Card className="shadow mb-3 mt-3" bg="primary" text="light">
                {statsLoading ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                    <Card.Body>
                        <Row>
                            <Col xs="4">
                                <h6 className="mb-0">Customers</h6>
                                <h3 className="align-self-center mb-0 fw-bolder">{reportData.total_stat_bill[0].time_one_count}</h3>
                                <div className="small text-white-50" style={{ marginTop: -2 }}>previous {reportData.total_stat_bill[0].time_two_count}</div>
                            </Col>

                            <Col xs="4">
                                <h6 className="mb-0">Members</h6>
                                <h3 className="align-self-center mb-0 fw-bolder">{reportData.membership_detail[0].count_membership}</h3>
                                <div className="small text-white-50" style={{ marginTop: -2 }}>active {reportData.membership_detail[0].count_active_membership}</div>
                            </Col>
                            <Col xs="4">
                                <h6 className="mb-0">Ticket Size</h6>
                                <h3 className="align-self-center mb-0 fw-bolder">{currencyFormatter.format(reportData.total_stat_bill[0].time_one_avg)}</h3>
                                <div className="small text-white-50" style={{ marginTop: -2 }}>previous {currencyFormatter.format(reportData.total_stat_bill[0].time_two_avg)}</div>
                            </Col>
                        </Row>
                    </Card.Body>}
            </Card>
            <Card className="shadow mb-3 mt-3" bg="primary" text="light">
                {statsLoading ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                    <Card.Body>
                        <Row>
                            <Col xs="6">
                                <h3 className="align-self-center mb-0 fw-bolder">{currencyFormatter.format(reportData.new_cust_time_one.new_customer_rev)}</h3>
                                <h6 className="mb-0 small text-white-50">Revenue from</h6>
                                <h3 className="align-self-center mb-0 fw-bolder">{reportData.new_cust_time_one.new_customer}</h3>
                                <h6 className="mb-0 small text-white-50">New Customers</h6>
                            </Col>

                            <Col xs="6">
                                <h3 className="align-self-center mb-0 fw-bolder">{currencyFormatter.format(reportData.new_cust_time_one.existing_customer_rev)}</h3>
                                <h6 className="mb-0 small text-white-50">Revenue from</h6>
                                <h3 className="align-self-center mb-0 fw-bolder">{reportData.new_cust_time_one.existing_customer}</h3>
                                <h6 className="mb-0 small text-white-50">Exising Customers</h6>
                            </Col>
                        </Row>
                    </Card.Body>}
            </Card>
        </>
    )
}

