import { useEffect, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import callAPI, { currencyFormatter, formatDate } from "./Utility";
import * as Icon from 'react-bootstrap-icons';

export default function BookingsV2({ token, setToken }: { token: string, setToken: any }) {
    const [billingData, setBillingData] = useState([
        {
            "id": 0,
            "selected_date": "",
            "bill_number": "",
            "total": 0,
            "paid": 0,
            "payment_status": "",
            "status": true,
            "cancel_reason": "",
            "net": 0,
            "tax": 0,
            "roundoff": 0,
            "user": {
                "id": 0,
                "fname": "",
                "lname": "",
                "display_name": "",
                "mobile": "",
            },
            "products":[
                {
                    "employee_id": 0,
                    "price": 0,
                    "qty": 0,
                    "discount": 0,
                    "tax": 0,
                    "total": 0,
                    "net": 0,
                    "paid": 0,
                    "redeem": 0,
                    "discount_id": "",
                    "discount_type": "",
                    "emp_share_on_redeem": 0,
                    "p_modes": [
                        {
                            "amount": 0,
                            "payment_mode": 0
                        }
                    ],
                    "product_lot_id": "",
                    "tax_percent": 0,
                    "tax_1_percent": 0,
                    "tax_2_percent": 0,
                    "product": {
                        "id": "",
                        "name": "",
                        "sac_code": 0
                    },
                    "employee": {
                        "id": 0,
                        "name": ""
                    },
                    "product_lot": null
                }
            ],
            "services": [
                {
                    "id": 0,
                    "price": 0,
                    "qty": 0,
                    "discount": 0,
                    "tax": 0,
                    "total": 0,
                    "net": 0,
                    "paid": 0,
                    "redeem": 0,
                    "discount_id": "",
                    "discount_type": "",
                    "emp_share_on_redeem": 0,
                    "p_modes": [
                        {
                            "amount": 0,
                            "payment_mode": 0
                        }
                    ],
                    "tax_percent": 0,
                    "tax_1_percent": 0,
                    "tax_2_percent": 0,
                    "employee": {
                        "id": 0,
                        "name": ""
                    },
                    "vendor_service": {
                        "id": 0,
                        "service": "",
                        "service_time": "",
                        "sub_category": {
                            "sac_code": ""
                        }
                    },
                    "bill_service_splits": []
                }
            ],
            "payments": {
                "price": 0,
                "discount": 0,
                "tax": 0,
                "total": 0,
            },
            "bill_payments": [
                {
                    "id": 0,
                    "bill_id": 0,
                    "payment_date": "",
                    "payment_mode": 0,
                    "amount": 0,
                    "redemption": false,
                    "note": "",
                    "vendor_location_id": "",
                    "createdAt": "",
                    "updatedAt": "",
                    
                }
            ]
        }
    ]);

 
    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = () => {
        //const apiURL = `https://api.dingg.app/api/v1/calender/booking?date=${formatDate(new Date())}`;
        const apiURL = `https://api.dingg.app/api/v1/vendor/bills?web=true&page=1&limit=1000&start=${formatDate(new Date())}&end=${formatDate(new Date())}&term=&is_product_only=`;
        //const apiURL = `https://api.dingg.app/api/v1/calender/booking?date=2022-12-18`
        callAPI(apiURL, token, setToken, (data: any) => {
            let counter = 0;
            for(var billIndex in data.data) {
                const bill = data.data[billIndex];
                const billURL = `https://api.dingg.app/api/v1//bill?bill_id=${bill.bill_payments[0].bill_id}`;
                // eslint-disable-next-line no-loop-func
                callAPI(billURL, token, setToken, (billData: any) => {
                    bill.services = billData.data.billSItems;
                    bill.products = billData.data.billPItems;
                    bill.payments = {};
                    bill.payments.price = billData.data.price;
                    bill.payments.discount = billData.data.discount;
                    bill.payments.tax = billData.data.tax;
                    bill.payments.total = billData.data.total;
                    counter++;
                    if(counter === data.data.length) {
                        setBillingData(data.data);
                    }
                });
            }
            
        });
    }

    const refresh = () => {
        loadData();
    }

    return (
        <div>
            <Row>
                <Col lg="12" xs="12">
                    <div className="position-relative today">
                        <h3 className="text-light evergreen">Today's Customers</h3>
                        <div className="position-absolute top-0 end-0" style={{ marginTop: -10 }}>
                            <Button variant="indigo" className="text-light mt-2" size="lg" onClick={() => refresh()}><Icon.ArrowClockwise /></Button>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row>
                {
                    billingData.map((booking, index) => {
                        return (
                            <Col xl={4} xs={12} className="gy-4" key={"booking"+index}>
                                <Card className="shadow" bg={booking.status?'success':'danger'} text="light" >
                                    <Card.Body>
                                        <div>
                                            <h3>{booking.user.display_name === null? `${booking.user.fname} ${booking.user.lname}`.trim():booking.user.display_name} ({currencyFormatter.format(booking.payments.total)})</h3>
                                            <ul className="list-group list-group-flush">
                                                {booking.services.map((service, index) => {
                                                    return (<li className="list-group-item bg-transparent text-light border-white ps-0" key={booking.id + 's' + index}>
                                                        {service.vendor_service.service} ({currencyFormatter.format(service.price)})<p className="small text-white-50 mb-0" style={{ marginTop: -4 }}>{service.employee.name}</p>
                                                    </li>);
                                                })
                                                }
                                                {booking.products.map((prod, index) => {
                                                    return (<li className="list-group-item bg-transparent text-light border-white ps-0" key={booking.id + 'p' + index}>
                                                        {prod.product.name} ({currencyFormatter.format(prod.price)})<p className="small text-white-50 mb-0" style={{ marginTop: -4 }}>{prod.employee.name}</p>
                                                    </li>);
                                                })
                                                }
                                            </ul>
                                        </div>
                                    </Card.Body>
                                    {
                                        booking.status?<Card.Footer className="w-100">
                                        <div className="text-start d-inline small">Without discount: {currencyFormatter.format(booking.payments.price)}</div>
                                        <div className="text-end d-inline small float-end">Discount: {currencyFormatter.format(booking.payments.discount)}</div>
                                    </Card.Footer>:
                                    <Card.Footer className="w-100">
                                        <div className="text-start d-inline small">Invoice Cancelled</div>
                                        <div className="text-end d-inline small float-end">Reason: {booking.cancel_reason}</div>
                                    </Card.Footer>
                                    }
                                    
                                </Card>
                            </Col>
                        );
                    })
                }
            </Row>
        </div>

    )
}
