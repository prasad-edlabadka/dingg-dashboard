import { useEffect, useState } from "react";
import { Button, Card, Spinner } from "react-bootstrap";
import callAPI from "./Utility";
import * as Icon from 'react-bootstrap-icons';

export default function Stock({ token, setToken }: { token: string, setToken: any }) {
    const [reportData, setReportData] = useState({ data: [{ "depth": 0, name: "", quantity: 0, cost: 0, low_qty: 0}] });
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(-1);
    const currFormatter = Intl.NumberFormat('en-in', {style:"currency", currency:"INR", maximumFractionDigits: 2});

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = () => {
        setLoading(true);
        const apiURL = ` https://api.dingg.app/api/v1/product/sub-categories-products?product_name=&types=&category_ids=&subcategory_ids=&is_low_qty=true&brand=`
        callAPI(apiURL, token, setToken, (data: any) => {
            setReportData(data);
            let tot = 0;
            for(var d in data.data) {
                tot += ((Number(data.data[d].cost) || 0) * (Number(data.data[d].low_qty) +1));
            }
            setTotal(tot);
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
                            <h2>Products Low on Stock<p className="small text-white-50 mb-0">Estimated Total Cost: {currFormatter.format(total)}</p></h2>
                            <div className="position-absolute top-0 end-0" style={{ marginTop: -10 }}>
                                <Button variant="indigo" className="text-light" size="lg" onClick={() => refresh()}><Icon.ArrowClockwise /></Button>
                            </div>
                            </div>
                            <ul className="list-group list-group-flush">
                            {
                                reportData.data.map(val => {
                                   
                                    return(
                                        val.depth === 1?
                                        <li className="list-group-item bg-transparent text-light border-white ps-0">
                                        {val.name}<p className="small text-white-50 mb-0" style={{ marginTop: -4 }}>{val.quantity} available in stock. Minimum {Number(val.low_qty) + 1} should be ordered.</p><p className="small text-white-50 mb-0" style={{ marginTop: -4 }}>Cost: {currFormatter.format(val.cost)}</p></li>: '')
                                })
                            }
                            </ul>
                    </Card.Body>
            }

        </Card>
    )
}
