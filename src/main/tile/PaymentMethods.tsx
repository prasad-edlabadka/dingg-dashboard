import { useCallback, useContext, useEffect, useState } from "react";
import { Col, OverlayTrigger, ProgressBar, Row, Tooltip, Offcanvas } from "react-bootstrap";
import { currencyFormatter, formatDate, getLastMonth, titleCase } from "./Utility";
import { format, addDays } from "date-fns";
import { TokenContext, API_BASE_URL } from "../../App";
import DiwaButtonGroup from "../../components/button/DiwaButtonGroup";
import DiwaCard from "../../components/card/DiwaCard";
import DiwaRefreshButton from "../../components/button/DiwaRefreshButton";
import _ from "lodash";
import moment from "moment";

export default function PaymentMethods() {
  const { callAPI, callAPIPromise } = useContext(TokenContext);
  const [reportData, setReportData] = useState([{ total: 0, "payment mode": "" }]);
  const [total, setTotal] = useState(-1);
  const [dayReportData, setDayReportData] = useState([{ total: 0, "payment mode": "", count: 0, tip: 0 }]);
  const [dayTotal, setDayTotal] = useState(-1);
  const buttonState = useState(0);
  const todayButtonState = useState(0);
  const [, setActiveButtonIndex] = buttonState;
  const [, setTodaysButtonIndex] = todayButtonState;
  const [endDate, setEndDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [showMonth, setShowMonth] = useState(false);
  const [paymentTypes, setPaymentTypes] = useState([{ name: "", value: 0 }]);
  const [todaysBills, setTodaysBills] = useState([
    { user: { fname: "", lname: "" }, bill_payments: [{ payment_mode: 0, amount: 0 }] },
  ]);
  const [singleDate, setSingleDate] = useState(new Date());
  const [monthDetails, setMonthDetails] = useState([
    { rangeStart: "", rangeEnd: "", lastDate: "", key: "", date: "", sum: 0 },
  ]);

  const calculateToday = useCallback((data: string | any[]) => {
    const len = data.length;
    let sum = 0;
    for (let i = 0; i < len; i++) {
      sum += data[i].total;
    }
    return sum;
  }, []);

  useEffect(() => {
    setLoading(true);
    const doIt = async () => {
      const paymentTypeAPIURL = `${API_BASE_URL}/payment_mode`;
      const _paymentTypes = (await callAPIPromise(paymentTypeAPIURL)).data;
      setPaymentTypes(_paymentTypes);

      const todaysBillsURL = `${API_BASE_URL}/vendor/bills/?web=true&page=1&limit=1000&start=${formatDate(
        singleDate
      )}&end=${formatDate(singleDate)}&term=&is_product_only=`;
      const todaysBills = (await callAPIPromise(todaysBillsURL)).data;
      setTodaysBills(todaysBills);

      const apiURL = `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(
        startDate
      )}&report_type=by_payment_mode&end_date=${formatDate(endDate)}&app_type=web`;
      const paymentSummary = (await callAPIPromise(apiURL)).data.sort((a: any, b: any) => {
        return b.total - a.total;
      });
      setReportData(paymentSummary);
      setTotal(calculateToday(paymentSummary));
      const dayApiURL = `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(
        singleDate
      )}&report_type=by_payment_mode&end_date=${formatDate(singleDate)}&app_type=web`;
      const dayData = (await callAPIPromise(dayApiURL)).data.sort((a: any, b: any) => {
        return b.total - a.total;
      });
      setDayReportData(dayData);
      setDayTotal(calculateToday(dayData));

      const monthBillURL = `${API_BASE_URL}/vendor/bills/?web=true&page=1&limit=1000&start=${formatDate(
        startDate
      )}&end=${formatDate(endDate)}&term=&is_product_only=`;
      const monthBills = (await callAPIPromise(monthBillURL))?.data;
      const d: { key: string; date: string; sum: any }[] = [];
      const extractedData = monthBills
        .filter((v: any) => v.cancel_reason === null)
        .flatMap((v: { bill_payments: any[] }) => v.bill_payments)
        .filter((v: { is_tip: boolean }) => !v.is_tip);
      const grouped = _.groupBy(_.sortBy(extractedData, ["payment_date"]), (v) => v.payment_mode);

      for (let key in grouped) {
        const groupedByDate = _.groupBy(grouped[key], (v) => v.payment_date);
        for (let date in groupedByDate) {
          const sum = groupedByDate[date].reduce((a: number, b: { amount: number }) => a + b.amount, 0);
          d.push({ key: getPaymentModeName(_paymentTypes, Number.parseInt(key)) || "", date, sum });
        }
      }
      const gd = d.reduce(
        (
          groupedArray: {
            rangeStart: string;
            rangeEnd: string;
            key: string;
            date: string;
            sum: number;
            lastDate: string;
          }[],
          currentValue: { key: string; date: string; sum: number }
        ) => {
          const group =
            groupedArray.length > 0
              ? groupedArray[groupedArray.length - 1]
              : {
                  ...currentValue,
                  rangeStart: currentValue.date,
                  rangeEnd: currentValue.date,
                  lastDate: currentValue.date,
                };
          if (
            groupedArray.length === 0 ||
            moment(currentValue.date).diff(moment(group.lastDate), "days") > 1 ||
            group.key !== currentValue.key
          ) {
            groupedArray.push({
              rangeStart: currentValue.date,
              rangeEnd: currentValue.date,
              lastDate: currentValue.date,
              key: currentValue.key,
              date: currentValue.date,
              sum: currentValue.sum,
            });
          } else {
            group.sum += currentValue.sum;
            group.rangeEnd = currentValue.date;
            group.lastDate = currentValue.date;
          }
          return groupedArray;
        },
        []
      );
      setMonthDetails(gd);
      setLoading(false);
    };
    doIt();
  }, [startDate, endDate, singleDate, callAPIPromise, callAPI, calculateToday]);

  const refresh = () => {
    const dt = new Date();
    setEndDate(dt);
    setStartDate(new Date(dt.getFullYear(), dt.getMonth(), 1));
    setSingleDate(dt);
    setActiveButtonIndex(0);
    setTodaysButtonIndex(0);
  };

  const methods: { [key: string]: string } = {
    marideal: "Payal's QR",
    defideal: "Mrunalini's QR",
    "deal.mu": "Renuka's QR",
  };
  const getPaymentMethodName = (n: string): string => {
    return methods[n.toLowerCase()] || titleCase(n);
  };

  const setDuration = (type: string) => {
    if (type === "current") {
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
  };

  const setSingleDateDuration = (type: number) => {
    setSingleDate(addDays(new Date(), type));
    //type === "today" ? setSingleDate(new Date()) : setSingleDate(subDays(new Date(), 1));
  };

  const buttons = [
    { title: new Date().toLocaleDateString("en-GB", { month: "long" }), onClick: () => setDuration("current") },
    { title: getLastMonth().toLocaleDateString("en-GB", { month: "long" }), onClick: () => setDuration("previous") },
  ];

  const todayButtons = [
    { title: "Today", onClick: () => setSingleDateDuration(0) },
    { title: "Yesterday", onClick: () => setSingleDateDuration(-1) },
    { title: format(addDays(new Date(), -2), "EEEE"), onClick: () => setSingleDateDuration(-2) },
  ];

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleMonthClose = () => setShowMonth(false);
  const handleMonthShow = () => setShowMonth(true);

  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [bills, setBills] = useState([{ name: "", amount: 0 }]);

  const getPaymentModeId = (name: string) => {
    return paymentTypes.find((v: { name: string }) => v.name.toLowerCase() === name.toLowerCase())?.value;
  };

  const getPaymentModeName = (types: any[], id: number) => {
    return types.find((v: { value: number }) => v.value === id)?.name;
  };

  const openDetails = (mode: string) => {
    setSelectedPaymentMode(mode);
    const id = getPaymentModeId(mode);
    console.log(todaysBills);
    const bills = todaysBills.filter((v: { bill_payments: { payment_mode: number }[] }) =>
      v.bill_payments.find((v2: { payment_mode: number }) => v2.payment_mode === id)
    );
    const displayBills = bills.map(
      (v: { user: { fname: string; lname: string }; bill_payments: { payment_mode: number; amount: number }[] }) => {
        console.log(v);
        return {
          name: (v.user.fname || "") + " " + (v.user.lname || ""),
          amount: v.bill_payments.reduce((a: number, b: { payment_mode: number; amount: number }) => {
            return b.payment_mode === id ? a + b.amount : a;
          }, 0),
        };
      }
    );
    setBills(displayBills);
    handleShow();
  };

  const openMonth = (mode: string) => {
    setSelectedPaymentMode(mode);
    handleMonthShow();
    console.log(mode, monthDetails);
    // console.log(mode, monthDetails.filter(v => v.key.toLowerCase() === selectedPaymentMode.toLowerCase()));
  };

  return (
    <DiwaCard varient="purple" loadingTracker={loading}>
      <DiwaButtonGroup buttons={buttons} state={buttonState} />
      <div className="position-relative text-color">
        <h2>Payments for {startDate.toLocaleDateString("en-GB", { month: "long" })}</h2>
        <DiwaRefreshButton refresh={() => refresh()} />
      </div>
      <Offcanvas
        show={show}
        className="h-auto text-color"
        placement="bottom"
        backdrop={true}
        scroll={false}
        keyboard={false}
        id="offcanvasBottom"
        onHide={handleClose}
      >
        <Offcanvas.Header closeButton closeVariant="close">
          <h5>{getPaymentMethodName(selectedPaymentMode)} transactions</h5>
        </Offcanvas.Header>
        <Offcanvas.Body className="pt-0">
          <ul className="list-group list-group-flush">
            {bills.map((val, index) => {
              return (
                <li className="list-group-item bg-transparent text-color border-color ps-0" key={val + "item" + index}>
                  <div className="w-100 pe-2 pb-2">
                    <div className="text-start d-inline">{val.name}</div>
                    <div className="text-end d-inline float-end">{currencyFormatter.format(val.amount)}</div>
                  </div>
                </li>
              );
            })}
            <li className="list-group-item bg-transparent text-color border-color ps-0" key="total">
              <div className="w-100 pe-2 pb-2 fw-bold">
                <div className="text-start d-inline">Total</div>
                <div className="text-end d-inline float-end">
                  {currencyFormatter.format(bills.reduce((a: number, b: { amount: number }) => a + b.amount, 0))}
                </div>
              </div>
            </li>
          </ul>
        </Offcanvas.Body>
      </Offcanvas>
      <Offcanvas
        show={showMonth}
        className="h-auto text-color"
        placement="bottom"
        backdrop={true}
        scroll={false}
        keyboard={false}
        id="offcanvasBottom2"
        onHide={handleMonthClose}
      >
        <Offcanvas.Header closeButton closeVariant="close">
          <h5>{getPaymentMethodName(selectedPaymentMode)} Totals</h5>
        </Offcanvas.Header>
        <Offcanvas.Body className="pt-0">
          <ul className="list-group list-group-flush">
            {monthDetails
              .filter((v) => v.key.toLowerCase() === selectedPaymentMode.toLowerCase())
              .map((val, index) => {
                return (
                  <li
                    className="list-group-item bg-transparent text-color border-color ps-0"
                    key={val + "item2" + index}
                  >
                    <div className="w-100 pe-2 pb-2">
                      <div className="text-start d-inline">
                        {format(val.rangeStart || new Date(), "dd-MMM")} to{" "}
                        {format(val.rangeEnd || new Date(), "dd-MMM")}
                      </div>
                      <div className="text-end d-inline float-end">{currencyFormatter.format(val.sum)}</div>
                    </div>
                  </li>
                );
              })}
            <li className="list-group-item bg-transparent text-color border-color ps-0" key="total">
              <div className="w-100 pe-2 pb-2">
                <div className="text-start d-inline fw-bold">Total</div>
                <div className="text-end d-inline float-end fw-bold">
                  {currencyFormatter.format(
                    monthDetails
                      ?.filter((v) => v.key.toLowerCase() === selectedPaymentMode.toLowerCase())
                      ?.reduce((a, b) => a + b.sum, 0) || 0
                  )}
                </div>
              </div>
            </li>
          </ul>
        </Offcanvas.Body>
      </Offcanvas>
      {reportData.length === 0 ? (
        <div className="text-color rounded translucent-bg px-2 py-1">
          <span>No payments this month</span>
        </div>
      ) : (
        reportData.map((val, index) => {
          const targetPercentage = Math.round((val.total * 100) / total);
          return (
            <Row className="text-color" key={"paymentmethod" + index} onClick={() => openMonth(val["payment mode"])}>
              <Col lg={4} xs={5}>
                {getPaymentMethodName(val["payment mode"])}
              </Col>
              <Col xs={7} className="d-lg-none text-end align-bottom text-color">
                {currencyFormatter.format(val.total)} ({targetPercentage}%)
              </Col>
              <Col lg={4} className="mt-2">
                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{targetPercentage}% Achieved</Tooltip>}>
                  <ProgressBar now={targetPercentage} style={{ height: 6, marginBottom: 12 }} variant="danger" />
                </OverlayTrigger>
              </Col>
              <Col lg={4} className="d-none d-lg-block">
                {currencyFormatter.format(val.total)}
              </Col>
            </Row>
          );
        })
      )}
      <div className="mt-2">&nbsp;</div>
      <DiwaButtonGroup buttons={todayButtons} state={todayButtonState} />
      <div className="position-relative mt-4 text-color">
        <h2>Payments for Today</h2>
      </div>
      {dayReportData.length === 0 ? (
        <div className="text-color rounded translucent-bg px-2 py-1">
          <span>No payments today</span>
        </div>
      ) : (
        dayReportData.map((val, index) => {
          const targetPercentage = Math.round((val.total * 100) / dayTotal);
          return (
            <Row
              className="text-color"
              key={"paymentmethodtoday" + index}
              onClick={() => openDetails(val["payment mode"])}
            >
              <Col lg={4} xs={5}>
                {getPaymentMethodName(val["payment mode"])}
              </Col>
              <Col xs={7} className="d-lg-none text-end align-bottom">
                {currencyFormatter.format(val.total)}{" "}
                <span className="small text-color-50">({val.count} payments)</span>
              </Col>
              <Col lg={4} className="mt-2">
                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{targetPercentage}% Achieved</Tooltip>}>
                  <ProgressBar now={targetPercentage} style={{ height: 6, marginBottom: 12 }} variant="danger" />
                </OverlayTrigger>
              </Col>
              <Col lg={4} className="d-none d-lg-block">
                {currencyFormatter.format(val.total + val.tip)}
              </Col>
            </Row>
          );
        })
      )}
    </DiwaCard>
  );
}
