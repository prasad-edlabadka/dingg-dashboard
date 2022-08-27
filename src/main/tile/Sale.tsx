import { useEffect, useState } from "react";
import { Button, ButtonGroup, Card, Spinner } from "react-bootstrap";
import * as Icon from 'react-bootstrap-icons';
import callAPI from "./Utility";

export default function Sale({ token, setToken }: { token: string, setToken: any }) {
    const [displaySale, setDisplaySale] = useState(-1);
    const [displayPreviousSale, setDisplayPreviousSale] = useState(-1);
    const [displayVariation, setDisplayVariation] = useState(-1);
    const [displayDuration, setDisplayDuration] = useState('day');
    const [activeButtonIndex, setActiveButtonIndex] = useState(0);
    const [reportData, setReportData] = useState({ data: [{ total: 0, date: "" }] });

    const formatter = Intl.NumberFormat('en-in', { style: "currency", currency: "INR", maximumFractionDigits: 0 });

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = () => {
        const date = new Date();
        const lastMonthDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        const startDate = formatDate(lastMonthDate);
        const endDate = formatDate(date);
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${startDate}&end_date=${endDate}&report_type=by_revenue&app_type=web`;
        callAPI(apiURL, token, setToken, (data: any) => {
            setReportData(data);
            calculateToday(data);
            setActiveButtonIndex(0);
        });
        console.log("Useffect called...");
    }

    const refresh = () => {
        setDisplaySale(-1);
        loadData();
    }

    const setDuration = (duration: string) => {
        setDisplayDuration(duration);
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
        let endDate = addDays(startDate, 6);
        startDate.setHours(0, 0, 0);
        const currentTotal = getTotalForDuration(startDate.getTime(), endDate.getTime());
        setDisplaySale(currentTotal);

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
        let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        startDate.setHours(0, 0, 0);
        console.log(startDate, endDate);
        const currentTotal = getTotalForDuration(startDate.getTime(), endDate.getTime());
        setDisplaySale(currentTotal);

        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0);
        endDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, endDate.getDate());
        endDate.setHours(23, 59, 59);
        console.log(startDate, endDate);
        const previousTotal = getTotalForDuration(startDate.getTime(), endDate.getTime());
        setDisplayPreviousSale(previousTotal);

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
                                <Button variant={activeButtonIndex === 2 ? "dark" : "light"} onClick={() => setDuration('month')}>Month</Button>
                            </ButtonGroup>
                            <div className="position-absolute top-0 end-0" style={{ marginTop: -10 }}>
                                <Button variant={displayVariation > 0 ? "success" : "danger"} size="lg" onClick={() => refresh()}><Icon.ArrowClockwise /></Button>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h6>Sale for {displayDuration}</h6>
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
