import { useContext, useEffect, useRef, useState } from "react";
import { Accordion, Button, ButtonGroup, Col, Form, Offcanvas, Row } from "react-bootstrap";
import { addDays, currencyFormatter, formatDate, formatDisplayDate, getStartOfFinanceMonthDate, getStartOfMonthDate } from "./Utility";
import * as Icon from 'react-bootstrap-icons';
import { TokenContext } from "../../App";
import DiwaButtonGroup from "../../components/button/DiwaButtonGroup";
import DiwaCard from "../../components/card/DiwaCard";

export default function Expenses() {
    const { callAPI, callPOSTAPI } = useContext(TokenContext)
    const [expenseData, setExpenseData] = useState({});
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(-1);
    const [show, setShow] = useState(false);
    const buttonState = useState(0);
    const [, setButtonIndex] = buttonState;
    const [activeButtonIndex, setActiveButtonIndex] = useState(0);
    const [expenseTypes, setExpenseTypes] = useState([]);
    const [startDate, setStartDate] = useState(getStartOfFinanceMonthDate(new Date()));
    const [endDate, setEndDate] = useState(new Date());

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const expenseType = useRef<HTMLSelectElement>(null);
    const expenseDate = useRef<HTMLInputElement>(null);
    const givenTo = useRef<HTMLInputElement>(null);
    const amount = useRef<HTMLInputElement>(null);
    const description = useRef<HTMLTextAreaElement>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [clicked, setClicked] = useState(false);

    const createExpense = (e: any) => {
        e.preventDefault();
        if(clicked) return;
        setClicked(true);
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

        callPOSTAPI("https://api.dingg.app/api/v1/vendor/expense", data, (response: any) => {
            if (response.success) {
                setErrorMessage('');
                refresh();
                handleClose();
            } else {
                setErrorMessage(response.message);
            }
            setClicked(false);
        });
    }
    // eslint-disable-next-line no-sequences
    const groupBy = (x: any[], f: { (v: string): any; (arg0: any, arg1: any, arg2: any): string | number; }) => x.reduce((a, b, i) => ((a[f(b, i, x)] ||= []).push(b), a), {});

    useEffect(() => {
        setLoading(true);
        console.log(formatDate(startDate), formatDate(endDate));
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${formatDate(startDate)}&report_type=by_expense&end_date=${formatDate(endDate)}&locations=null&app_type=web`;
        callAPI(apiURL, (data: any) => {
            setExpenseData(groupBy(data.data, v => v["expense type"]));
            let total = 0;
            total += data.data.reduce((v: any, current: { amount: any; }) => v + current.amount, 0);
            setTotal(total);
            setLoading(false);
        });

        const expenseTypesURL = `https://api.dingg.app/api/v1/vendor/expense/type`;
        callAPI(expenseTypesURL, (data: any) => {
            setExpenseTypes(data.data.map((v: { value: string; name: string; }) => { return { id: v.value, name: v.name } }));
        });
    }, [startDate, endDate, callAPI]);

    const refresh = () => {
        setStartDate(getStartOfFinanceMonthDate(new Date()));
        setEndDate(new Date());
        setButtonIndex(0);
    }

    const setDuration = (duration: string) => {
        if (duration === 'month') {
            setStartDate(getStartOfFinanceMonthDate(new Date()));
            setEndDate(new Date());
        } else if (duration === 'cal_month') {
            setStartDate(getStartOfMonthDate(new Date()));
            setEndDate(new Date());
        } else if (duration === 'prev_month') {
            setStartDate(getStartOfFinanceMonthDate(addDays(getStartOfFinanceMonthDate(new Date()), -1)));
            setEndDate(addDays(getStartOfFinanceMonthDate(new Date()), -1));
        } else if (duration === 'prev_cal_month') {
            setStartDate(getStartOfMonthDate(addDays(getStartOfMonthDate(new Date()), -1)));
            setEndDate(addDays(getStartOfMonthDate(new Date()), -1));
        }
    }

    const buttons = [
        { title: 'Fin Month', onClick: () => setDuration('month') },
        { title: 'Cal Month', onClick: () => setDuration('cal_month') },
        { title: 'Prev. Fin Month', onClick: () => setDuration('prev_month') },
        { title: 'Prev. Cal Month', onClick: () => setDuration('prev_cal_month') },
    ];



    return (
        <DiwaCard varient="danger" loadingTracker={loading}>
            <DiwaButtonGroup buttons={buttons} state={buttonState} />
            <div className="position-relative">
                <h2>Monthly Expenses <p className="small mb-1">{formatDisplayDate(startDate)} to {formatDisplayDate(endDate)}</p><p className="small mb-0 text-white-50">Total: {currencyFormatter.format(total)}</p></h2>
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
                                            {expenseTypes.map((v: { id: string; name: string; }) => <option value={v.id} key={v.id}>{v.name}</option>)}
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
                                    <Button variant="success" className="text-light" type="submit" disabled={clicked}>{clicked?'Wait...':'Save'}</Button>
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
        </DiwaCard>
    )

    function getTotal(arr: any[]) {
        return arr.reduce((v: any, current: { amount: any; }) => v + current.amount, 0);
    }
}
