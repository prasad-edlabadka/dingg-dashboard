import { useContext, useEffect, useState } from "react";
import { addDays, currencyFormatter, formatDate, formatDisplayDate, formatWeekDay, getFirstDayOfWeek } from "./Utility";
import { TokenContext } from "../../App";
import DiwaButtonGroup from "../../components/button/DiwaButtonGroup";
import DiwaCard from "../../components/card/DiwaCard";
import TitleWithRefresh from "./sale/TitleWithRefresh";
import SaleRow from "./sale/SaleRow";
import DataPoint from "./sale/DataPoint";
import MultiRowDataPoint from "./sale/MultiRowDataPoint";
import { Col, Row } from "react-bootstrap";

export default function Sale2() {
    const { callAPI } = useContext(TokenContext);
    const dataStructure = { price: -1, discount: -1, tax: -1, woTax: -1, total: -1, start: "", end: "" };
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [displaySale, setDisplaySale] = useState(dataStructure);
    const [displayPreviousSale, setDisplayPreviousSale] = useState(dataStructure);
    const [displayVariation, setDisplayVariation] = useState(dataStructure);
    const [displaySubDuration, setDisplaySubDuration] = useState(new Date().toLocaleDateString());
    const [todayData, setTodayData] = useState(dataStructure);
    const [yesterdayData, setYesterdayData] = useState(dataStructure);
    const [currentWeekData, setCurrentWeekData] = useState(dataStructure);
    const [previousWeekData, setPreviousWeekData] = useState(dataStructure);
    const [currentMonthData, setCurrentMonthData] = useState(dataStructure);
    const [previousMonthData, setPreviousMonthData] = useState(dataStructure);
    const [currentFinMonthData, setCurrentFinMonthData] = useState(dataStructure);
    const [previousFinMonthData, setPreviousFinMonthData] = useState(dataStructure);
    const [cashExpenses, setCashExpenses] = useState(0);
    const [prevCashExpenses, setPrevCashExpenses] = useState(0);
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
            if (!data) return;
            setStatsLoading(false);
            setReportData(data.data.length === 0 ? [] : data.data)
        });
        const cashAPIURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${formatDate(start1)}&report_type=by_expense_type&end_date=${formatDate(end1)}&locations=null&app_type=web`;
        callAPI(cashAPIURL, (data: any) => {
            if (!data) return;
            setCashExpenses(data.data.find((d: any) => d["expense type"] === "Cash transfer to hub")?.total || 0)
        });

        const prevCashAPIURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${formatDate(start2)}&report_type=by_expense_type&end_date=${formatDate(end2)}&locations=null&app_type=web`;
        callAPI(prevCashAPIURL, (data: any) => {
            if (!data) return;
            setPrevCashExpenses(data.data.find((d: any) => d["expense type"] === "Cash transfer to hub")?.total || 0)
        });
    }

    const getReportForDateRange = (start: Date, end: Date, cb: (arg0: { price: number; discount: number; tax: number; woTax: number; total: number; start: string; end: string; }) => void) => {
        const startDate = formatDate(start);
        const endDate = formatDate(end);
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${startDate}&end_date=${endDate}&report_type=by_type&app_type=web`;
        callAPI(apiURL, (data: any) => {
            if (!data) return;
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

    const pnl = [
        { title: "Earning", value: currencyFormatter.format(reportData.total_stat[0].time_one_collection), previous: currencyFormatter.format(reportData.total_stat[0].time_two_collection), subTitle: 'last' },
        { title: "Expense", value: currencyFormatter.format(reportData.total_stat[0].time_one_expense - cashExpenses), previous: currencyFormatter.format(reportData.total_stat[0].time_two_expense - prevCashExpenses), subTitle: 'last' },
        { title: "P&L", value: currencyFormatter.format(reportData.total_stat[0].time_one_collection - reportData.total_stat[0].time_one_expense + cashExpenses), previous: currencyFormatter.format(reportData.total_stat[0].time_two_collection - reportData.total_stat[0].time_two_expense + prevCashExpenses), subTitle: 'last' },
    ];

    const customers = [
        { title: "Customers", value: reportData.total_stat_bill[0].time_one_count, previous: reportData.total_stat_bill[0].time_two_count, subTitle: 'previous' },
        { title: "Members", value: reportData.membership_detail[0].count_membership, previous: reportData.membership_detail[0].count_active_membership, subTitle: 'active' },
        { title: "Ticket Size", value: currencyFormatter.format(reportData.total_stat_bill[0].time_one_avg), previous: currencyFormatter.format(reportData.total_stat_bill[0].time_two_avg), subTitle: 'previous' },
    ];

    const revenue = [
        { title1: "Revenue from", value1: currencyFormatter.format(reportData.new_cust_time_one.new_customer_rev), title2: "New Customers", value2: reportData.new_cust_time_one.new_customer },
        { title1: "Revenue from", value1: currencyFormatter.format(reportData.new_cust_time_one.existing_customer_rev), title2: "Exising Customers", value2: reportData.new_cust_time_one.existing_customer },
    ]
    const buttonState = useState(0);
    return (
        <>
            <Row>
                <Col xs={12} lg={4}>
                    <DiwaCard varient={displaySale.total > displayPreviousSale.total ? "success" : "danger"} loadingTracker={loading}>
                        <DiwaButtonGroup buttons={buttons} state={buttonState} />
                        <TitleWithRefresh title={`Sale for ${displaySubDuration}`} varient={displaySale.total > displayPreviousSale.total ? "success" : "danger"} onRefresh={refresh} />
                        <SaleRow title="Sale" current={displaySale.total} previous={displayPreviousSale.total} variation={displayVariation.total} primary={true} />
                        <SaleRow title="Without Discount" current={displaySale.price} previous={displayPreviousSale.price} variation={displayVariation.price} primary={false} />
                        <SaleRow title="Total Discount" current={displaySale.discount} previous={displayPreviousSale.discount} variation={displayVariation.discount} primary={false} />
                        {/* <SaleRow title="Tax" current={displaySale.tax} previous={displayPreviousSale.tax} variation={displayVariation.tax} primary={false} />
                        <SaleRow title="After Tax" current={displaySale.woTax} previous={displayPreviousSale.woTax} variation={displayVariation.woTax} primary={false} /> */}
                        <p></p>
                    </DiwaCard>
                </Col>

                <Col xs={12} lg={4}>
                    <DiwaCard varient={reportData.total_stat[0].time_one_collection - reportData.total_stat[0].time_one_expense > 0 ? "success" : "danger"} loadingTracker={statsLoading}>
                        <DataPoint data={pnl} />
                    </DiwaCard>
                    <DiwaCard varient="primary" loadingTracker={statsLoading}>
                        <DataPoint data={customers} />
                    </DiwaCard>
                    <DiwaCard varient="primary" loadingTracker={statsLoading}>
                        <MultiRowDataPoint data={revenue} />
                    </DiwaCard>
                </Col>
            </Row>

        </>
    )
}

