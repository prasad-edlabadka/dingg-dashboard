import { useContext, useEffect, useState } from "react";
import { Accordion, Button, Card, Spinner } from "react-bootstrap";
import { currencyFormatter, formatDate } from "./Utility";
import * as Icon from 'react-bootstrap-icons';
import { TokenContext } from "../../App";


export default function Consumption() {
    const [reportData, setReportData] = useState({});
    const [loading, setLoading] = useState(true);
    const {callAPI} = useContext(TokenContext)

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // eslint-disable-next-line no-sequences
    const groupBy = (x: any[],f: { (v: string): any; (arg0: any, arg1: any, arg2: any): string | number; })=>x.reduce((a,b,i)=>((a[f(b,i,x)]||=[]).push(b),a),{});

    const loadData = () => {
        setLoading(true);
        
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${formatDate(new Date())}&report_type=product_consumption_log&locations=null&app_type=web`;
        //const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=2023-01-15&report_type=product_consumption_log&locations=null&app_type=web`;
        callAPI(apiURL, (data: any) => {
            let grouped = groupBy(data.data, (v: string) => (`${v["Category"]} - ${v["Sub Category"]}`));
            // for(let i in grouped) {
            //     grouped[i] = groupBy(grouped[i], (v: string) => v["Sub Category"]);
            // }
            setReportData(grouped);
            setLoading(false);
        });
    }

    const refresh = () => {
        loadData();
    }

    return (
        <Card className="shadow indigoBg" text="light">
            {
                loading ? <Card.Body><Spinner animation="grow" /></Card.Body> :
                    <Card.Body>
                        <div className="position-relative">
                            <h2>Today's Consumption</h2>
                            <div className="position-absolute top-0 end-0" style={{ marginTop: -10 }}>
                                <Button variant="indigo" className="text-light" size="lg" onClick={() => refresh()}><Icon.ArrowClockwise /></Button>
                            </div>
                        </div>

                        {
                           
                            Object.keys(reportData).map((keyName, index) => {
                                const val = reportData[keyName];
                                return (
                                    <Accordion flush key={'consumptionitem' + index}>
                                        <Accordion.Header className="w-100">
                                            <div  className="w-100 pe-2 pb-2">
                                                <div className="text-start d-inline h5">{keyName}</div>
                                                <div className="text-end d-inline float-end">{val.length} items</div>
                                            </div>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <ul className="list-group list-group-flush">
                                                {
                                                    val.map((item: { [x: string]: string }, index2: string) => {
                                                        return (<li className="list-group-item bg-transparent text-light border-white ps-0" key={keyName + 'item' + index2}>
                                                            {item["product name"]}<p className="small text-white-50 mb-0" style={{ marginTop: -4 }}>{item["consumed"]} of {item["total volume"]} consumed. {item["status"] === "CONSUMED"?`It is fully consumed. Cost: ${currencyFormatter.format(Number(item["purchase price"]))}`: ""}</p></li>
                                                    )})
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
}
