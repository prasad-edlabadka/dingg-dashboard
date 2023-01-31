import { SetStateAction, useEffect, useState } from "react";
import { Button, Card, Col, Row, Spinner } from "react-bootstrap";
import callAPI, { currencyFormatter, formatDate } from "./Utility";
import * as Icon from 'react-bootstrap-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpa } from "@fortawesome/free-solid-svg-icons";

export default function BookingsV2({ token, setToken }: { token: string, setToken: any }) {
    const [loading, setLoading] = useState(true);
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
                is_member: false
            },
            "products": [
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
            "memberships":
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
                "membership": {
                    id: 0,
                    membership_type: {
                        id: 0,
                        type: ""
                    }
                },
                "bill_service_splits": []
            },
            "packages": {
                "id": 0,
                "employee_id": 0,
                "price": 0,
                "qty": 0,
                "discount": 0,
                "tax": 0,
                "total": 0,
                "net": 0,
                "paid": 0,
                "redeem": 0,
                "discount_id": null,
                "discount_type": null,
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
                "package": {
                    "id": 0,
                    "package_type": {
                        "id": 0,
                        "package_name": ""
                    }
                },
                "employee": {
                    "id": 0,
                    "name": ""
                }
            },
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
        setLoading(true);
        const apiURL = `https://api.dingg.app/api/v1/vendor/bills?web=true&page=1&limit=1000&start=${formatDate(new Date())}&end=${formatDate(new Date())}&term=&is_product_only=`;
        //const apiURL = `https://api.dingg.app/api/v1/vendor/bills?web=true&page=1&limit=1000&start=2023-01-22&end=2023-01-22&term=&is_product_only=`
        callAPI(apiURL, token, setToken, (data: any) => {
            let counter = 0;
            if (data.data.length === 0) {
                setLoading(false);
                setBillingData([]);
            } else {
                for (var billIndex in data.data) {
                    const bill = data.data[billIndex];
                    const billURL = `https://api.dingg.app/api/v1//bill?bill_id=${bill.bill_payments[0].bill_id}`;
                    // eslint-disable-next-line no-loop-func
                    callAPI(billURL, token, setToken, (billData: any) => {
                        bill.services = billData.data.billSItems || [];
                        bill.products = billData.data.billPItems || [];
                        bill.memberships = billData.data.billmitem;
                        bill.packages = billData.data.billpkitem;
                        bill.payments = {};
                        bill.payments.price = billData.data.price;
                        bill.payments.discount = billData.data.discount;
                        bill.payments.tax = billData.data.tax;
                        bill.payments.total = billData.data.total;
                        counter++;
                        if (counter === data.data.length) {
                            setLoading(false);
                            identifyMembers(data);
                        }
                    });
                }
            }

        });
    }

    const identifyMembers = (data: { data: SetStateAction<{ id: number; selected_date: string; bill_number: string; total: number; paid: number; payment_status: string; status: boolean; cancel_reason: string; net: number; tax: number; roundoff: number; user: { id: number; fname: string; lname: string; display_name: string; mobile: string; is_member: boolean; }; products: { employee_id: number; price: number; qty: number; discount: number; tax: number; total: number; net: number; paid: number; redeem: number; discount_id: string; discount_type: string; emp_share_on_redeem: number; p_modes: { amount: number; payment_mode: number; }[]; product_lot_id: string; tax_percent: number; tax_1_percent: number; tax_2_percent: number; product: { id: string; name: string; sac_code: number; }; employee: { id: number; name: string; }; product_lot: null; }[]; services: { id: number; price: number; qty: number; discount: number; tax: number; total: number; net: number; paid: number; redeem: number; discount_id: string; discount_type: string; emp_share_on_redeem: number; p_modes: { amount: number; payment_mode: number; }[]; tax_percent: number; tax_1_percent: number; tax_2_percent: number; employee: { id: number; name: string; }; vendor_service: { id: number; service: string; service_time: string; sub_category: { sac_code: string; }; }; bill_service_splits: never[]; }[]; memberships: { id: number; price: number; qty: number; discount: number; tax: number; total: number; net: number; paid: number; redeem: number; discount_id: string; discount_type: string; emp_share_on_redeem: number; p_modes: { amount: number; payment_mode: number; }[]; tax_percent: number; tax_1_percent: number; tax_2_percent: number; employee: { id: number; name: string; }; membership: { id: number; membership_type: { id: number; type: string; }; }; bill_service_splits: never[]; }; packages: { id: number; employee_id: number; price: number; qty: number; discount: number; tax: number; total: number; net: number; paid: number; redeem: number; discount_id: null; discount_type: null; emp_share_on_redeem: number; p_modes: { amount: number; payment_mode: number; }[]; tax_percent: number; tax_1_percent: number; tax_2_percent: number; package: { id: number; package_type: { id: number; package_name: string; }; }; employee: { id: number; name: string; }; }; payments: { price: number; discount: number; tax: number; total: number; }; bill_payments: { id: number; bill_id: number; payment_date: string; payment_mode: number; amount: number; redemption: boolean; note: string; vendor_location_id: string; createdAt: string; updatedAt: string; }[]; }[]>; }) => {

        const memberURL = `https://api.dingg.app/api/v1//vendor/customer_list?page=1&limit=500&amount_start=0&membership_type=0&amount_start=0&is_multi_location=false`;
        callAPI(memberURL, token, setToken, (memberData: any) => {
            for (var billIndex in data.data) {
                const userId = data.data[billIndex].user.id;
                const member = memberData.data.find((v: { user_id: any; }) => v.user_id === userId);
                if (member) {
                    data.data[billIndex].user.is_member = true;
                } else {
                    data.data[billIndex].user.is_member = false;
                }
            }
            setLoading(false);
            setBillingData(data.data);
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
                    billingData.length === 0 ? <Col xl={4} xs={12} className="gy-4"><Card className="shadow" bg="primary" text="light"><Card.Body><h2>{loading ? 'Fetching customer list' : 'No customers yet.'}</h2></Card.Body></Card></Col> :
                        billingData.map((booking, index) => {
                            return (
                                <Col xl={4} xs={12} className="gy-4" key={"booking" + index}>
                                    <Card className="shadow" bg={booking.status ? 'success' : 'danger'} text="light" >
                                        {
                                            loading ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                                                <Card.Body>
                                                    <div>
                                                        <h3>{booking.user.is_member ? <Icon.StarFill style={{ marginTop: -4, paddingRight: 4 }} color="gold" /> : ''}{booking.user.display_name || `${booking.user.fname || ""} ${booking.user.lname || ""}`.trim()} ({currencyFormatter.format(booking.payments.total)})</h3>
                                                        <ul className="list-group list-group-flush">
                                                            {booking.services.map((service, index) => {
                                                                return (<li className="list-group-item bg-transparent text-light border-white ps-0" key={booking.id + 's' + index}>
                                                                    <FontAwesomeIcon icon={faSpa} className="text-warning" />  {service.vendor_service.service}<p className="small text-white-50 mb-0" style={{ marginTop: -3, marginLeft: "1.38rem" }}>{service.employee.name} - {currencyFormatter.format(service.price)}</p>
                                                                </li>);
                                                            })
                                                            }
                                                            {booking.products.map((prod, index) => {
                                                                return (<li className="list-group-item bg-transparent text-light border-white ps-0" key={booking.id + 'p' + index}>
                                                                    <Icon.BoxSeam style={{ marginTop: -4 }} color="gold" />  {prod.product.name}<p className="small text-white-50 mb-0 ms-4" style={{ marginTop: -4 }}>{prod.employee.name} - {currencyFormatter.format(prod.price)}</p>
                                                                </li>);
                                                            })
                                                            }
                                                            {booking.packages !== null ?
                                                                <li className="list-group-item bg-transparent text-light border-white ps-0" key={booking.id + 'pk' + index}>
                                                                    <Icon.UiChecksGrid style={{ marginTop: -4 }} color="gold" />  {booking.packages.package.package_type.package_name}<p className="small text-white-50 mb-0" style={{ marginTop: -4, marginLeft: "1.37rem" }}>{booking.packages.employee.name} - {currencyFormatter.format(booking.packages.price)}</p>
                                                                </li> : ''
                                                            }
                                                            {booking.memberships !== null ?
                                                                <li className="list-group-item bg-transparent text-light border-white ps-0" key={booking.id + 'm' + index}>
                                                                    <Icon.StarFill style={{ marginTop: -4 }} color="gold" />  {booking.memberships.membership.membership_type.type}<p className="small text-white-50 mb-0 ms-4" style={{ marginTop: -4 }}>{booking.memberships.employee.name} - {currencyFormatter.format(booking.memberships.price)}</p>
                                                                </li> : ''
                                                            }
                                                        </ul>
                                                    </div>
                                                </Card.Body>
                                        }
                                        {
                                            !loading ? (
                                                booking.status ? <Card.Footer className="w-100">
                                                    <div className="text-start d-inline small">Without discount: {currencyFormatter.format(booking.payments.price)}</div>
                                                    <div className="text-end d-inline small float-end">Discount: {currencyFormatter.format(booking.payments.discount)} ({Math.round(booking.payments.discount * 100 / booking.payments.price)}%)</div>
                                                </Card.Footer> :
                                                    <Card.Footer className="w-100">
                                                        <div className="text-start d-inline small">Cancellation Reason: {booking.cancel_reason}</div>
                                                    </Card.Footer>) : ''
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
