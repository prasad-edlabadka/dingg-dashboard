import { useContext, useEffect, useRef, useState } from "react";
import { callPOSTAPI, currencyFormatter, formatDate, formatDisplayDate, titleCase } from "./Utility";
import { TokenContext, API_BASE_URL } from "../../App";
import DiwaCard from "../../components/card/DiwaCard";
import { Button, Col, Form, Offcanvas, Row } from "react-bootstrap";
// import SimpleDataPoint from "./sale/SimpleDataPoint";
import * as Icon from "react-bootstrap-icons";
import { addDays, endOfMonth, format, parse, startOfMonth } from "date-fns";

interface ModernTransaction {
  id: number;
  date: string;
  account_name: string;
  transaction_type: string;
  credit_type: string;
  type: string;
  befor_balance: number;
  after_balance: number;
  amount: number;
  transfer_account: string | null;
  type_id: number;
  notes: string;
  expense_desc?: string;
}

interface ModernTransactionExpense {
  id: number;
  description: string;
}

export default function ModernBalance() {
  const { token, updateToken, callAPIPromise, employeeName } = useContext(TokenContext);

  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pnl, setPnl] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const fromAccount = useRef<HTMLSelectElement>(null);
  const transferDate = useRef<HTMLInputElement>(null);
  const toAccount = useRef<HTMLSelectElement>(null);
  const amount = useRef<HTMLInputElement>(null);
  const description = useRef<HTMLTextAreaElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [clicked, setClicked] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [fromAccountBalance, setFromAccountBalance] = useState(0);
  const [toAccountBalance, setToAccountBalance] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState(0);
  const [transactions, setTransactions] = useState<ModernTransaction[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [expenseDescriptions, setExpenseDescriptions] = useState<ModernTransactionExpense[]>([]);
  const [selectedAccountName, setSelectedAccountName] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleTransactionsClose = () => setShowTransactions(false);

  const createTransfer = (e: any) => {
    e.preventDefault();
    setClicked(true);
    const validate = () => {
      if (fromAccount.current?.value === "") {
        setErrorMessage("From account is required.");
        return false;
      }
      if (toAccount.current?.value === "") {
        setErrorMessage("To account is required.");
        return false;
      }
      // if (fromAccount.current?.value === toAccount.current?.value) {
      //   setErrorMessage("From and To accounts cannot be same.");
      //   return false;
      // }
      if (amount.current?.value === "") {
        setErrorMessage("Amount is required.");
        return false;
      }
      if (transferDate.current?.value === "") {
        setErrorMessage("Transfer date is required.");
        return false;
      } else if (new Date(transferDate.current?.value || "") > new Date()) {
        setErrorMessage("Transfer date cannot be in future.");
        return false;
      }
      if (description.current?.value === "") {
        setErrorMessage("Description is required.");
        return false;
      }
      return true;
    };
    if (!validate()) {
      setClicked(false);
      return false;
    }
    const isTransfer = fromAccount.current?.value !== toAccount.current?.value;
    const apiURL = `${API_BASE_URL}/vendor/account/transaction`;
    const amt = Number.parseFloat(amount.current?.value || "0");
    const data = isTransfer
      ? {
          transaction_type: "internal transfer",
          in_vendor_account_id: toAccount.current?.value,
          out_vendor_account_id: fromAccount.current?.value,
          amount: amount.current?.value,
          date: transferDate.current?.value,
          notes: `${description.current?.value}. Added by ${employeeName} on ${format(new Date(), "dd-MMM-yyyy")}`,
        }
      : {
          transaction_type: "direct",
          vendor_account_id: toAccount.current?.value,
          is_credit: amt > 0 ? true : false,
          amount: Math.abs(amt),
          date: transferDate.current?.value,
          notes: `${description.current?.value}. Added by ${employeeName} on ${format(new Date(), "dd-MMM-yyyy")}`,
        };
    callPOSTAPI(apiURL, data, token, updateToken, (response: any) => {
      if (response.code === 200) {
        setErrorMessage("");
        setReload(!reload);
        handleClose();
      } else {
        setErrorMessage(response.message);
      }
      setClicked(false);
    });
  };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const apiURL = `${API_BASE_URL}/vendor/account/list`;
      const accountList = await callAPIPromise(apiURL);
      const pnl =
        accountList.data.length === 0
          ? []
          : accountList.data
              .sort((a: { id: number }, b: { id: number }) => a.id >= b.id)
              .map((v: any) => {
                return {
                  id: v.id,
                  title: v.name,
                  value: v.current_balance,
                  previous: v.current_balance,
                };
              });
      setPnl(pnl);

      setTotalBalance(pnl.reduce((acc: number, v: any) => acc + v.value, 0));
      setFromAccountBalance(accountList.data[0].current_balance);
      setToAccountBalance(accountList.data[0].current_balance);
      console.log("Setting from account balance to: " + accountList.data[0].current_balance);
      console.log("Setting to account balance to: " + accountList.data[0].current_balance);
      setAccounts(accountList.data);

      //Code to calcualte specific slots of sale
      const startDate = startOfMonth(new Date());
      const salaryDate = addDays(startDate, 9);
      const profitDate = addDays(startDate, 14);
      const endDate = endOfMonth(new Date());
      const salaryTotal = await getTotal(startDate, salaryDate);
      const profitTotal = await getTotal(addDays(salaryDate, 1), profitDate);
      const expenseTotal = await getTotal(addDays(profitDate, 1), endDate);

      console.log("Salary total: " + salaryTotal);
      console.log("Profit total: " + profitTotal);
      console.log("Expense total: " + expenseTotal);

      setLoading(false);
    };
    const getTotal = async (startDate: Date, endDate: Date) => {
      const apiURL = `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(startDate)}&end_date=${formatDate(
        endDate
      )}&report_type=by_type&app_type=web`;
      const data = await callAPIPromise(apiURL);
      console.log("Data for total: ", data);
      if (!data) return;
      const total = data.data.reduce(
        (acc: any, info: any) => (acc += Number.parseFloat(info["grand total"] || "0")),
        0
      );
      return total;
    };

    fetchData();
  }, [reload, callAPIPromise]);

  useEffect(() => {
    const fetchData = async () => {
      const endDate = new Date();
      const startDate = addDays(endDate, -7);
      const apiURL = `${API_BASE_URL}/vendor/account/transactions?account_ids=${selectedAccount}&start_date=${formatDate(
        startDate
      )}&end_date=${formatDate(endDate)}&limit=100&page=1`;
      const transactions = await callAPIPromise(apiURL);
      console.log(transactions.data);
      setTransactions(transactions.data || []);
    };
    fetchData();
  }, [selectedAccount, callAPIPromise]);

  const [accountChange, setAccountChange] = useState(false);

  useEffect(() => {
    console.log(
      fromAccount.current?.value,
      accounts,
      accounts.filter((v) => v.id === fromAccount.current?.value)
    );
    console.log("Selected account is: " + fromAccount.current?.value);

    fromAccount.current?.value &&
      setFromAccountBalance(
        accounts.filter((v) => v.id === Number.parseInt(fromAccount.current?.value || "0"))[0]?.current_balance
      );

    toAccount.current?.value &&
      setToAccountBalance(
        accounts.filter((v) => v.id === Number.parseInt(toAccount.current?.value || "0"))[0]?.current_balance
      );
  }, [accountChange, accounts]);

  const loadExpenseInfo = async (val: ModernTransaction) => {
    if (!expenseDescriptions.find((v) => v.id === val.id)) {
      const apiURL = `${API_BASE_URL}/vendor/expenses?date=${val.date}`;
      const expenseInfo = await callAPIPromise(apiURL);
      const expense = expenseInfo.data.find((v: { id: number }) => v.id === val.type_id);
      setExpenseDescriptions([
        ...expenseDescriptions,
        {
          id: val.id,
          description: expense ? `Given to ${expense?.given_to} for ${expense?.desc}` : "No information available",
        },
      ]);
      console.log(expenseDescriptions);
    }
  };

  return (
    <div className="kpi-card-container">
      <DiwaCard varient="primary" loadingTracker={loading} className="glass-panel customer-card">
        <div className="d-flex align-items-top pb-2 mb-2 mt-3 text-color" style={{ gap: "12px" }}>
          <h2 className="panel-title text-color mb-0" style={{ flex: 1 }}>
            Account Balance
          </h2>
          <button
            type="button"
            className="icon-btn refresh me-2"
            style={{ marginTop: -8 }}
            aria-label="Add Expense"
            onClick={() => handleShow()}
          >
            <Icon.PlusLg />
          </button>
          <button
            type="button"
            className="icon-btn refresh"
            style={{ marginTop: -8 }}
            aria-label="Refresh"
            onClick={() => setReload(!reload)}
          >
            <Icon.ArrowClockwise />
          </button>
          <Offcanvas
            show={show}
            className="offcanvas-glass text-color"
            placement="bottom"
            backdrop={true}
            scroll={false}
            keyboard={false}
            id="offcanvasBottom"
            onHide={handleClose}
          >
            <Offcanvas.Header closeButton closeVariant="white" className="offcanvas-head">
              <h5>Transfer Funds</h5>
            </Offcanvas.Header>
            <Offcanvas.Body className="offcanvas-body pt-0">
              <Form className="mt-0 text-color" onSubmit={createTransfer}>
                <Row className="align-items-center mb-2">
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label className="mb-1">From Account</Form.Label>
                      <Form.Select ref={fromAccount} onChange={() => setAccountChange(!accountChange)}>
                        {accounts.map((v: { id: string; name: string }) => (
                          <option value={v.id} key={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Label className="mb-1">
                        {`Current Balance: ${currencyFormatter.format(fromAccountBalance)}`}
                      </Form.Label>
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label className="mb-1">To Account</Form.Label>
                      <Form.Select ref={toAccount} onChange={() => setAccountChange(!accountChange)}>
                        {accounts.map((v: { id: string; name: string }) => (
                          <option value={v.id} key={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Label className="mb-1">
                        {`Current Balance: ${currencyFormatter.format(toAccountBalance)}`}
                      </Form.Label>
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="align-items-center mb-1">
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label className="mb-1">Transfer Date</Form.Label>
                      <Form.Control
                        size="sm"
                        type="date"
                        placeholder="Date"
                        ref={transferDate}
                        defaultValue={formatDate(new Date())}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label className="mb-1">Amount</Form.Label>
                      <Form.Control size="sm" type="number" step={0.01} placeholder="Amount" ref={amount} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="align-items-center mb-2">
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="mb-1">Transfering For?</Form.Label>
                      <Form.Control as="textarea" rows={2} size="sm" ref={description} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="align-items-center">
                  <Col xs={12}>
                    <Button variant="outline-color" className="offcanvas-cta" type="submit" disabled={clicked}>
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

        <div className={`kpi ${totalBalance > 0 ? "positive" : "negative"} mb-3`} key={"kpi-total"}>
          <div className="kpi-title">Total Money Available</div>
          <div className={`kpi-value big-value`}>{currencyFormatter.format(totalBalance)}</div>
        </div>

        <div className="kpi-grid mb-2">
          {pnl.map((k) => (
            <div className={`kpi ${k.value > 0 ? "positive" : "negative"}`} key={k.title}>
              <div className="kpi-title">{k.title}</div>
              <div
                className={`kpi-value`}
                onClick={() => {
                  setSelectedAccount(k.id);
                  setSelectedAccountName(pnl.find((v) => v.id === k.id)?.title);
                  setTransactions([]);
                  setShowTransactions(true);
                }}
              >
                {currencyFormatter.format(k.value)}
              </div>
            </div>
          ))}
        </div>
      </DiwaCard>

      <Offcanvas
        show={showTransactions}
        className="offcanvas-glass text-color"
        placement="bottom"
        backdrop={true}
        scroll={false}
        keyboard={false}
        id="offcanvasBottom"
        onHide={handleTransactionsClose}
      >
        <Offcanvas.Header closeButton closeVariant="white" className="offcanvas-head">
          <h5>{selectedAccountName} Account transactions</h5>
        </Offcanvas.Header>
        <Offcanvas.Body className="offcanvas-body pt-0">
          {transactions.length === 0 && (
            <div className="text-center text-color-50">
              <Icon.InfoCircle className="mb-2" size={40} />
              <p className="small">No transactions in last 7 days</p>
            </div>
          )}
          {transactions.length > 0 && (
            <ul className="list-group list-group-flush">
              {transactions.map((val) => {
                return (
                  <li
                    className="panel-normal list-group-item bg-transparent text-color border-bottom border-color-25 ps-0"
                    key={val.id}
                  >
                    <div className="panel-normal w-100 pe-2 pb-2">
                      <div className="panel-normal text-start d-inline">
                        {titleCase(val.transaction_type || val.type)}
                        {val.type === "expense" && (
                          <Icon.InfoCircle
                            className="ms-1"
                            style={{ marginTop: -4 }}
                            onClick={() => loadExpenseInfo(val)}
                          />
                        )}
                      </div>
                      <div
                        className={`text-end d-inline float-end fw-bold ${
                          val.credit_type === "CREDIT" ? "text-success" : "text-danger"
                        }`}
                      >
                        {currencyFormatter.format(val.amount * (val.credit_type === "CREDIT" ? 1 : -1))}
                      </div>

                      <div>
                        <div className={`small text-color-50 text-end d-inline float-end`}>
                          {formatDisplayDate(parse(val.date, "yyyy-MM-dd", new Date()))}
                        </div>
                        <div className={`small text-color-50 text-start d-inline float-start`}>
                          {val.notes}
                          {expenseDescriptions.find((v) => v.id === val.id)?.description}
                        </div>
                      </div>
                      {/* <p className="small text-color-50 mb-0" style={{ marginTop: -4 }}></p> */}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
