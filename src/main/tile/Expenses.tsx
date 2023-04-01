import { useEffect, useState } from "react";
import { Accordion, Button, Card, Spinner } from "react-bootstrap";
import callAPI, { currencyFormatter, formatDate, formatDisplayDate, getStartOfFinanceMonth, getStartOfFinanceMonthDate } from "./Utility";
import * as Icon from 'react-bootstrap-icons';

export default function Expenses({ token, setToken }: { token: string, setToken: any }) {
    const [expenseData, setExpenseData] = useState({});
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(-1);
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
                                <Button variant="indigo" className="text-light" size="lg" onClick={() => refresh()}><Icon.ArrowClockwise /></Button>
                            </div>
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
