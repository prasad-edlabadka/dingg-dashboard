import { useEffect, useRef, useState } from "react";
import { Accordion, Button, ButtonGroup, Card, Col, Form, Offcanvas, Row, Spinner } from "react-bootstrap";
import callAPI, { callPOSTAPI, currencyFormatter, formatDate, formatDisplayDate, getStartOfFinanceMonth, getStartOfFinanceMonthDate } from "./Utility";
import * as Icon from 'react-bootstrap-icons';

export default function Expenses({ token, setToken }: { token: string, setToken: any }) {
    const [expenseData, setExpenseData] = useState({});
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(-1);
    const [show, setShow] = useState(false);
    const [activeButtonIndex, setActiveButtonIndex] = useState(0);
    const [expenseTypes, setExpenseTypes] = useState([]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const expenseType = useRef<HTMLSelectElement>(null);
    const expenseDate = useRef<HTMLInputElement>(null);
    const givenTo = useRef<HTMLInputElement>(null);
    const amount = useRef<HTMLInputElement>(null);
    const description = useRef<HTMLTextAreaElement>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const createExpense = (e: any) => {
        e.preventDefault();
        if (expenseType.current?.value === '' || expenseDate.current?.value === '' || givenTo.current?.value === '' || amount.current?.value === '' || description.current?.value === '') {
            setErrorMessage("Please fill all the fields");
            return;
        }
        const data = {
            "date": expenseDate.current?.value,
            "type": expenseType.current?.value,
            "mode": activeButtonIndex === 0 ? "3" : "1",
            "given_to": givenTo.current?.value,
            "amount": Number.parseFloat(`${amount.current?.value}`),
            "desc": description.current?.value,
            "vendor_account_id": activeButtonIndex === 0 ? "712" : "2348",
        }

        callPOSTAPI("https://api.dingg.app/api/v1/vendor/expense", data, token, setToken, (response: any) => {
            if (response.success) {
                setErrorMessage('');
                handleClose();
            } else {
                setErrorMessage(response.message);
            }
        })

        // const requestMetadata = {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': token
        //     },
        //     body: JSON.stringify(data)
        // };
        // fetch("https://api.dingg.app/api/v1/vendor/expense", requestMetadata)
        //     .then(res => res.json())
        //     .then(response => {
        //         if(response.success) {
        //             setErrorMessage('');
        //             handleClose();
        //         } else {
        //             setErrorMessage(response.message);
        //         }
        //     });
    }
    // eslint-disable-next-line no-sequences
    const groupBy = (x: any[], f: { (v: string): any; (arg0: any, arg1: any, arg2: any): string | number; }) => x.reduce((a, b, i) => ((a[f(b, i, x)] ||= []).push(b), a), {});

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = () => {
        setLoading(true);
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${getStartOfFinanceMonth(new Date())}&report_type=by_expense&end_date=${formatDate(new Date())}&locations=null&app_type=web`;
        callAPI(apiURL, token, setToken, (data: any) => {
            setExpenseData(groupBy(data.data, v => v["expense type"]));
            let total = 0;
            total += data.data.reduce((v: any, current: { amount: any; }) => v + current.amount, 0);
            setTotal(total);
            setLoading(false);
        });

        const expenseTypesURL = `https://api.dingg.app/api/v1/vendor/expense/type`;
        callAPI(expenseTypesURL, token, setToken, (data: any) => {
            setExpenseTypes(data.data.map((v: { value: string; name: string; }) => { return { id: v.value, name: v.name } }));
        });
    }

    const refresh = () => {
        loadData();
    }

    return (

        <Card className="shadow" bg="danger" text="light">
            {
                loading ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                    <Card.Body>
                        <div className="position-relative">
                            <h2>Monthly Expenses <p className="small mb-1">{formatDisplayDate(getStartOfFinanceMonthDate(new Date()))} to {formatDisplayDate(new Date())}</p><p className="small mb-0 text-white-50">Total: {currencyFormatter.format(total)}</p></h2>
                            <div className="position-absolute top-0 end-0" style={{ marginTop: -6 }}>
                                {/* <Button variant="danger" className="text-light" size="sm" onClick={() => handleShow()}>Add New Expense</Button> */}
                                <Button variant="indigo" className="text-light" size="lg" onClick={() => handleShow()}><Icon.PlusLg /></Button>
                                <Button variant="indigo" className="text-light" size="lg" onClick={() => refresh()}><Icon.ArrowClockwise /></Button>
                            </div>
                            <Offcanvas show={show} className="h-auto bg-dark text-white" placement="bottom" backdrop={true} scroll={false} keyboard={false} id="offcanvasBottom" onHide={handleClose}>
                                <Offcanvas.Header closeButton closeVariant="white"><h5>Add New Expense</h5></Offcanvas.Header>
                                <Offcanvas.Body className="pt-0">
                                    <Form className="mt-0" onSubmit={createExpense}>
                                        <Row className="align-items-center mb-2">
                                            <Col xs={12}>
                                                <Form.Group>
                                                    <Form.Label className="mb-1">Expense Type</Form.Label>
                                                    <Form.Select ref={expenseType}>
                                                        {expenseTypes.map((v: { id: string; name: string; }) => <option value={v.id}>{v.name}</option>)}
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
                                                        <Button variant={activeButtonIndex === 0 ? "primary" : "light"} onClick={() => setActiveButtonIndex(0)}>Bank Transfer</Button>
                                                        <Button variant={activeButtonIndex === 1 ? "primary" : "light"} onClick={() => setActiveButtonIndex(1)}>Cash</Button>
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
                                                <Button variant="success" className="text-light" type="submit">Save</Button>
                                            </Col>
                                        </Row>
                                        {errorMessage !== '' && <Row className="align-items-center mb-2">
                                            <Col xs={12}>
                                                <Form.Group>
                                                    <Form.Label className="mb-1 text-danger">{errorMessage}</Form.Label>
                                                </Form.Group>
                                            </Col>
                                        </Row>}

                                    </Form>
                                </Offcanvas.Body>
                            </Offcanvas>

                        </div>

                        {
                            Object.keys(expenseData).map((keyName, index) => {
                                const val = expenseData[keyName];
                                return (
                                    <Accordion flush key={'expense' + index}>
                                        <Accordion.Header className="w-100">
                                            <div className="w-100 pe-2 pb-1">
                                                <div className="text-start d-inline h5">{keyName}</div>
                                                <div className="text-end d-inline float-end"><p className="d-inline mb-0">{currencyFormatter.format(getTotal(val))}</p></div>
                                            </div>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <ul className="list-group list-group-flush">
                                                {
                                                    val.map((item: { [x: string]: string; }, index2: number) => {
                                                        return (<li className="list-group-item bg-transparent text-light border-white ps-0" key={keyName + 'item' + index2}>
                                                            <div className="w-100 pe-2 pb-2">
                                                                <div className="text-start d-inline h5">{currencyFormatter.format(Number(item["amount"]))}</div>
                                                                <div className="text-end d-inline float-end">{item["date"]}</div>
                                                            </div>
                                                            <p className="small text-white-50 mb-0" style={{ marginTop: -4 }}>{item["description"]}</p>
                                                            <p className="small text-white-50 mb-0" style={{ marginTop: -4 }}>Given to {item["given to"]} by {item["Payment mode"]}</p>
                                                        </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </Accordion.Body>
                                    </Accordion>
                                )

                            })
                        }
                    </Card.Body>
            }

        </Card>

    )

    function getTotal(arr: any[]) {
        return arr.reduce((v: any, current: { amount: any; }) => v + current.amount, 0);
    }
}
