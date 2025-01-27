import { useContext, useEffect, useRef, useState } from "react";
import { callPOSTAPI, currencyFormatter, formatDate } from "./Utility";
import { TokenContext, API_BASE_URL } from "../../App";
import DiwaCard from "../../components/card/DiwaCard";
import { Button, Col, Form, Offcanvas, Row } from "react-bootstrap";
import SimpleDataPoint from "./sale/SimpleDataPoint";
import * as Icon from "react-bootstrap-icons";

export default function Balance() {
  const { token, updateToken, callAPIPromise } = useContext(TokenContext);

  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pnl, setPnl] = useState([]);
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

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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
          notes: description.current?.value,
        }
      : {
          transaction_type: "direct",
          vendor_account_id: toAccount.current?.value,
          is_credit: amt > 0 ? true : false,
          amount: Math.abs(amt),
          date: transferDate.current?.value,
          notes: description.current?.value,
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
      setLoading(false);
    };
    fetchData();
  }, [reload, callAPIPromise]);

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

  return (
    <>
      <Row>
        <Col xs={12}>
          <DiwaCard varient="primary" loadingTracker={loading}>
            <div className="position-relative text-color mb-2">
              <h2>
                Account Balance
                <p className="small text-color-danger-50 mb-1">
                  Total money available: {currencyFormatter.format(totalBalance)}
                </p>
              </h2>
              <div className="position-absolute top-0 end-0" style={{ marginTop: -6 }}>
                <Button variant="indigo" className="text-color" size="lg" onClick={() => handleShow()}>
                  <Icon.PlusLg />
                </Button>
                <Button variant="indigo" className="text-color" size="lg" onClick={() => setReload(!reload)}>
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
                <Offcanvas.Header closeButton closeVariant="white">
                  <h5>Transfer Funds</h5>
                </Offcanvas.Header>
                <Offcanvas.Body className="pt-0">
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
            <SimpleDataPoint data={pnl} />
          </DiwaCard>
        </Col>
      </Row>
    </>
  );
}
