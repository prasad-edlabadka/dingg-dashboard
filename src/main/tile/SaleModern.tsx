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
  endOfWeek,
  subWeeks,
  endOfISOWeek,
} from "date-fns";
import { TokenContext, API_BASE_URL } from "../../App";
import DiwaCard from "../../components/card/DiwaCard";
import { Col, Row } from "react-bootstrap";
import DiwaPaginationButton from "../../components/button/DiwaPaginationButton";
import "../login-modern.css"; // reuse tokens, background, glass, switches, etc.
import DiwaButtonGroup from "../../components/button/DiwaButtonGroup";
import DiwaRefreshButton from "../../components/button/DiwaRefreshButton";

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

const INITIAL_DATA: DataStructure = {
  price: -1,
  discount: -1,
  tax: -1,
  woTax: -1,
  total: -1,
  tip: -1,
  start: "Loading...",
  end: "Loading...",
};

const INITIAL_REPORT_DATA = {
  total_stat_bill: [{ time_one_count: 0, time_two_count: 0, time_one_avg: 0, time_two_avg: 0 }],
  total_stat: [{ time_one_expense: 0, time_two_expense: 0, time_one_collection: 0, time_two_collection: 0 }],
  membership_detail: [{ count_active_membership: 0, count_membership: 0 }],
  new_cust_time_one: { new_customer: 0, new_customer_rev: 0, existing_customer: 0, existing_customer_rev: 0 },
  new_cust_time_two: { new_customer: 0, new_customer_rev: 0, existing_customer: 0, existing_customer_rev: 0 },
};

