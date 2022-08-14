import { useEffect, useState } from "react";
import { Card, Col, ProgressBar, Row, Spinner } from "react-bootstrap";
import callAPI from "./Utility";

export default function Staff({ token, setToken }: { token: string, setToken: any }) {
    const [reportData, setReportData] = useState({ data: [{ total: 0, stylist: "" }] });
    const [total, setTotal] = useState(-1);

    useEffect(() => {
        const date = new Date();
        const lastMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const startDate = formatDate(lastMonthDate);
        const endDate = formatDate(date);
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${startDate}&end_date=${endDate}&report_type=staff_by_all&app_type=web`;
        callAPI(apiURL, token, setToken, (data: any) => {
            setReportData(data);
            calculateToday(data);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const calculateToday = (data = reportData) => {
        const len = data.data.length;
        let sum = 0;
        for (let i = 0; i < len; i++) {
            sum += data.data[i].total;
        }
        setTotal(sum);
    }

    return (
        <Card className="shadow" style={{backgroundColor:"indigo"}} text="light">
            {
                total === -1 ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                    <Card.Body>
                            <h3>Staff Sale This Month</h3>
                            {
                                reportData.data.map(val => {
                                    return(<Row>
                                        <Col sm={4}>{val.stylist}</Col>
                                        <Col sm={4} className="mt-2"> <ProgressBar now={Math.round(val.total * 100 / total)} style={{height: 6}} variant="danger"/></Col>
                                        <Col sm={4}>{Intl.NumberFormat('en-in', {style:"currency", currency:"INR"}).format(val.total)}</Col>
                                    </Row>)
                                })
                            }
                    </Card.Body>
            }

        </Card>
    )
}

function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

function formatDate(dt: Date): string {
    return [dt.getFullYear(), padTo2Digits(dt.getMonth() + 1), padTo2Digits(dt.getDate())].join('-');
}