import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { currencyFormatter, formatDate, getFirstDayOfWeek } from "./Utility";
import {
  addDays,
  isAfter,
  endOfDay,
  endOfMonth,
  subMonths,
  startOfMonth,
  addMonths,
  subDays,
  format,
  isBefore,
  differenceInDays,
} from "date-fns";
import { TokenContext, API_BASE_URL } from "../../App";
import DiwaButtonGroup from "../../components/button/DiwaButtonGroup";
import DiwaCard from "../../components/card/DiwaCard";
import TitleWithRefresh from "./sale/TitleWithRefresh";
import SaleRow from "./sale/SaleRow";
import DataPoint from "./sale/DataPoint";
import MultiRowDataPoint from "./sale/MultiRowDataPoint";
import { Col, Row } from "react-bootstrap";
import DiwaPaginationButton from "../../components/button/DiwaPaginationButton";

interface DataStructure {
  price: number;
  discount: number;
  tax: number;
  woTax: number;
  total: number;
  tip: number;
  start: string;
  end: string;
}

interface DataPointStructure {
  title: string;
  value: string;
  previous?: number;
  subTitle?: string;
  span?: string;
}

export default function Sale2() {
  const { callAPI, callAPIPromise } = useContext(TokenContext);
  const initialData: DataStructure = {
    price: -1,
    discount: -1,
    tax: -1,
    woTax: -1,
    total: -1,
    tip: -1,
    start: "Loading...",
    end: "Loading...",
  };
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [displaySale, setDisplaySale] = useState<DataStructure>(initialData);
  const [displayPreviousSale, setDisplayPreviousSale] = useState<DataStructure>(initialData);
  const [displayVariation, setDisplayVariation] = useState<DataStructure>(initialData);
  const [displaySubDuration, setDisplaySubDuration] = useState(new Date().toLocaleDateString());

  const [today, setToday] = useState(new Date());
  const [weekStart, setWeekStart] = useState(getFirstDayOfWeek(today));
  const [monthStart, setMonthStart] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [finMonthStart, setFinMonthStart] = useState(
    new Date(today.getFullYear(), today.getDate() > 9 ? today.getMonth() : today.getMonth() - 1, 10)
  );

  const [cashExpenses, setCashExpenses] = useState(0);
  const [prevCashExpenses, setPrevCashExpenses] = useState(0);
  const [reportData, setReportData] = useState({
    total_stat_bill: [{ time_one_count: 0, time_two_count: 0, time_one_avg: 0, time_two_avg: 0 }],
    total_stat: [{ time_one_expense: 0, time_two_expense: 0, time_one_collection: 0, time_two_collection: 0 }],
    membership_detail: [{ count_active_membership: 0, count_membership: 0 }],
    new_cust_time_one: { new_customer: 0, new_customer_rev: 0, existing_customer: 0, existing_customer_rev: 0 },
    new_cust_time_two: { new_customer: 0, new_customer_rev: 0, existing_customer: 0, existing_customer_rev: 0 },
  });

  const buttonState = useState(0);
  const [activeButtonState, setActiveButtonState] = buttonState;
  const [rangeType, setRangeType] = useState("day");
  const [categoryTotals, setCategoryTotals] = useState<DataPointStructure[]>([]);
  const [tempPopup, setTempPopup] = useState(true);

  const calculateYesterday = useMemo(() => {
    // console.log("Calculating yesterday");
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    return {
      start: today,
      end: today,
      prevStart: yesterday,
      prevEnd: yesterday,
    };
  }, [today]);

  const calculateWeekDates = useMemo(() => {
    // console.log("Calculating week");
    const startOfTheWeek = weekStart;
    const endOfTheWeek = isAfter(addDays(startOfTheWeek, 6), endOfDay(new Date()))
      ? endOfDay(new Date())
      : addDays(startOfTheWeek, 6);
    const startOfPrevWeek = addDays(startOfTheWeek, -7);
    const endOfPrevWeek = addDays(startOfPrevWeek, 6);
    return {
      start: startOfTheWeek,
      end: endOfTheWeek,
      prevStart: startOfPrevWeek,
      prevEnd: endOfPrevWeek,
    };
  }, [weekStart]);

  const calculateMonthDates = useMemo(() => {
    // console.log("Calculating month");
    const startOfTheMonth = monthStart;
    const endOfTheMonth = isAfter(endOfMonth(monthStart), endOfDay(new Date()))
      ? endOfDay(new Date())
      : endOfMonth(monthStart);
    const startOfPrevMonth = startOfMonth(subMonths(startOfTheMonth, 1));
    const endOfPrevMonth = endOfMonth(startOfPrevMonth);
    return {
      start: startOfTheMonth,
      end: endOfTheMonth,
      prevStart: startOfPrevMonth,
      prevEnd: endOfPrevMonth,
    };
  }, [monthStart]);

  const calculateFinMonthDates = useMemo(() => {
    // console.log("Calculating fin month");
    const startOfFinMonth = finMonthStart;
    const endOfFinMonth = isAfter(subDays(addMonths(finMonthStart, 1), 1), endOfDay(new Date()))
      ? endOfDay(new Date())
      : subDays(addMonths(finMonthStart, 1), 1);
    const startOfPrevFinMonth = subMonths(finMonthStart, 1);
    const endOfPrevFinMonth = subDays(addMonths(startOfPrevFinMonth, 1), 1);
    return {
      start: startOfFinMonth,
      end: endOfFinMonth,
      prevStart: startOfPrevFinMonth,
      prevEnd: endOfPrevFinMonth,
    };
  }, [finMonthStart]);

  const getStatsReport = useCallback(
    (start1: Date, end1: Date, start2: Date, end2: Date) => {
      setStatsLoading(true);
      const apiURL = `${API_BASE_URL}/vendor/report/consolidated?time_one_start=${formatDate(
        start1
      )}&time_one_end=${formatDate(end1)}&time_two_start=${formatDate(start2)}&time_two_end=${formatDate(end2)}`;
      callAPI(apiURL, (data: any) => {
        if (!data) return;
        setStatsLoading(false);
        setReportData(data.data.length === 0 ? [] : data.data);
      });
      const cashAPIURL = `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(
        start1
      )}&report_type=by_expense_type&end_date=${formatDate(end1)}&locations=null&app_type=web`;
      callAPI(cashAPIURL, (data: any) => {
        if (!data) return;
        setCashExpenses(data.data.find((d: any) => d["expense type"] === "Cash transfer to hub")?.total || 0);
      });

      const prevCashAPIURL = `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(
        start2
      )}&report_type=by_expense_type&end_date=${formatDate(end2)}&locations=null&app_type=web`;
      callAPI(prevCashAPIURL, (data: any) => {
        if (!data) return;
        setPrevCashExpenses(data.data.find((d: any) => d["expense type"] === "Cash transfer to hub")?.total || 0);
      });
    },
    [callAPI]
  );

  const getReportForDateRange = useCallback(
    (
      start: Date,
      end: Date,
      cb: (arg0: {
        price: number;
        discount: number;
        tax: number;
        woTax: number;
        total: number;
        tip: number;
        start: string;
        end: string;
      }) => void,
      storeData?: any
    ) => {
      const startDate = formatDate(start);
      const endDate = formatDate(end);
      const apiURL = `${API_BASE_URL}/vendor/report/sales?start_date=${startDate}&end_date=${endDate}&report_type=by_type&app_type=web`;
      callAPI(apiURL, (data: any) => {
        if (!data) return;
        if (typeof storeData === "function") {
          storeData(data.data);
        }
        const values = data.data.reduce(
          (acc: any, info: any) => {
            acc.total += Number.parseFloat(info["grand total"] || "0");
            acc.price += Number.parseFloat(info.price || "0");
            acc.discount += Number.parseFloat(info.discount || "0");
            acc.tax += Number.parseFloat(info.tax || "0");
            acc.woTax += Number.parseFloat(info["total w/o tax"] || "0");
            if (info.type === "Tips") {
              acc.tip += Number.parseFloat(info["grand total"] || "0");
            }
            //console.log(acc, info, Number.parseFloat(info["grand total"] || "0"));
            return acc;
          },
          { price: 0, discount: 0, tax: 0, woTax: 0, total: 0, tip: 0, start: start.toString(), end: end.toString() }
        );
        cb(values);
      });
    },
    [callAPI]
  );

  const getVariation = useCallback(
    (
      current: {
        price: number;
        discount: number;
        tax: number;
        woTax: number;
        total: number;
        tip: number;
        start: string;
        end: string;
      },
      previous: {
        price: number;
        discount: number;
        tax: number;
        woTax: number;
        total: number;
        tip: number;
        start: string;
        end: string;
      }
    ) => {
      return {
        price: variation(current.price, previous.price),
        discount: variation(current.discount, previous.discount),
        tax: variation(current.tax, previous.tax),
        woTax: variation(current.woTax, previous.woTax),
        total: variation(current.total, previous.total),
        tip: variation(current.tip, previous.tip),
        start: current.start,
        end: current.end,
      };
    },
    []
  );

  const setDisplay = useCallback(
    (cd: any, pd: any, buttonState: number): void => {
      setDisplaySale(cd);
      setDisplayPreviousSale(pd);
      setDisplayVariation(getVariation(cd, pd));
      const formatStr =
        buttonState === 0 ? ["dd-MMM (EEEE)"] : buttonState === 1 ? ["dd-MMM (EEE)", "dd-MMM (EEE)"] : ["MMMM yyyy"];
      let suffix = "";
      if (buttonState > 1) {
        if (differenceInDays(cd.end, endOfMonth(cd.end)) !== 0) {
          suffix = format(cd.end, "' <i>(till' do')</i'");
          suffix = suffix.replace(/(\d+)(st|nd|rd|th)/, "$1<sup>$2</sup>");
        }
      }
      setDisplaySubDuration(
        format(cd.start, formatStr[0]) + (formatStr[1] ? " to " + format(cd.end, formatStr[1]) : "") + suffix
      );
    },
    [getVariation]
  );

  useEffect(() => {
    setLoading(true);
    // console.log(`Load data called with button index ${activeButtonState}`);
    const dt = new Date();
    let dates = { start: dt, end: dt, prevStart: dt, prevEnd: dt };
    switch (activeButtonState) {
      case 0:
        dates = calculateYesterday;
        setRangeType("day");
        break;
      case 1:
        dates = calculateWeekDates;
        setRangeType("week");
        break;
      case 2:
        dates = calculateMonthDates;
        setRangeType("month");
        break;
    }
    const { start, end, prevStart, prevEnd } = dates;

    const labels: string[] = [];
    if (activeButtonState === 0) {
      for (let i = 0; i < 24; i++) {
        labels.push(`${i % 12 || 12} ${i < 12 ? "AM" : "PM"}`);
      }
    } else {
      let startDate = start;
      let endPlusOne = addDays(end, 1);
      while (isBefore(startDate, endPlusOne)) {
        const fmt = activeButtonState > 1 ? "dd-MMM" : "EEEE";
        labels.push(format(startDate, fmt));
        startDate = addDays(startDate, 1);
      }
    }

    const getCategoryReport = async (start: Date, end: Date) => {
      const apiURL = `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(start)}&end_date=${formatDate(
        end
      )}&report_type=service_by_category&app_type=web&range_type=${rangeType}`;
      const reportData = await callAPIPromise(apiURL);

      const categoryAPIURL = `${API_BASE_URL}/subcategory`;
      const categoryData = await callAPIPromise(categoryAPIURL);

      const categoryReport = reportData.data.map((v: any) => {
        const category = categoryData.data.find((c: any) => c.subcategory === v.subcategory);
        return {
          ...v,
          category: category?.sac_code || "Unknown",
        };
      });

      const hairTotal = categoryReport
        .filter((v: any) => v.category === 2)
        .reduce((acc: number, v: any) => acc + Number.parseFloat(v.total || "0"), 0);
      const beautyTotal = categoryReport
        .filter((v: any) => v.category === 1)
        .reduce((acc: number, v: any) => acc + Number.parseFloat(v.total || "0"), 0);
      const bothTotal = categoryReport
        .filter((v: any) => v.category === 3)
        .reduce((acc: number, v: any) => acc + Number.parseFloat(v.total || "0"), 0);

      setCategoryTotals([
        { title: "Hair", value: currencyFormatter.format(hairTotal), subTitle: "for " + rangeType, span: "6" },
        { title: "Beauty", value: currencyFormatter.format(beautyTotal), subTitle: "for " + rangeType, span: "6" },
        { title: "Both", value: currencyFormatter.format(bothTotal), subTitle: "for " + rangeType, span: "12" },
      ]);
    };
    // console.log(labels);

    getReportForDateRange(start, end, (currentData) => {
      getReportForDateRange(prevStart, prevEnd, (previousData) => {
        getStatsReport(
          new Date(currentData.start),
          new Date(currentData.end),
          new Date(previousData.start),
          new Date(previousData.end)
        );
        getCategoryReport(start, end);
        setDisplay(currentData, previousData, activeButtonState);
        // const apiURL =
        //   activeButtonState === 0
        //     ? `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(
        //         start
        //       )}&report_type=hour_of_day_by_all&app_type=web&range_type=day`
        //     : `${API_BASE_URL}/vendor/report/trend?type=${chartType}&report_type=by_all&start=${formatDate(
        //         start
        //       )}&end=${formatDate(end)}&app_type=web`;
        // callAPI(apiURL, (data: any) => {
        //   const values: number[] = labels.map((v: string) => {
        //     let found = null;
        //     if (activeButtonState === 0) {
        //       found = data.data.find(
        //         (d: any) => `${Number.parseInt(d.hour) % 12 || 12} ${Number.parseInt(d.hour) < 12 ? "AM" : "PM"}` === v
        //       );
        //     } else if (activeButtonState === 1) {
        //       found = data.data.find((d: any) => format(parse(d.range, "yyyy-MM-dd", new Date()), "EEEE") === v);
        //     } else {
        //       found = data.data.find((d: any) => format(parse(d.range, "yyyy-MM-dd", new Date()), "dd-MMM") === v);
        //     }
        //     return Number((found && found["total amount"]) || found?.total || "0");
        //   });
        // });
        setLoading(false);
      });
    });
  }, [
    activeButtonState,
    reload,
    calculateFinMonthDates,
    calculateMonthDates,
    calculateWeekDates,
    calculateYesterday,
    getReportForDateRange,
    getStatsReport,
    setDisplay,
    callAPIPromise,
    rangeType,
  ]);

  const refresh = () => {
    setReload(!reload);
  };

  // Remove finance month and calendar month from button sequence
  const buttonSequence = ["day", "week", "month"];
  const setDuration = (duration: string) => {
    const idx = buttonSequence.indexOf(duration);
    if (idx !== -1) setActiveButtonState(idx);
  };

  const variation = (current: number, previous: number) => {
    return Math.round(((current - previous) / (previous === 0 ? 100 : previous)) * 100);
  };

  const previous = () => {
    switch (activeButtonState) {
      case 0:
        setToday(addDays(today, -1));
        break;
      case 1:
        setWeekStart(addDays(weekStart, -7));
        break;
      case 2:
        setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1));
        break;
      default:
        break;
    }
    setReload(!reload);
  };

  const next = () => {
    switch (activeButtonState) {
      case 0:
        setToday(addDays(today, 1));
        break;
      case 1:
        setWeekStart(addDays(weekStart, 7));
        break;
      case 2:
        setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1));
        break;
      default:
        break;
    }
    setReload(!reload);
  };

  const current = () => {
    switch (activeButtonState) {
      case 0:
        setToday(new Date());
        break;
      case 1:
        setWeekStart(getFirstDayOfWeek(new Date()));
        break;
      case 2:
        setMonthStart(new Date(today.getFullYear(), today.getMonth(), 1));
        break;
      default:
        break;
    }
    setReload(!reload);
  };

  // Hide Finance Month and rename Calendar Month to Month
  const buttons = [
    { title: "Today", onClick: () => setDuration("day") },
    { title: "Week", onClick: () => setDuration("week") },
    { title: "Month", onClick: () => setDuration("month") },
  ];

  const pnl = [
    {
      title: "Earning",
      value: currencyFormatter.format(reportData.total_stat[0].time_one_collection),
      previous: currencyFormatter.format(reportData.total_stat[0].time_two_collection),
      subTitle: "last",
    },
    {
      title: "Expense",
      value: currencyFormatter.format(reportData.total_stat[0].time_one_expense - cashExpenses),
      previous: currencyFormatter.format(reportData.total_stat[0].time_two_expense - prevCashExpenses),
      subTitle: "last",
    },
    {
      title: "P&L",
      value: currencyFormatter.format(
        reportData.total_stat[0].time_one_collection - reportData.total_stat[0].time_one_expense + cashExpenses
      ),
      previous: currencyFormatter.format(
        reportData.total_stat[0].time_two_collection - reportData.total_stat[0].time_two_expense + prevCashExpenses
      ),
      subTitle: "last",
    },
  ];

  const customers = [
    {
      title: "Customers",
      value: reportData.total_stat_bill[0].time_one_count,
      previous: reportData.total_stat_bill[0].time_two_count,
      subTitle: "previous",
    },
    {
      title: "Members",
      value: reportData.membership_detail[0].count_membership,
      previous: reportData.membership_detail[0].count_active_membership,
      subTitle: "active",
    },
    {
      title: "Ticket Size",
      value: currencyFormatter.format(reportData.total_stat_bill[0].time_one_avg),
      previous: currencyFormatter.format(reportData.total_stat_bill[0].time_two_avg),
      subTitle: "previous",
    },
  ];

  const revenue = [
    {
      title1: "Revenue from",
      value1: currencyFormatter.format(reportData.new_cust_time_one.new_customer_rev),
      title2: "New Customers",
      value2: reportData.new_cust_time_one.new_customer,
    },
    {
      title1: "Revenue from",
      value1: currencyFormatter.format(reportData.new_cust_time_one.existing_customer_rev),
      title2: "Exising Customers",
      value2: reportData.new_cust_time_one.existing_customer,
    },
  ];

  useEffect(() => {}, [activeButtonState, reload]);

  const handleClose = () => {
    setTempPopup(false);
  };

  return (
    <Row>
      <Col xs={12}>
        <DiwaCard
          varient={displaySale.total > displayPreviousSale.total ? "success" : "danger"}
          loadingTracker={loading}
        >
          <DiwaButtonGroup buttons={buttons} state={buttonState} />
          <TitleWithRefresh
            title={`Sale for ${displaySubDuration}`}
            varient={displaySale.total > displayPreviousSale.total ? "success" : "danger"}
            onRefresh={refresh}
          />
          <SaleRow
            title="Sale"
            current={displaySale.total}
            previous={displayPreviousSale.total}
            variation={displayVariation.total}
            primary={true}
          />
          <SaleRow
            title="Without Discount"
            current={displaySale.price}
            previous={displayPreviousSale.price}
            variation={displayVariation.price}
            primary={false}
          />
          <SaleRow
            title="Total Discount"
            current={displaySale.discount}
            previous={displayPreviousSale.discount}
            variation={displayVariation.discount}
            primary={false}
          />
          <SaleRow
            title="Tip (Part of total)"
            current={displaySale.tip}
            previous={displayPreviousSale.tip}
            variation={displayVariation.tip}
            primary={false}
          />
          <p></p>
          <DiwaPaginationButton previous={previous} current={current} next={next} />

          {/* <Bar data={rawData} options={chartOptions} style={{ borderWidth: 1, borderColor: "black" }} /> */}
        </DiwaCard>
      </Col>

      <Col xs={12}>
        <DiwaCard
          varient={
            reportData.total_stat[0].time_one_collection - reportData.total_stat[0].time_one_expense > 0
              ? "success"
              : "danger"
          }
          loadingTracker={statsLoading}
        >
          <DataPoint data={pnl} />
        </DiwaCard>
        <DiwaCard varient="primary" loadingTracker={statsLoading}>
          <DataPoint data={customers} />
        </DiwaCard>
        <DiwaCard varient="primary" loadingTracker={statsLoading}>
          <MultiRowDataPoint data={revenue} />
        </DiwaCard>
      </Col>

      <Col xs={12}>
        <DiwaCard varient="primary" loadingTracker={statsLoading}>
          <DataPoint data={categoryTotals} />
        </DiwaCard>
      </Col>
    </Row>
  );
}