export default function SaleModern() {
  const { callAPI, callAPIPromise } = useContext(TokenContext);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [displaySale, setDisplaySale] = useState<DataStructure>(INITIAL_DATA);
  const [displayPreviousSale, setDisplayPreviousSale] = useState<DataStructure>(INITIAL_DATA);
  const [displaySubDuration, setDisplaySubDuration] = useState(new Date().toLocaleDateString());

  const [today, setToday] = useState(new Date());
  const [weekStart, setWeekStart] = useState(getFirstDayOfWeek(today));
  const [monthStart, setMonthStart] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const [cashExpenses, setCashExpenses] = useState(0);
  const [prevCashExpenses, setPrevCashExpenses] = useState(0);
  const [reportData, setReportData] = useState(INITIAL_REPORT_DATA);

  const buttonState = useState(0);
  const [activeButtonState, setActiveButtonState] = buttonState;
  const [rangeType, setRangeType] = useState("day");
  const [categoryTotals, setCategoryTotals] = useState<DataPointStructure[]>([]);

  const calculateYesterday = useMemo(() => {
    const yesterday = subDays(today, 1);
    return { start: today, end: today, prevStart: yesterday, prevEnd: yesterday };
  }, [today]);

  const calculateWeekDates = useMemo(() => {
    const startOfTheWeek = weekStart;
    let endOfTheWeek = endOfWeek(startOfTheWeek);
    const eod = endOfDay(new Date());
    endOfTheWeek = isAfter(endOfTheWeek, eod) ? eod : endOfTheWeek;
    const startOfPrevWeek = subWeeks(startOfTheWeek, 1);
    const endOfPrevWeek = endOfISOWeek(startOfPrevWeek);
    return { start: startOfTheWeek, end: endOfTheWeek, prevStart: startOfPrevWeek, prevEnd: endOfPrevWeek };
  }, [weekStart]);

  const calculateMonthDates = useMemo(() => {
    const startOfTheMonth = monthStart;
    let endOfTheMonth = endOfMonth(monthStart);
    const eod = endOfDay(new Date());
    endOfTheMonth = isAfter(endOfTheMonth, eod) ? eod : endOfTheMonth;
    const startOfPrevMonth = startOfMonth(subMonths(startOfTheMonth, 1));
    const endOfPrevMonth = endOfMonth(startOfPrevMonth);
    return { start: startOfTheMonth, end: endOfTheMonth, prevStart: startOfPrevMonth, prevEnd: endOfPrevMonth };
  }, [monthStart]);

  // const calculateFinMonthDates = useMemo(() => {
  //   const startOfFinMonth = finMonthStart;
  //   const endOfFinMonth = isAfter(subDays(addMonths(finMonthStart, 1), 1), endOfDay(new Date()))
  //     ? endOfDay(new Date())
  //     : subDays(addMonths(finMonthStart, 1), 1);
  //   const startOfPrevFinMonth = subMonths(finMonthStart, 1);
  //   const endOfPrevFinMonth = subDays(addMonths(startOfPrevFinMonth, 1), 1);
  //   return { start: startOfFinMonth, end: endOfFinMonth, prevStart: startOfPrevFinMonth, prevEnd: endOfPrevFinMonth };
  // }, [finMonthStart]);

  const getStatsReport = useCallback(
    (start: Date, end: Date, prevStart: Date, prevEnd: Date) => {
      const apiURL = `${API_BASE_URL}/vendor/report/consolidated?time_one_start=${formatDate(
        start
      )}&time_one_end=${formatDate(end)}&time_two_start=${formatDate(prevStart)}&time_two_end=${formatDate(prevEnd)}`;
      callAPI(apiURL, (data: any) => {
        if (!data) return;
        setReportData(data.data.length === 0 ? [] : data.data);
      });
      const cashAPIURL = `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(
        start
      )}&report_type=by_expense_type&end_date=${formatDate(end)}&locations=null&app_type=web`;
      callAPI(cashAPIURL, (data: any) => {
        if (!data) return;
        setCashExpenses(data.data.find((d: any) => d["expense type"] === "Cash transfer to hub")?.total || 0);
      });

      const prevCashAPIURL = `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(
        prevStart
      )}&report_type=by_expense_type&end_date=${formatDate(prevEnd)}&locations=null&app_type=web`;
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
            return acc;
          },
          { price: 0, discount: 0, tax: 0, woTax: 0, total: 0, tip: 0, start: start.toString(), end: end.toString() }
        );
        cb(values);
      });
    },
    [callAPI]
  );

  const getFormatString = useCallback((buttonState: number): [string, string?] => {
    switch (buttonState) {
      case 0:
        return ["dd-MMM (EEEE)"];
      case 1:
        return ["dd-MMM (EEE)", "dd-MMM (EEE)"];
      default:
        return ["MMMM yyyy"];
    }
  }, []);

  const getSuffix = useCallback((date: Date): string => {
    if (differenceInDays(date, endOfMonth(date)) === 0) return "";
    const suffixText = format(date, "' <i>(till' do')</i'");
    return suffixText.replace(/(\d+)(st|nd|rd|th)/, "$1<sup>$2</sup>");
  }, []);

  const setDisplay = useCallback(
    (cd: DataStructure, pd: DataStructure, buttonState: number): void => {
      setDisplaySale(cd);
      setDisplayPreviousSale(pd);

      const formatStr = getFormatString(buttonState);
      const suffix = buttonState > 1 ? getSuffix(new Date(cd.end)) : "";

      const displayText =
        format(new Date(cd.start), formatStr[0]) +
        (formatStr[1] ? " to " + format(new Date(cd.end), formatStr[1]) : "") +
        suffix;

      setDisplaySubDuration(displayText);
    },
    [getFormatString, getSuffix]
  );

  interface CategoryData {
    subcategory: string;
    sac_code: number;
    total: string;
    category?: number;
  }

  const generateTimeLabels = useCallback((activeButtonState: number, start: Date, end: Date): string[] => {
    if (activeButtonState === 0) {
      return Array.from({ length: 24 }, (_, i) => `${i % 12 || 12} ${i < 12 ? "AM" : "PM"}`);
    }

    const labels: string[] = [];
    let currentDate = start;
    const endPlusOne = addDays(end, 1);
    const fmt = activeButtonState > 1 ? "dd-MMM" : "EEEE";

    while (isBefore(currentDate, endPlusOne)) {
      labels.push(format(currentDate, fmt));
      currentDate = addDays(currentDate, 1);
    }

    return labels;
  }, []);

  const getCategoryReport = useCallback(
    async (start: Date, end: Date, rangeType: string) => {
      try {
        const [reportData, categoryData] = await Promise.all([
          callAPIPromise(
            `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(start)}&end_date=${formatDate(
              end
            )}&report_type=service_by_category&app_type=web&range_type=${rangeType}`
          ),
          callAPIPromise(`${API_BASE_URL}/subcategory`),
        ]);

        const categoryReport = reportData.data.map((v: CategoryData) => ({
          ...v,
          category: categoryData.data.find((c: CategoryData) => c.subcategory === v.subcategory)?.sac_code || 0,
        }));

        const totals = [1, 2, 3].map((category) =>
          categoryReport
            .filter((v: CategoryData) => v.category === category)
            .reduce((acc: number, v: CategoryData) => acc + Number.parseFloat(v.total || "0"), 0)
        );

        const [beautyTotal, hairTotal, bothTotal] = totals;

        setCategoryTotals([
          { title: "Hair", value: currencyFormatter.format(hairTotal), subTitle: "for " + rangeType, span: "6" },
          { title: "Beauty", value: currencyFormatter.format(beautyTotal), subTitle: "for " + rangeType, span: "6" },
          { title: "Both", value: currencyFormatter.format(bothTotal), subTitle: "for " + rangeType, span: "12" },
        ]);
      } catch (error) {
        console.error("Error fetching category data:", error);
        setCategoryTotals([]);
      }
    },
    [callAPIPromise]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const dates = (() => {
          switch (activeButtonState) {
            case 0:
              setRangeType("day");
              return calculateYesterday;
            case 1:
              setRangeType("week");
              return calculateWeekDates;
            case 2:
              setRangeType("month");
              return calculateMonthDates;
            default:
              return { start: new Date(), end: new Date(), prevStart: new Date(), prevEnd: new Date() };
          }
        })();

        const { start, end, prevStart, prevEnd } = dates;

        // Generate labels in parallel with data fetching
        generateTimeLabels(activeButtonState, start, end);

        // Create a promise for the first range
        const currentDataPromise = new Promise<DataStructure>((resolve) => {
          getReportForDateRange(start, end, resolve);
        });

        // Create a promise for the previous range
        const previousDataPromise = new Promise<DataStructure>((resolve) => {
          getReportForDateRange(prevStart, prevEnd, resolve);
        });

        // Wait for both ranges to complete
        const [currentData, previousData] = await Promise.all([currentDataPromise, previousDataPromise]);

        // Execute remaining operations in parallel
        await Promise.all([
          getStatsReport(
            new Date(currentData.start),
            new Date(currentData.end),
            new Date(previousData.start),
            new Date(previousData.end)
          ),
          getCategoryReport(start, end, rangeType),
        ]);

        setDisplay(currentData, previousData, activeButtonState);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    activeButtonState,
    reload,
    calculateMonthDates,
    calculateWeekDates,
    calculateYesterday,
    getReportForDateRange,
    getStatsReport,
    getCategoryReport,
    setDisplay,
    generateTimeLabels,
    rangeType,
  ]);

  const refresh = () => setReload(!reload);

  const buttonSequence = ["day", "week", "month"];
  const setDuration = (duration: string) => {
    const idx = buttonSequence.indexOf(duration);
    if (idx !== -1) setActiveButtonState(idx);
  };

  const variation = useCallback((current: number, previous: number) => {
    return Math.round(((current - previous) / (previous === 0 ? 100 : previous)) * 100);
  }, []);

  type NavigationAction = "previous" | "next" | "current";

  const calculateNewDate = useCallback((action: NavigationAction, state: number, currentDate: Date): Date => {
    switch (state) {
      case 0: // Day
        if (action === "current") return new Date();
        return addDays(currentDate, action === "previous" ? -1 : 1);
      case 1: // Week
        if (action === "current") return getFirstDayOfWeek(new Date());
        return action === "previous" ? subWeeks(currentDate, 1) : addDays(currentDate, 7);
      case 2: // Month
        if (action === "current") return startOfMonth(new Date());
        return startOfMonth(action === "previous" ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
      default:
        return currentDate;
    }
  }, []);

  const handleNavigation = useCallback(
    (action: NavigationAction) => {
      switch (activeButtonState) {
        case 0:
          setToday((prev) => calculateNewDate(action, activeButtonState, prev));
          break;
        case 1:
          setWeekStart((prev) => calculateNewDate(action, activeButtonState, prev));
          break;
        case 2:
          setMonthStart((prev) => calculateNewDate(action, activeButtonState, prev));
          break;
      }
      setReload((prev) => !prev);
    },
    [activeButtonState, calculateNewDate]
  );

  const previous = useCallback(() => handleNavigation("previous"), [handleNavigation]);
  const next = useCallback(() => handleNavigation("next"), [handleNavigation]);
  const current = useCallback(() => handleNavigation("current"), [handleNavigation]);

  const buttons = [
    { title: "Today", onClick: () => setDuration("day") },
    { title: "Week", onClick: () => setDuration("week") },
    { title: "Month", onClick: () => setDuration("month") },
  ];

  const fmt = useMemo(() => currencyFormatter.format, []);

  const pct = useCallback(
    (cur: number, prev: number) => {
      const v = variation(cur, prev);
      const sign = v > 0 ? "+" : v < 0 ? "−" : "";
      return `${sign}${Math.abs(v)}%`;
    },
    [variation]
  );

  const cls = useCallback(
    (cur: number, prev: number) => (variation(cur, prev) >= 0 ? "positive" : "negative"),
    [variation]
  );

  const kpis = useMemo(
    () => [
      {
        title: "Expenses",
        value: fmt(reportData.total_stat[0].time_one_expense - cashExpenses),
        prevAbs: fmt(reportData.total_stat[0].time_two_expense - prevCashExpenses),
        prevPct: pct(
          reportData.total_stat[0].time_one_expense - cashExpenses,
          reportData.total_stat[0].time_two_expense - prevCashExpenses
        ),
        cls: cls(
          reportData.total_stat[0].time_two_expense - prevCashExpenses,
          reportData.total_stat[0].time_one_expense - cashExpenses
        ),
      },

      {
        title: "P&L",
        value: fmt(
          (reportData.total_stat[0].time_one_collection || 0) -
            (reportData.total_stat[0].time_one_expense || 0) +
            cashExpenses
        ),
        prevAbs: fmt(
          (reportData.total_stat[0].time_two_collection || 0) -
            (reportData.total_stat[0].time_two_expense || 0) +
            prevCashExpenses
        ),
        prevPct: pct(
          (reportData.total_stat[0].time_one_collection || 0) -
            (reportData.total_stat[0].time_one_expense || 0) +
            cashExpenses,
          (reportData.total_stat[0].time_two_collection || 0) -
            (reportData.total_stat[0].time_two_expense || 0) +
            prevCashExpenses
        ),
        cls: cls(
          (reportData.total_stat[0].time_one_collection || 0) -
            (reportData.total_stat[0].time_one_expense || 0) +
            cashExpenses,
          0
        ),
        // separator: true,
      },
      {
        //value: reportData.membership_detail[0].count_membership,
        // previous: reportData.membership_detail[0].count_active_membership,
        title: "Customers",
        value: reportData.total_stat_bill[0].time_one_count,
        prevAbs: reportData.total_stat_bill[0].time_two_count,
        prevPct: pct(
          reportData.total_stat_bill[0].time_one_count || 0,
          reportData.total_stat_bill[0].time_two_count || 0
        ),
        cls: cls(reportData.total_stat_bill[0].time_one_count || 0, reportData.total_stat_bill[0].time_two_count || 0),
      },
      {
        title: "Ticket Size",
        value: fmt(reportData.total_stat_bill[0].time_one_avg || 0),
        prevAbs: fmt(reportData.total_stat_bill[0].time_two_avg || 0),
        prevPct: pct(reportData.total_stat_bill[0].time_one_avg || 0, reportData.total_stat_bill[0].time_two_avg || 0),
        cls: cls(reportData.total_stat_bill[0].time_one_avg || 0, reportData.total_stat_bill[0].time_two_avg || 0),
        separator: true,
      },
      {
        title: "Total Members",
        value: reportData.membership_detail[0].count_membership,
        cls: "",
      },
      {
        title: "Active Members",
        value: reportData.membership_detail[0].count_active_membership,
        cls: "",
      },
      {
        title: `Revenue from ${reportData.new_cust_time_one.new_customer} new customers`,
        value: fmt(reportData.new_cust_time_one.new_customer_rev),
        cls: "",
      },
      {
        title: `Revenue from ${reportData.new_cust_time_one.existing_customer} existing customers`,
        value: fmt(reportData.new_cust_time_one.existing_customer_rev),
        cls: "",
      },
      {
        title: "Hair Services",
        value: categoryTotals.find((v) => v.title === "Hair")?.value,
        cls: "",
      },
      {
        title: "Beauty Services",
        value: categoryTotals.find((v) => v.title === "Beauty")?.value,
        cls: "",
      },
    ],
    [categoryTotals, cashExpenses, fmt, pct, prevCashExpenses, reportData, cls]
  );

  const sales = useMemo(
    () => [
      {
        title: "Earnings",
        value: fmt(reportData.total_stat[0].time_one_collection || 0),
        prevAbs: fmt(reportData.total_stat[0].time_two_collection || 0),
        prevPct: pct(
          reportData.total_stat[0].time_one_collection || 0,
          reportData.total_stat[0].time_two_collection || 0
        ),
        cls: cls(reportData.total_stat[0].time_one_collection || 0, reportData.total_stat[0].time_two_collection || 0),
        titleclass: "big-value",
      },
      {
        title: "Without Discount",
        value: fmt(displaySale.price),
        prevAbs: fmt(displayPreviousSale.price),
        prevPct: pct(displaySale.price, displayPreviousSale.price),
        cls: cls(displaySale.price, displayPreviousSale.price),
      },

      {
        title: "Discount",
        value: fmt(displaySale.discount),
        prevAbs: fmt(displayPreviousSale.discount),
        prevPct: pct(displaySale.discount, displayPreviousSale.discount),
        cls: cls(displaySale.discount, displayPreviousSale.discount),
      },

      {
        title: "Tip",
        value: fmt(displaySale.tip),
        // prevAbs: fmt(displayPreviousSale.tip),
        // prevPct: pct(displaySale.tip, displayPreviousSale.tip),
        cls: cls(displaySale.tip, displayPreviousSale.tip),
        separator: true,
      },
    ],
    [fmt, pct, reportData, cls, displayPreviousSale, displaySale]
  );

  return (
    <div className="sales-wrap">
      {/* KPI dock from existing vars */}
      <DiwaCard varient="primary" className="glass-panel kpi-card" loadingTracker={loading}>
        <div className="noise" aria-hidden />
        <div className="sales-header glass-sticky">
          <div className="panel-head">
            {/* First row: tabs + refresh */}
            <div className="panel-top">
              <DiwaButtonGroup buttons={buttons} state={buttonState} />
              <DiwaRefreshButton refresh={refresh} containerStyle={{ marginTop: 8 }} />
            </div>

            {/* Second row: title + date */}
            <div className="panel-bottom">
              <h2 className="panel-title text-color">
                Sales <span className="panel-sub" dangerouslySetInnerHTML={{ __html: displaySubDuration }} />
              </h2>
            </div>
          </div>
        </div>
        <div className={`kpi mb-3 ${sales[0].cls}`}>
          <ul className="list-group list-group-flush">
            {sales.map((k, idx) => (
              <li key={idx} className="panel-normal list-group-item bg-transparent text-color border-color-25 ps-0">
                <Row className="mx-0">
                  <Col xs={5} className="align-self-top">
                    <span className="sales-title">{k.title}</span>
                  </Col>
                  <Col xs={7} className="text-end align-self-center">
                    <span className={`sales-value ${k.titleclass}`}>{k.value}</span>
                    {k.prevAbs && (
                      <div className="kpi-meta">
                        <span className="kpi-prevabs">Prev {k.prevAbs}</span>
                        <span className={`kpi-prev ${k.cls}`}>{k.prevPct}</span>
                      </div>
                    )}
                  </Col>
                </Row>
              </li>
            ))}
          </ul>
        </div>
        <div className="kpi-grid">
          {kpis.map((k, idx) => (
            <>
              <div className={`kpi ${k.cls}`} key={k.title}>
                <div className="kpi-title">{k.title}</div>
                <div className={`kpi-value`}>{k.value}</div>
                {k.prevAbs && (
                  <div className="kpi-meta">
                    <span className="kpi-prevabs">Prev {k.prevAbs}</span>
                    <span className={`kpi-prev ${k.cls}`}>{k.prevPct}</span>
                  </div>
                )}
              </div>
              {/* Separator after every two rows (4 tiles), except after the last tile */}
              {k.separator && <hr className="kpi-sep" key={`hr-${idx}`} />}
            </>
          ))}
        </div>
        {/* Pagination buttons moved here */}
        <div className="panel-actions" style={{ justifyContent: "flex-start" }}>
          <DiwaPaginationButton previous={previous} current={current} next={next} />
        </div>
      </DiwaCard>
    </div>
  );
}
