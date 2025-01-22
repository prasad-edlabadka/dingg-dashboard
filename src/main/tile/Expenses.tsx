import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Accordion, Button, ButtonGroup, Col, Form, Offcanvas, Row } from "react-bootstrap";
import { currencyFormatter, formatDate, formatDisplayDate, getFirstDayOfWeek } from "./Utility";
import { addDays, addMonths, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import * as Icon from "react-bootstrap-icons";
import { TokenContext } from "../../App";
import DiwaButtonGroup from "../../components/button/DiwaButtonGroup";
import DiwaCard from "../../components/card/DiwaCard";
import DiwaPaginationButton from "../../components/button/DiwaPaginationButton";

interface Expense {
  date: string;
  "expense type": string;
  Net: number;
  Tax: number;
  amount: number;
  "given to": string;
  description: string;
  "Payment mode": string;
  location: string;
  branch: string;
}

export default function Expenses() {
  const { callAPI, callPOSTAPI } = useContext(TokenContext);
  const [expenseData, setExpenseData] = useState<Partial<Record<string, Expense[]>>>({});
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(-1);
  const [show, setShow] = useState(false);
  const buttonState = useState(2);
  const [buttonIndex, setButtonIndex] = buttonState;
  const [activeButtonIndex, setActiveButtonIndex] = useState(0);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(new Date());

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const expenseType = useRef<HTMLSelectElement>(null);
  const expenseDate = useRef<HTMLInputElement>(null);
  const givenTo = useRef<HTMLInputElement>(null);
  const amount = useRef<HTMLInputElement>(null);
  const description = useRef<HTMLTextAreaElement>(null);
  const expenseAccount = useRef<HTMLSelectElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [clicked, setClicked] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);

  const expensesToIgnore = useMemo(() => ["Cash transfer to hub"], []);
  const API_BASE_URL = "https://api.dingg.app/api/v1";

  const createExpense = (e: any) => {
    e.preventDefault();
    if (clicked) return;
    setClicked(true);
    if (
      expenseType.current?.value === "" ||
      expenseDate.current?.value === "" ||
      givenTo.current?.value === "" ||
      amount.current?.value === "" ||
      description.current?.value === "" ||
      expenseAccount.current?.value === ""
    ) {
      setErrorMessage("Please fill all the fields");
      setClicked(false);
      return;
    }
    const data = {
      date: expenseDate.current?.value,
      type: expenseType.current?.value,
      mode: paymentModes[activeButtonIndex].value,
      given_to: givenTo.current?.value,
      amount: Number.parseFloat(`${amount.current?.value}`),
      net: Number.parseFloat(`${amount.current?.value}`),
      tax: 0,
      desc:
        description.current?.value +
        ". Paid using " +
        findAccountName(Number.parseInt(expenseAccount.current?.value || "")),
      vendor_account_id: expenseAccount.current?.value,
    };

    callPOSTAPI(`${API_BASE_URL}/vendor/expense`, data, (response: any) => {
      if (response.success) {
        setErrorMessage("");
        refresh();
        handleClose();
      } else {
        setErrorMessage(response.message);
      }
      setClicked(false);
    });
  };

  useEffect(() => {
    setLoading(true);
    const apiURL = `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(
      startDate
    )}&report_type=by_expense&end_date=${formatDate(endDate)}&locations=null&app_type=web`;
    callAPI(apiURL, (data: any) => {
      setExpenseData(Object.groupBy(data.data, (v: Expense) => v["expense type"]));
      let total = 0;
      for (let i in data.data) {
        if (expensesToIgnore.indexOf(data.data[i]["expense type"]) === -1) {
          total += data.data[i].amount;
        }
      }
      setTotal(total);
      setLoading(false);
    });

    const expenseTypesURL = `${API_BASE_URL}/vendor/expense/type`;
    callAPI(expenseTypesURL, (data: any) => {
      setExpenseTypes(
        data.data.map((v: { value: string; name: string }) => {
          return { id: v.value, name: v.name };
        })
      );
    });

    callAPI(`${API_BASE_URL}/payment_mode`, (data: any) => {
      const pm = [];
      pm.push({ name: "Bank Transfer", value: data.data.find((v: any) => v.name === "ONLINE").value });
      pm.push({ name: "Cash", value: data.data.find((v: any) => v.name === "CASH").value });
      pm.push({ name: "UPI", value: data.data.find((v: any) => v.name === "UPI").value });
      setPaymentModes(pm);
    });

    callAPI(`${API_BASE_URL}/vendor/account/list`, (data: any) => {
      const acc = data.data.map((v: { id: string; name: string }) => {
        return { id: v.id, name: v.name };
      });
      // acc.push(data.data.find((v: any) => v.name === "ICICI").id);
      // acc.push(data.data.find((v: any) => v.name === "Petty cash").id);
      setAccounts(acc);
    });
  }, [startDate, endDate, expensesToIgnore, callAPI]);

  const refresh = () => {
    setStartDate(startOfMonth(new Date()));
    setEndDate(new Date());
    setButtonIndex(2);
  };

  const setDuration = (duration: string) => {
    if (duration === "day") {
      setStartDate(new Date());
      setEndDate(new Date());
    } else if (duration === "week") {
      setStartDate(getFirstDayOfWeek(new Date()));
      setEndDate(new Date());
    } else if (duration === "month") {
      setStartDate(startOfMonth(new Date()));
      setEndDate(new Date());
    }
  };

  const previous = () => {
    switch (buttonIndex) {
      case 0:
        setStartDate(addDays(startDate, -1));
        setEndDate(addDays(endDate, -1));
        break;
      case 1:
        setStartDate(addDays(startDate, -7));
        setEndDate(addDays(endOfWeek(addDays(startDate, -7)), 1));
        break;
      case 2:
        setStartDate(addMonths(startDate, -1));
        setEndDate(endOfMonth(addMonths(startDate, -1)));
        break;
      default:
        break;
    }
  };

  const next = () => {
    switch (buttonIndex) {
      case 0:
        setStartDate(addDays(startDate, 1));
        setEndDate(addDays(endDate, 1));
        break;
      case 1:
        setStartDate(addDays(startDate, 7));
        setEndDate(addDays(endOfWeek(addDays(endDate, 7)), 1));
        break;
      case 2:
        setStartDate(addMonths(startDate, 1));
        setEndDate(endOfMonth(addMonths(startDate, 1)));
        break;
      default:
        break;
    }
  };

  const current = () => {
    switch (buttonIndex) {
      case 0:
        setStartDate(new Date());
        setEndDate(new Date());
        break;
      case 1:
        setStartDate(getFirstDayOfWeek(new Date()));
        setEndDate(new Date());
        break;
      case 2:
        setStartDate(startOfMonth(new Date()));
        setEndDate(new Date());
        break;
      default:
        break;
    }
  };

  const buttons = [
    { title: "Daily", onClick: () => setDuration("day") },
    { title: "Weekly", onClick: () => setDuration("week") },
    { title: "Monthly", onClick: () => setDuration("month") },
  ];

  const findAccountName = (id: number) => {
    console.log(id, accounts);
    const account = accounts.find((v) => v.id === id);
    return account ? account.name : "";
  };

  return (
    <DiwaCard varient="danger" loadingTracker={loading}>
      <DiwaButtonGroup buttons={buttons} state={buttonState} />
      <div className="position-relative">
        <h2 className="text-color">
          {buttons[buttonIndex].title} Expenses{" "}
          <p className="small text-color-danger-50 mb-1">
            {formatDisplayDate(startDate)} to {formatDisplayDate(endDate)}
          </p>
          <p className="small mb-0 text-color-50">Total: {currencyFormatter.format(total)}</p>
        </h2>
        <div className="position-absolute top-0 end-0" style={{ marginTop: -6 }}>
          <Button variant="indigo" className="text-color" size="lg" onClick={() => handleShow()}>
            <Icon.PlusLg />
          </Button>
          <Button variant="indigo" className="text-color" size="lg" onClick={() => refresh()}>
            <Icon.ArrowClockwise />
          </Button>
        </div>
        <Offcanvas
          show={show}
          className="h-auto bg-dark text-color"
          placement="bottom"
          backdrop={true}
          scroll={false}
          keyboard={false}
          id="offcanvasBottom"
          onHide={handleClose}
        >
          <Offcanvas.Header closeButton closeVariant="color">
            <h5>Add New Expense</h5>
          </Offcanvas.Header>
          <Offcanvas.Body className="pt-0">
            <Form className="mt-0 text-color" onSubmit={createExpense}>
              <Row className="align-items-center mb-2">
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="mb-1">Expense Type</Form.Label>
                    <Form.Select ref={expenseType}>
                      {expenseTypes.map((v: { id: string; name: string }) => (
                        <option value={v.id} key={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="mb-1">From Account</Form.Label>
                    <Form.Select ref={expenseAccount}>
                      {accounts.map((v: { id: string; name: string }) => (
                        <option value={v.id} key={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="align-items-center mb-1">
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="mb-1">Expense Date</Form.Label>
                    <Form.Control size="sm" type="date" placeholder="Date" ref={expenseDate} />
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="mb-1">Given To</Form.Label>
                    <Form.Control size="sm" type="text" placeholder="Name" ref={givenTo} />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="align-items-end mb-1">
                <Col xs={6}>
                  <Form.Group>
                    <Form.Label className="mb-1">Amount</Form.Label>
                    <Form.Control size="sm" type="number" step={0.01} placeholder="Amount" ref={amount} />
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group>
                    <ButtonGroup size="sm">
                      {paymentModes.map((v, i) => {
                        return (
                          <Button
                            variant={activeButtonIndex === i ? "primary" : "light"}
                            onClick={() => setActiveButtonIndex(i)}
                          >
                            {v.name}
                          </Button>
                        );
                      })}
                    </ButtonGroup>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="align-items-center mb-2">
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="mb-1">Given For</Form.Label>
                    <Form.Control as="textarea" rows={2} size="sm" ref={description} />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="align-items-center">
                <Col xs={12}>
                  <Button variant="success" className="text-light" type="submit" disabled={clicked}>
                    {clicked ? "Wait..." : "Save"}
                  </Button>
                </Col>
              </Row>
              {errorMessage !== "" && (
                <Row className="align-items-center mb-2">
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="mb-1 text-danger">{errorMessage}</Form.Label>
                    </Form.Group>
                  </Col>
                </Row>
              )}
            </Form>
          </Offcanvas.Body>
        </Offcanvas>
      </div>

      {Object.keys(expenseData).length === 0 ? (
        <div className="text-color rounded translucent-bg px-2 py-1">
          <span>No {buttons[buttonIndex].title.toLowerCase()} expenses</span>
        </div>
      ) : (
        Object.keys(expenseData).map((keyName, index) => {
          const val = expenseData[keyName as keyof typeof expenseData];
          return expensesToIgnore.indexOf(keyName) !== -1 ? null : (
            <Accordion flush key={"expense" + index}>
              <Accordion.Header className="w-100">
                <div className="w-100 pe-2 pb-1">
                  <div className="text-start d-inline h5 text-color">{keyName}</div>
                  <div className="text-end d-inline float-end text-color">
                    <p className="d-inline mb-0">{currencyFormatter.format(getTotal(val))}</p>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <ul className="list-group list-group-flush">
                  {val?.map((item, index2) => {
                    return (
                      <li
                        className="list-group-item bg-transparent text-color border-color ps-0"
                        key={keyName + "item" + index2}
                      >
                        <div className="w-100 pe-2 pb-2">
                          <div className="text-start d-inline h5">
                            {currencyFormatter.format(Number(item["amount"]))}
                          </div>
                          <div className="text-end d-inline float-end">{item["date"]}</div>
                        </div>
                        <p className="small text-color-50 mb-0" style={{ marginTop: -4 }}>
                          {item["description"]}
                        </p>
                        <p className="small text-color-50 mb-0" style={{ marginTop: -4 }}>
                          Given to {item["given to"]} by {item["Payment mode"]} by{" "}
                          {/* {findAccountName(item["vendor_account_id"])} */}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </Accordion.Body>
            </Accordion>
          );
        })
      )}
      <p></p>
      <DiwaPaginationButton previous={previous} current={current} next={next} />
    </DiwaCard>
  );

  function getTotal(arr: Expense[] | undefined) {
    if (!arr) return 0;
    return arr.reduce((v, current) => v + current.amount, 0);
  }
}
