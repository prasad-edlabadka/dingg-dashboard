import { useEffect, useState } from "react";
import { Button, ButtonGroup, Card, Spinner } from "react-bootstrap";
import * as Icon from 'react-bootstrap-icons';
import callAPI from "./Utility";

export default function Sale({ token, setToken }: { token: string, setToken: any }) {
    const [displaySale, setDisplaySale] = useState(-1);
    const [displayPreviousSale, setDisplayPreviousSale] = useState(-1);
    const [displayVariation, setDisplayVariation] = useState(-1);
    const [displayDuration, setDisplayDuration] = useState('day');
    const [displaySubDuration, setDisplaySubDuration] = useState(new Date().toLocaleDateString());
    const [activeButtonIndex, setActiveButtonIndex] = useState(0);
    const [reportData, setReportData] = useState({ data: [{ total: 0, date: "" }] });

    const formatter = Intl.NumberFormat('en-in', { style: "currency", currency: "INR", maximumFractionDigits: 0 });

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = () => {
        const date = new Date();
        const lastMonthDate = new Date(date.getFullYear(), date.getDate() > 9 ? date.getMonth() - 1 : date.getMonth() - 2, date.getDate() > 9 ? 1 : 10);
        const startDate = formatDate(lastMonthDate);
        const endDate = formatDate(date);
        const yesterday = formatDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1));
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${startDate}&end_date=${endDate}&report_type=by_revenue&app_type=web`;
        const todayAPIURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${yesterday}&end_date=${endDate}&report_type=by_revenue&app_type=web`;
        callAPI(todayAPIURL, token, setToken, (data: any) => {
            setReportData(data);
            calculateToday(data);
            setActiveButtonIndex(0);
            callAPI(apiURL, token, setToken, (data: any) => {
                setReportData(data);
                calculateToday(data);
                setActiveButtonIndex(0);
            });
        });

    }

    const refresh = () => {
        setDisplaySale(-1);
        loadData();
    }

    const durationValue: { [key: string]: string } = {
        "day": "Today",
        "week": "This Week",
        "month": "Financial Month",
        "cal_month": "Calendar Month"
    }

    const setDuration = (duration: string) => {
        setDisplayDuration(durationValue[duration]);
        switch (duration) {
            case "day":
                calculateToday();
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
                setDisplaySale(0);
                setDisplayPreviousSale(0);
                setDisplayVariation(0);
                break;
        }
    }

    const calculateToday = (data = reportData) => {
        const len = data.data.length;
        const today = data.data[len - 1].total;
        const yesterday = data.data[len - 2].total
        setDisplaySale(today);
        setDisplayPreviousSale(yesterday);
        setDisplayVariation(((today - yesterday) / yesterday) * 100);
        setDisplaySubDuration(formatDisplayDate(new Date()));
    }

    const getTotalForDuration = (start: number, end: number) => {
        const weekData = reportData.data.filter(val => {
            let reportDate = new Date(val.date).getTime();
            return (reportDate >= start && reportDate <= end);
        });
        let total = 0;
        for (let i = 0; i < weekData.length; i++) {
            total += weekData[i].total;
        }
        return total;
    }
    const calculateWeek = () => {
        const currentDate = new Date();
        currentDate.setHours(23, 59, 59);
        let startDate = getFirstDayOfWeek(currentDate);
        startDate.setHours(23, 59, 59);
        let endDate = currentDate;
        startDate.setHours(0, 0, 0);
        const currentTotal = getTotalForDuration(startDate.getTime(), endDate.getTime());
        setDisplaySale(currentTotal);
        setDisplaySubDuration(formatWeekDay(startDate) + " to " + formatWeekDay(endDate));

        currentDate.setHours(0, 0, 0);
        startDate = addDays(getFirstDayOfWeek(currentDate), -7);
        startDate.setHours(23, 59, 59);
        endDate = addDays(startDate, 6);
        startDate.setHours(0, 0, 0);

        const previousTotal = getTotalForDuration(startDate.getTime(), endDate.getTime());
        setDisplayPreviousSale(previousTotal);

        setDisplayVariation(((currentTotal - previousTotal) / previousTotal) * 100);
    }

    const calculateMonth = () => {
        let endDate = new Date();
        endDate.setHours(23, 59, 59);
        let startDate = new Date(endDate.getFullYear(), endDate.getDate() > 9 ? endDate.getMonth() : endDate.getMonth() - 1, 10);
        startDate.setHours(0, 0, 0);
        console.log(startDate, endDate);
        const currentTotal = getTotalForDuration(startDate.getTime(), endDate.getTime());
        console.log(`Current: ${currentTotal}`)
        setDisplaySale(currentTotal);

        setDisplaySubDuration(formatDisplayDate(startDate) + " to " + formatDisplayDate(endDate));

        startDate = new Date(endDate.getFullYear(), endDate.getDate() > 9 ? endDate.getMonth() - 1 : endDate.getMonth() - 2, 10);
        startDate.setHours(0, 0, 0);
        endDate = new Date(endDate.getFullYear(), endDate.getDate() > 9 ? endDate.getMonth() : endDate.getMonth() - 1, 9);
        endDate.setHours(23, 59, 59);
        console.log(startDate, endDate);
        const previousTotal = getTotalForDuration(startDate.getTime(), endDate.getTime());
        setDisplayPreviousSale(previousTotal);
        console.log(`Previous: ${previousTotal}`)

        setDisplayVariation(((currentTotal - previousTotal) / previousTotal) * 100);

    }

    const calculateCalendarMonth = () => {
        let endDate = new Date();
        endDate.setHours(23, 59, 59);
        let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        startDate.setHours(0, 0, 0);
        console.log(startDate, endDate);
        const currentTotal = getTotalForDuration(startDate.getTime(), endDate.getTime());
        console.log(`Current: ${currentTotal}`)
        setDisplaySale(currentTotal);

        setDisplaySubDuration(formatDisplayDate(startDate) + " to " + formatDisplayDate(endDate));

        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0);
        endDate = addDays(new Date(endDate.getFullYear(), endDate.getMonth(), 1), -1);
        endDate.setHours(23, 59, 59);
        console.log(startDate, endDate);
        const previousTotal = getTotalForDuration(startDate.getTime(), endDate.getTime());
        setDisplayPreviousSale(previousTotal);
        console.log(`Previous: ${previousTotal}`)

        setDisplayVariation(((currentTotal - previousTotal) / previousTotal) * 100);

    }
    return (
        <Card className="shadow" bg={displayVariation > 0 ? "success" : "danger"} text="light">
            {/* <Card.Header>Sale Summary</Card.Header> */}
            {
                displaySale === -1 ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                    <Card.Body>
                        <div className="position-relative">
                            <ButtonGroup size="sm">
                                <Button variant={activeButtonIndex === 0 ? "dark" : "light"} onClick={() => setDuration('day')}>Today</Button>
                                <Button variant={activeButtonIndex === 1 ? "dark" : "light"} onClick={() => setDuration('week')}>Week</Button>
                                <Button variant={activeButtonIndex === 2 ? "dark" : "light"} onClick={() => setDuration('month')}>Finance Month</Button>
                                <Button variant={activeButtonIndex === 3 ? "dark" : "light"} onClick={() => setDuration('cal_month')}>Calendar Month</Button>
                            </ButtonGroup>

                        </div>
                        <div className="mt-4">

                            <h6>Sale for {displayDuration}<Button style={{marginLeft: 8, backgroundColor: "transparent", border: "none"}} variant={displayVariation > 0 ? "success" : "danger"} onClick={() => refresh()}><Icon.ArrowClockwise /></Button><p style={{marginTop:-10}}><small>{displaySubDuration}</small></p></h6>

                            <h1 className="display-3"><strong>{formatter.format(displaySale)}</strong></h1>
                            {displayVariation > 0 ?
                                <Icon.CaretUpFill className="me-1" /> : <Icon.CaretDownFill className="me-1" />
                            }
                            <span>{Math.abs(Math.round(displayVariation))}% {displayVariation > 0 ? 'more' : 'less'} than previous {displayDuration} ({formatter.format(displayPreviousSale)})</span>
                        </div>
                    </Card.Body>
            }

        </Card>
    )
}

function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

function getFirstDayOfWeek(d: Date) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
}

function formatDate(dt: Date): string {
    return [dt.getFullYear(), padTo2Digits(dt.getMonth() + 1), padTo2Digits(dt.getDate())].join('-');
}

function addDays(dt: Date, days: number): Date {
    let retDate = new Date(dt);
    const result = retDate.setDate(retDate.getDate() + days);
    return new Date(result);
}

function formatDisplayDate(d: Date) {
    return d.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    }).replace(/ /g, '-');
}

function formatWeekDay(d: Date) {
    return d.toLocaleDateString('en-GB', { weekday: 'long' })
}
