import { useEffect, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import callAPI from "./Utility";
import * as Icon from 'react-bootstrap-icons';
import * as _ from "lodash";

export default function Bookings({ token, setToken }: { token: string, setToken: any }) {
    const formatter = Intl.NumberFormat('en-in', { style: "currency", currency: "INR", maximumFractionDigits: 0 });
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
            billAmount: 0
        }
    ]);
 
    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = () => {
        const apiURL = `https://api.dingg.app/api/v1/calender/booking?date=${formatDate(new Date())}`;
        //const apiURL = `https://api.dingg.app/api/v1/calender/booking?date=2022-12-18`
        callAPI(apiURL, token, setToken, (data: any) => {
            const groupedData = JSON.parse(JSON.stringify(_.groupBy(data.data, (b: { extendedProps: { user: { fname: any; lname: any; }; }; }) => {
                return `${b.extendedProps.user.fname} ${b.extendedProps.user.lname}`.trim();
            }))) as Array<any>;

            setBookingData(Object.keys(groupedData).map(v => {
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
                    billAmount: billAmount
                }
            }));
        });
    }

    const refresh = () => {
        loadData();
    }

    const statusColor = ["dark", "dark", "secondary", "success", "dark", "primary", "dark", "warning"];
    const statusDesc = ["dark", "dark", "Cancelled", "Completed", "dark", "Booked", "dark", "In Progress"];

    return (
        <div>
            <Row>
                <Col lg="12" xs="12">
                    <div className="position-relative today">
                        <h3 className="text-light">Today's Customers</h3>
                        <div className="position-absolute top-0 end-0" style={{ marginTop: -10 }}>
                            <Button variant="indigo" className="text-light mt-2" size="lg" onClick={() => refresh()}><Icon.ArrowClockwise /></Button>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row>
                {
                    bookingData.map(booking => {

                        return (
                            <Col xl={4} xs={12} className="gy-4">
                                <Card className="shadow" bg={statusColor[booking.status] || 'dark'} text="light" >
                                    <Card.Body>
                                        <div>
                                            <h3>{booking.customerName} ({formatter.format(booking.billAmount)})</h3>
                                            <ul className="list-group list-group-flush">
                                                {booking.services.map(service => {
                                                    return (<li className="list-group-item bg-transparent text-light border-white ps-0">
                                                        {service.name}<p className="small text-white-50 mb-0" style={{ marginTop: -4 }}>{service.employee}</p>
                                                    </li>);
                                                })
                                                }
                                            </ul>
                                        </div>
                                    </Card.Body>
                                    <Card.Footer className="w-100">
                                        <div className="text-start d-inline small">{statusDesc[booking.status] || "Unknown"}</div>
                                        <div className="text-end d-inline small float-end">{formatTime(new Date(booking.start))} - {formatTime(new Date(booking.end))}</div>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        );
                    })
                }
            </Row>
        </div>

    )
}

function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

function formatTime(dt: Date): string {
    return dt.toLocaleTimeString('en-GB', { hour12: true, hour: "2-digit", minute: "2-digit" });
}

function formatDate(dt: Date): string {
    return [dt.getFullYear(), padTo2Digits(dt.getMonth() + 1), padTo2Digits(dt.getDate())].join('-');
}

function extractAmount(txt: string): number {
    const indexOfSymbol = txt.indexOf("₹");
    if(indexOfSymbol < 0) return 0;
    let amountString = txt.substring(indexOfSymbol + 1);
    amountString = amountString.substring(0, amountString.length - 1);
    return parseFloat(amountString);
}