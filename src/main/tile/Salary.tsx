import { useEffect, useState } from "react";
import { Accordion, Button, Card, Form, Spinner } from "react-bootstrap";
import callAPI from "./Utility";
import * as Icon from 'react-bootstrap-icons';
import { read, utils, writeFile } from 'xlsx';

export default function Salary({ token, setToken }: { token: string, setToken: any }) {
    const [reportData, setReportData] = useState([{ itemsTotal: 0, "depth": 0, name: "", quantity: 0, cost: 0, low_qty: 0, items: [{ "depth": 0, name: "", quantity: 0, cost: 0, low_qty: 0 }] }]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(-1);
    const currFormatter = Intl.NumberFormat('en-in', { style: "currency", currency: "INR", maximumFractionDigits: 2 });
    const [selectedFile, setSelectedFile] = useState<FileList | null>(null);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = () => {
        setLoading(true);

    }

    const refresh = () => {
        loadData();
    }

    interface WBData {
        "User ID:": string;
        "Name": string;
        "Department": string;
    }

    const startRow = 4;
    const nameColumn = 11;
    const dateStartColumn = 1;
    const loadFile = (files: FileList | null) => {
        if (files !== null) {
            const file: File = files[0];
            const fileReader = new FileReader();
            fileReader.onloadend = (e: ProgressEvent<FileReader>) => {
                const wb = read(e.target?.result, {dense: true});
                const data = wb.Sheets[wb.SheetNames[0]]["!data"] || [[]];
                for(var i = startRow; i < data.length; i+=3) {
                    let record = {name: "", dates:[]};
                    record.name = data[i][nameColumn].v as string;
                    //console.log(`Employee Name: ${data[i][nameColumn].v}`);
                    for(var j=1;j<32;j++) {
                        let time = {start: "", end: ""};
                        const dateTimes = (data[i + 2] ||[])[j];
                        if(dateTimes) {
                            let dateTimesSplit = (dateTimes?.v as string).split("\n");
                            time.start = dateTimesSplit[0];
                            time.start = dateTimesSplit[1];
                            console.log(`Timing for '${j}': ${(dateTimes?.v as string).split("\n")}`);
                        } else {
                            console.log(`Timing for '${j}': Not available`);
                        }
                    }
                }
                console.log(data[startRow][nameColumn].v);
                console.log((data[startRow + 2][dateStartColumn]?.v as string).split("\n"))
                console.log(utils.sheet_to_json<WBData>(wb.Sheets[wb.SheetNames[0]]));
            };
            fileReader.readAsArrayBuffer(file);
        }
    }

    return (
        <Card className="shadow" bg="danger" text="light">
            <Card.Body>
                <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Choose Attendance File</Form.Label>
                    <Form.Control type="file" onChange={(e) => { loadFile((e.target as HTMLInputElement).files) }} />
                </Form.Group>
            </Card.Body>
        </Card>
    )
}
