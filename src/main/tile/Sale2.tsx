import { useContext, useEffect, useState } from "react";
import {currencyFormatter, formatDate, getFirstDayOfWeek } from "./Utility";
import {addDays, isAfter, endOfDay, endOfMonth, subMonths, startOfMonth, addMonths, subDays, format } from 'date-fns';
import { TokenContext } from "../../App";
import DiwaButtonGroup from "../../components/button/DiwaButtonGroup";
import DiwaCard from "../../components/card/DiwaCard";
import TitleWithRefresh from "./sale/TitleWithRefresh";
import SaleRow from "./sale/SaleRow";
import DataPoint from "./sale/DataPoint";
import MultiRowDataPoint from "./sale/MultiRowDataPoint";
import { Col, Row } from "react-bootstrap";
import DiwaPaginationButton from "../../components/button/DiwaPaginationButton";

export default function Sale2() {
    const { callAPI } = useContext(TokenContext);
    const dataStructure = { price: -1, discount: -1, tax: -1, woTax: -1, total: -1, start: "Loading...", end: "Loading..." };
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [displaySale, setDisplaySale] = useState(dataStructure);
    const [displayPreviousSale, setDisplayPreviousSale] = useState(dataStructure);
    const [displayVariation, setDisplayVariation] = useState(dataStructure);
    const [displaySubDuration, setDisplaySubDuration] = useState(new Date().toLocaleDateString());

    const [today, setToday] = useState(new Date());
    const [weekStart, setWeekStart] = useState(getFirstDayOfWeek(today));
    const [monthStart, setMonthStart] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [finMonthStart, setFinMonthStart] = useState(new Date(today.getFullYear(), today.getDate() > 9 ? today.getMonth() : today.getMonth() - 1, 10));

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

    const buttonState = useState(0);
    const [activeButtonState, setActiveButtonState] = buttonState;

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeButtonState, reload]);

    const loadData = () => {
        setLoading(true)
        console.log(`Load data called with button index ${activeButtonState}`);
        // const today = new Date();
        const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

        const startOfTheWeek = weekStart;
        const endOfTheWeek = isAfter(addDays(startOfTheWeek, 6), endOfDay(new Date()))? endOfDay(new Date()) : addDays(startOfTheWeek, 6);
        const startOfPrevWeek = addDays(startOfTheWeek, -7);
        const endOfPrevWeek = addDays(startOfPrevWeek, 6);

        const startOfTheMonth = monthStart
        const endOfTheMonth = isAfter(endOfMonth(monthStart), endOfDay(new Date()))? endOfDay(new Date()): endOfMonth(monthStart);
        const startOfPrevMonth = startOfMonth(subMonths(startOfTheMonth, 1));
        const endOfPrevMonth = endOfMonth(startOfPrevMonth);

        const startOfFinMonth = finMonthStart;
        const endOfFinMonth = isAfter(subDays(addMonths(finMonthStart, 1),1), endOfDay(new Date()))? endOfDay(new Date()): subDays(addMonths(finMonthStart, 1),1);
        const startOfPrevFinMonth = subMonths(finMonthStart, 1);
        const endOfPrevFinMonth = subDays(addMonths(startOfPrevFinMonth, 1),1)

        console.log(activeButtonState);
        if (activeButtonState === 0) {
            getReportForDateRange(today, today, (data) => {
                setTodayData(data);
                getReportForDateRange(yesterday, yesterday, (data2) => {
                    setYesterdayData(data2);
                    calculateToday(data, data2);
                    setLoading(false);
                });
            });
        }

        if (activeButtonState === 1) {
            getReportForDateRange(startOfTheWeek, endOfTheWeek, (data) => {
                setCurrentWeekData(data);
                getReportForDateRange(startOfPrevWeek, endOfPrevWeek, (data2) => {
                    setPreviousWeekData(data2);
                    calculateWeek(data, data2);
                    setLoading(false);
                });
            });
        }

        if (activeButtonState === 2) {
            getReportForDateRange(startOfFinMonth, endOfFinMonth, (data) => {
                setCurrentFinMonthData(data);
                getReportForDateRange(startOfPrevFinMonth, endOfPrevFinMonth, (data2) => {
                    setPreviousFinMonthData(data2);
                    calculateFinMonth(data, data2);
                    setLoading(false);
                });
            });
        }

        if (activeButtonState === 3) {
            getReportForDateRange(startOfTheMonth, endOfTheMonth, (data) => {
                setCurrentMonthData(data);
                getReportForDateRange(startOfPrevMonth, endOfPrevMonth, (data2) => {
                    setPreviousMonthData(data2);
                    calculateCalendarMonth(data, data2);
                    setLoading(false);
                });
            });
        }
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
        setReload(!reload);
    }

    const buttonSequence = ["day", "week", "fin_month", "cal_month"];
    const setDuration = (duration: string) => {
        setActiveButtonState(buttonSequence.indexOf(duration));
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

    const calculateToday = (todayDataFromAPI = todayData, yesterdayDataFromAPI = yesterdayData) => {
        getStatsReport(new Date(todayDataFromAPI.start), new Date(todayDataFromAPI.end), new Date(yesterdayDataFromAPI.start), new Date(yesterdayDataFromAPI.end));
        setDisplay(todayDataFromAPI, yesterdayDataFromAPI);
    }

    const calculateWeek = (cw = currentWeekData, pw = previousWeekData) => {
        getStatsReport(new Date(cw.start), new Date(cw.end), new Date(pw.start), new Date(pw.end));
        setDisplay(cw, pw);
    }

    const calculateFinMonth = (cm = currentFinMonthData, pm = previousFinMonthData) => {
        getStatsReport(new Date(cm.start), new Date(cm.end), new Date(pm.start), new Date(pm.end));
        setDisplay(cm, pm);
    }

    const calculateCalendarMonth = (cm = currentMonthData, pm = previousMonthData) => {
        getStatsReport(new Date(cm.start), new Date(cm.end), new Date(pm.start), new Date(pm.end));
        setDisplay(cm, pm);
    }

    const setDisplay = (cd: any, pd: any): void => {
        setDisplaySale(cd);
        setDisplayPreviousSale(pd);
        setDisplayVariation(getVariation(cd, pd));
        const formatStr = activeButtonState === 0 ? ["dd-MMM (EEEE)"] : activeButtonState === 1 ? ["dd-MMM (EEE)", "dd-MMM (EEE)"] : ["dd-MMM-yyyy", "dd-MMM-yyyy"];
        setDisplaySubDuration(format(cd.start, formatStr[0]) + (formatStr[1]? " to " + format(cd.end, formatStr[1]): ""));
    }

    const previous = () => {
        switch (activeButtonState) {
            case 0:
                setToday(addDays(today, -1));
                break;
            case 1:
                setWeekStart(addDays(weekStart, -7));
                break;
            case 2:
                setFinMonthStart(new Date(finMonthStart.getFullYear(), finMonthStart.getMonth() - 1, 10));
                break;
            case 3:
                setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1));
                break;
            default:
                break;
        }
        setReload(!reload);
    }

    const next = () => {
        switch (activeButtonState) {
            case 0:
                setToday(addDays(today, 1));
                break;
            case 1:
                setWeekStart(addDays(weekStart, 7));
                break;
            case 2:
                setFinMonthStart(new Date(finMonthStart.getFullYear(), finMonthStart.getMonth() + 1, 10));
                break;
            case 3:
                setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1));
                break;
            default:
                break;
        }
        setReload(!reload);
    }

    const current = () => {
        switch (activeButtonState) {
            case 0:
                setToday(new Date());
                break;
            case 1:
                setWeekStart(getFirstDayOfWeek(new Date()));
                break;
            case 2:
                setFinMonthStart(new Date(today.getFullYear(), today.getDate() > 9 ? today.getMonth() : today.getMonth() - 1, 10));
                break;
            case 3:
                setMonthStart(new Date(today.getFullYear(), today.getMonth(), 1));
                break;
            default:
                break;
        }
        setReload(!reload);
    }

    const buttons = [
        { title: "Today", onClick: () => setDuration('day') },
        { title: "Week", onClick: () => setDuration('week') },
        { title: "Finance Month", onClick: () => setDuration('fin_month') },
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
                        <DiwaPaginationButton previous={previous} current={current} next={next} />
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

