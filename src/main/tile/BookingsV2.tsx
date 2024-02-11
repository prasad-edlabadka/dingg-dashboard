import { useContext, useEffect, useState } from "react";
import { Accordion, Col, Row } from "react-bootstrap";
import { currencyFormatter, formatDate, formatMobileNumber, formatTime } from "./Utility";
import * as Icon from 'react-bootstrap-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpa, faTicket, faMoneyBill1 } from "@fortawesome/free-solid-svg-icons";
import * as _ from "lodash";
import { TokenContext, API_BASE_URL } from "../../App";
import DiwaCard from "../../components/card/DiwaCard";
import BillItem from "./booking/BillItem";
import HeadingWithRefresh from "./booking/HeadingWithRefresh";
import { differenceInMonths, formatDistanceToNow, parse } from 'date-fns';
import JustHeading from "./booking/JustHeading";

export default function BookingsV2() {
    const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(false);
    const todayFlag = useState(true);
    const [today,] = todayFlag;
    const { callAPI } = useContext(TokenContext)
    const [customerDetails, setCustomerDetails] = useState([{ id: 0, user_histories: [{ amount_spend: 0, total_visit: 0 }] }] as Array<any>);
    const [members, setMembers] = useState([{ user_id: "", user: { fname: "", lname: "" }, last_visit: "", mobile: "" }]);

    const [bookingData, setBookingData] = useState([
        {
            customerName: "",
            start: "",
            end: "",
            status: -1,
            services: [{
                name: "",
                employee: ""
            }],
            billAmount: 0,
            customer: {
                totalBusiness: 0
            }
        }
    ]);
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
                    }
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
            "vouchers": [
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
                    "discount_id": null,
                    "discount_type": null,
                    "emp_share_on_redeem": 0,
                    "p_modes": null,
                    "tax_percent": null,
                    "tax_1_percent": null,
                    "tax_2_percent": null,
                    "voucher": {
                        "id": 89218,
                        "voucher_type": {
                            "id": 0,
                            "name": ""
                        }
                    },
                    "employee": {
                        "id": 0,
                        "name": ""
                    }
                }
            ],
            "tips": [
                {
                    "id": 0,
                    "bill_id": 0,
                    "employee_id": 0,
                    "suggested_amount": 0,
                    "received_amount": 0,
                    "is_settled": false,
                    "createdAt": "2023-05-15T07:52:43.523Z",
                    "updatedAt": "2023-05-15T07:52:43.523Z",
                    "employee": {
                        "id": 13350,
                        "name": "Jassi"
                    }
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
    const [groupedMembers, setGroupedMembers] = useState({});

    const statusColor = ["dark", "primary", "danger", "success", "dark", "primary", "dark", "warning", "warning"];
    const statusDesc = ["Unknown", "Start Serving", "Booking Cancelled", "Completed - Bill not generated", "Unknown", "Upcoming", "Confirmed", "Tentative", "Customer Arrived"];

    useEffect(() => {
        const bookingDate = today ? new Date() : new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        const loadAppointments = () => {
            const apiURL = `${API_BASE_URL}/calender/booking?date=${formatDate(bookingDate)}`;
            callAPI(apiURL, (data: any) => {
                if (!data) return;
                const groupedData = JSON.parse(JSON.stringify(_.groupBy(data.data, (b: { extendedProps: { user: { fname: any; lname: any; }; }; }) => {
                    return `${b.extendedProps.user.fname || ""} ${b.extendedProps.user.lname || ""}`.trim();
                }))) as Array<any>;

                setBookingData([]);
                customerDetails(data);
                loadMembers();
                setBookingData(Object.keys(groupedData).filter(v => !groupedData[v][0].extendedProps.book.bill)
                    .map(v => {
                        const data = groupedData[v];
                        const startDate = data.map((m: { start: any; }) => m.start).sort(function (a: string, b: string) {
                            return Date.parse(a) > Date.parse(b);
                        })[0];
                        const endDate = data.map((m: { end: any; }) => m.end).sort(function (a: string, b: string) {
                            return Date.parse(a) < Date.parse(b);
                        })[0];
                        const services: { name: any; employee: any; }[] = [];
                        let billAmount = 0;
                        data.forEach((d: { extendedProps: { book: { services: string; employee_name: any; }; }; }) => {
                            d.extendedProps.book.services.split(",").map((a: any) => {
                                billAmount += extractAmount(a);
                                services.push({
                                    name: a,
                                    employee: d.extendedProps.book.employee_name
                                });
                                return null;
                            });
                        });
                        return {
                            customerName: v,
                            start: startDate,
                            end: endDate,
                            status: data[0].extendedProps.book.status,
                            services: services,
                            billAmount: billAmount,
                            customer: {
                                totalBusiness: 0
                            }
                        }
                    }));
            });
        }

        const monthOld = 2;
        const loadMembers = () => {
            const memberURL = `${API_BASE_URL}/vendor/customer_list?page=1&limit=500&amount_start=0&membership_type=0&amount_start=0&is_multi_location=false`;
            callAPI(memberURL, (data: any) => {
                setMembers(data.data);
                const inactiveMembers = data.data.filter((v: { last_visit: string; }) => differenceInMonths(new Date(), parse(v.last_visit, 'yyyy-MM-dd', new Date())) > monthOld);
                setGroupedMembers(groupBy(inactiveMembers, (v: { last_visit: string; }) => (`${formatDistanceToNow(parse(v.last_visit, 'yyyy-MM-dd', new Date()), { addSuffix: true })}`)));
            });

        }
        const identifyMembers = (data: any) => {
            const updatedData = data.data.map((bill: any) => {
                const userId = bill.user.id;
                const isMember = members.some((member: { user_id: any; }) => member.user_id === userId);
                return {
                    ...bill,
                    user: {
                        ...bill.user,
                        is_member: isMember
                    }
                };
            });
            setLoading(false);
            setBillingData(updatedData);
        }

        const customerDetails = (data: any) => {
            const customerPromises = data.data.map((item: any) => {
                const customerURL = `${API_BASE_URL}/vendor/customer/detail?id=${item.extendedProps.user.id}&is_multi_location=false`;
                return new Promise((resolve) => {
                    callAPI(customerURL, (customerData: any) => {
                        resolve(customerData.data);
                    });
                });
            });

            Promise.all(customerPromises).then((customers) => {
                setCustomerDetails(customers);
            });
        }
        setLoading(true);
        const apiURL = `${API_BASE_URL}/vendor/bills?web=true&page=1&limit=1000&start=${formatDate(bookingDate)}&end=${formatDate(bookingDate)}&term=&is_product_only=`;
        callAPI(apiURL, (data: any) => {
            let counter = 0;
            if (!data) return;
            if (data.data.length === 0) {
                setLoading(false);
                setBillingData([]);
            } else {
                for (var billIndex in data.data) {
                    const bill = data.data[billIndex];
                    const billURL = `${API_BASE_URL}/bill?bill_id=${bill.id}`;
                    // eslint-disable-next-line no-loop-func
                    callAPI(billURL, (billData: any) => {
                        const { billSItems, billPItems, billmitem, billpkitem, billvitems, bill_tips, price, discount, tax, total } = billData.data;
                        bill.services = billSItems || [];
                        bill.products = billPItems || [];
                        bill.memberships = billmitem;
                        bill.packages = billpkitem;
                        bill.vouchers = billvitems;
                        bill.tips = bill_tips || [];
                        bill.payments = {
                            price,
                            discount,
                            tax,
                            total
                        };
                        counter++;
                        if (counter === data.data.length) {
                            setLoading(false);
                            identifyMembers(data);
                        }
                    });
                }
            }

        });

        loadAppointments();
    }, [callAPI, reload, today]);

    const extractAmount = (txt: string): number => {
        const indexOfSymbol = txt.indexOf("₹");
        if (indexOfSymbol < 0) return 0;
        let amountString = txt.substring(indexOfSymbol + 1);
        amountString = amountString.substring(0, amountString.length - 1);
        return parseFloat(amountString);
    }

    const refresh = () => {
        setLoading(true);
        setReload(!reload);
    }

    // eslint-disable-next-line no-sequences
    const groupBy = (x: any[], f: { (v: { last_visit: string; }): any; (arg0: any, arg1: any, arg2: any): string | number; }) => x.reduce((a, b, i) => ((a[f(b, i, x)] ||= []).push(b), a), {});

    type Varient = "danger" | "success" | "primary" | "warning" | "dark" | "indigo" | "purple";

    return (
        <div>
            <HeadingWithRefresh todayFlag={todayFlag} title1="Today's" title2="Yesterday's" title3=" Customers" onRefresh={() => refresh()} />

            <Row>
                {
                    billingData.length === 0 ? <Col xl={4} xs={12} className="gy-2">
                        <DiwaCard varient="primary" loadingTracker={loading}>
                            <h2>No customers yet</h2>
                        </DiwaCard>
                    </Col> :
                        billingData.map((booking, index) => {
                            const cust = customerDetails.find(v => v.id === booking.user.id)?.user_histories[0];
                            return (
                                <Col xl={4} xs={12} className="gy-2" key={"booking" + index}>
                                    <DiwaCard varient={booking.status ? 'success' : 'danger'} loadingTracker={loading}>
                                        <div>
                                            <h3>{booking.user.is_member ? <Icon.StarFill style={{ marginTop: -4, paddingRight: 4 }} color="gold" /> : ''}{`${booking.user.fname || ""} ${booking.user.lname || ""}`.trim()} ({currencyFormatter.format(booking.payments.total)})<p className="d-block small mb-0 text-color-50">
                                                Spent {currencyFormatter.format(cust?.amount_spend)} in {cust?.total_visit} visits with average of {currencyFormatter.format(cust?.amount_spend / cust?.total_visit)} per visit</p></h3>
                                            <div className="small"></div>
                                            <ul className="list-group list-group-flush">
                                                {booking.services.map((service, index) =>
                                                    <BillItem
                                                        key={booking.id + 's' + index}
                                                        uniqueKey={booking.id + 's' + index}
                                                        name={service.vendor_service.service}
                                                        employee={service.employee.name}
                                                        amount={service.price * service.qty}
                                                        discount={service.discount}
                                                        Icon={FontAwesomeIcon}
                                                        iconProps={{ icon: faSpa, className: "bill-item-icon" }} />
                                                )}
                                                {booking.products.map((prod, index) =>
                                                    <BillItem
                                                        key={booking.id + 'p' + index}
                                                        uniqueKey={booking.id + 'p' + index}
                                                        name={prod.product.name}
                                                        employee={prod.employee.name}
                                                        amount={prod.price}
                                                        discount={prod.discount}
                                                        Icon={Icon.BoxSeam}
                                                        iconProps={{ className: "bill-item-icon", style: { marginTop: -4 } }} />
                                                )}

                                                {booking.packages && (
                                                    <BillItem
                                                        key={booking.id + 'pk' + index}
                                                        uniqueKey={booking.id + 'pk' + index}
                                                        name={booking.packages.package.package_type.package_name}
                                                        employee={booking.packages.employee.name}
                                                        amount={booking.packages.price}
                                                        discount={booking.packages.discount}
                                                        Icon={Icon.UiChecksGrid}
                                                        iconProps={{ className: "bill-item-icon", style: { marginTop: -4 } }} />
                                                )}

                                                {booking.memberships && (
                                                    <BillItem
                                                        key={booking.id + 'm' + index}
                                                        uniqueKey={booking.id + 'm' + index}
                                                        name={booking.memberships.membership.membership_type.type}
                                                        employee={booking.memberships.employee.name}
                                                        amount={booking.memberships.price}
                                                        discount={booking.memberships.discount}
                                                        Icon={Icon.StarFill}
                                                        iconProps={{ className: "bill-item-icon", style: { marginTop: -4 } }} />
                                                )}

                                                {booking.vouchers.map((voucher, index) =>
                                                    <BillItem
                                                        key={booking.id + 'v' + index}
                                                        uniqueKey={booking.id + 'v' + index}
                                                        name={voucher.voucher.voucher_type.name}
                                                        employee={voucher.employee.name}
                                                        amount={voucher.price}
                                                        discount={voucher.discount}
                                                        Icon={FontAwesomeIcon}
                                                        iconProps={{ icon: faTicket, className: "bill-item-icon" }} />
                                                )}

                                                {booking.tips.map((tip, index) =>
                                                    <BillItem
                                                        key={booking.id + 'tip' + index}
                                                        uniqueKey={booking.id + 'tip' + index}
                                                        name={`Tip for ${tip.employee.name}`}
                                                        employee={''}
                                                        amount={tip.suggested_amount}
                                                        discount={0}
                                                        Icon={FontAwesomeIcon}
                                                        iconProps={{ icon: faMoneyBill1, className: "bill-item-icon" }} />
                                                )}
                                            </ul>
                                            <hr className="mt-1 mb-1" />
                                            <div className="w-100">
                                                {
                                                    booking.status ?
                                                        <>
                                                            <div className="text-start d-inline small align-top">Without discount: {currencyFormatter.format(booking.payments.price)}</div>
                                                            <div className="text-end d-inline small float-end align-top">Discount: {currencyFormatter.format(booking.payments.discount)} ({Math.round(booking.payments.discount * 100 / booking.payments.price)}%)</div>
                                                        </> :
                                                        <div className="text-start d-inline small">Cancellation Reason: {booking.cancel_reason}</div>
                                                }
                                            </div>
                                        </div>
                                    </DiwaCard>
                                </Col>
                            );
                        })
                }
            </Row>
            <Row>
                {
                    bookingData.map(booking => {
                        const varient = (statusColor[booking.status] || 'dark') as Varient;
                        return (
                            <Col xl={4} xs={12} className="gy-2" key={booking.customerName}>
                                <DiwaCard varient={varient} loadingTracker={loading}>
                                    <div>
                                        <h3>{booking.customerName} ({currencyFormatter.format(booking.billAmount)})</h3>
                                        <ul className="list-group list-group-flush">
                                            {booking.services.map(service => {
                                                return (<li className="list-group-item bg-transparent text-color border-color ps-0" key={booking.customerName + service.name}>
                                                    {service.name}<p className="small text-color-50 mb-0" style={{ marginTop: -4 }}>{service.employee}</p>
                                                </li>);
                                            })
                                            }
                                        </ul>
                                    </div>
                                    <hr className="mt-1 mb-1" />
                                    <div className="w-100">
                                        <div className="text-start d-inline small align-top">{statusDesc[booking.status] || "Unknown"}</div>
                                        <div className="text-end d-inline small float-end align-top">{formatTime(new Date(booking.start))} - {formatTime(new Date(booking.end))}</div>
                                    </div>
                                </DiwaCard>
                            </Col>
                        );
                    })
                }
            </Row>
            <Row>
                <Col>&nbsp;</Col>
            </Row>
            <JustHeading title1="Inactive Members" />
            <DiwaCard varient="primary" loadingTracker={loading}>
                {
                    Object.keys(groupedMembers).map((keyName, index) => {
                        const val = groupedMembers[keyName];
                        return (
                            <Accordion flush key={'stockitem' + index}>
                                <Accordion.Header className="w-100">
                                    <div className="w-100 pe-2 pb-2">
                                        <div className="text-start d-inline h5 text-color">Visited {keyName}</div>
                                        <div className="text-end d-inline float-end text-color">{val.length} members</div>
                                    </div>

                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul className="list-group list-group-flush">
                                        {
                                            val.map((item: any, index2: number) => {
                                                return (<li className="list-group-item bg-transparent text-color border-color ps-0" key={item.user.fname + 'inactive' + index2}>
                                                    <div className="d-flex justify-content-between">
                                                        <div>
                                                            {item.user.fname} {item.user.lname}
                                                        </div>
                                                        <div>
                                                            <p className={`small text-color-50 mb-0`} style={{ marginTop: -4 }}>Mobile: <a href={`tel:${formatMobileNumber(item.mobile)}`} className="text-color-50">{formatMobileNumber(item.mobile)}</a></p>
                                                        </div>
                                                    </div>
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
        </div>

    )
}
