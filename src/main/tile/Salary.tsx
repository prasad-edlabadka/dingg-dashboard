import { useEffect, useState } from "react";
import { Accordion, Form, Card, Row, Col } from "react-bootstrap";
import { currencyFormatter, formatMinutes, nth } from "./Utility";
import { read } from 'xlsx';
import moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSmile, faCalendarDays, faCalendarXmark } from "@fortawesome/free-regular-svg-icons";
import { faArrowRightFromBracket, faArrowRightToBracket, faPersonWalkingArrowRight, faPersonRunning } from "@fortawesome/free-solid-svg-icons";

export default function Salary() {
    const [reportData, setReportData] = useState([{
        name: "",
        halfDays: [
            {
                day: 0,
                by: 0,
                time: "",
                ignored: false
            }
        ],
        lateDays: [
            {
                day: 0,
                by: 0,
                time: "",
                ignored: false
            }
        ],
        earlyExitDays: [
            {
                day: 0,
                by: 0,
                time: "",
                ignored: false
            }
        ],
        overTimeDays: [
            {
                day: 0,
                by: 0,
                time: "",
                ignored: false
            }
        ],
        missedEntry: [
            {
                day: 0,
                by: 0,
                time: "",
                ignored: false
            }
        ],
        dayOff: [
            {
                day: 0,
                ignored: false
            }
        ],
        workdays: 0,
        pay: 0,
        ot: 0
    }]);

    const [reportInfo, setReportInfo] = useState({ month: "", year: "2023", days: 0 })
    const [loading, setLoading] = useState(true);

    const staffTimings = {
        "RUTUJA": { actualStart: "10:00", lateMark: "10:15", halfDay: "10:30", actualEnd: "20:00", overTimeStart: "20:30", salary: 10000 },
        "PRASAD": { actualStart: "10:00", lateMark: "10:15", halfDay: "10:30", actualEnd: "20:00", overTimeStart: "20:30", salary: 18000 },
        "DEEPA": { actualStart: "11:00", lateMark: "11:15", halfDay: "11:30", actualEnd: "21:00", overTimeStart: "21:30", salary: 11500 },
        "ASHWINI": { actualStart: "11:00", lateMark: "11:15", halfDay: "11:30", actualEnd: "21:00", overTimeStart: "21:30", salary: 13000 },
        "JASSI": { actualStart: "11:00", lateMark: "11:15", halfDay: "11:30", actualEnd: "21:00", overTimeStart: "21:30", salary: 28000 },
        "POOJA": { actualStart: "10:00", lateMark: "10:15", halfDay: "10:30", actualEnd: "20:00", overTimeStart: "20:30", salary: 15000 },
        "ANAND": { actualStart: "10:00", lateMark: "10:15", halfDay: "10:30", actualEnd: "20:00", overTimeStart: "20:30", salary: 22000 },
    }
    const allowedOffDays = 4;
    const freeLateDays = 3;
    const lateMarkPenalty = 50;
    const overtimePaymentRate = 50;

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = () => {


    }

    const startRow = 4;
    const nameColumn = 11;
    const dateStartColumn = 1;
    let reportMonth = "";
    const loadFile = (files: FileList | null) => {
        if (files !== null) {

            console.log(files)
            const file: File = files[0];
            const fileReader = new FileReader();
            fileReader.onloadend = (e: ProgressEvent<FileReader>) => {
                const wb = read(e.target?.result, { dense: true });
                const data = wb.Sheets[wb.SheetNames[0]]["!data"] || [[]];
                const reportDate = moment((data[2][25].v as string).split(":")[1].split("~")[0], "yyyy-MM-dd");
                reportMonth = reportDate.format("MMMM");
                const calculatedData = [];
                for (let i = startRow; i < data.length; i += 3) {
                    if(!data[i][nameColumn]) {
                        console.log("Name not found. Incrementing i", i);
                        i-=2;
                        continue;
                    }
                    let record = { name: "", dates: [{}] };
                    record.name = data[i][nameColumn].v as string;
                    console.log(`Processing ${record.name}`);
                    if (staffTimings[record.name]) {
                        record.dates.pop();
                        for (let j = dateStartColumn; j < 32; j++) {
                            let time = { day: j, start: "", end: "" };
                            const dateTimes = (data[i + 2] || [])[j];
                            let additionalDateTime: string = (data[i + 3] || [])[j]?.v as string || '';
                            console.log(`additional time: ${additionalDateTime}:${JSON.stringify(dateTimes)}`)
                            additionalDateTime = additionalDateTime.trim().match(/^[0-2][0-3]:[0-5][0-9]$/)?additionalDateTime.trim():'';

                            if (dateTimes) {
                                let dateTimesSplit = (dateTimes?.v as string).split("\n");
                                time.start = dateTimesSplit[0];
                                time.end = additionalDateTime === ''?dateTimesSplit[dateTimesSplit.length - 1]:additionalDateTime;
                            }
                            record.dates.push(time);
                        }
                        console.log(record);
                        calculatedData.push(calculateSalary(record, reportDate.daysInMonth()));
                    } else {
                        console.log("Staff name not found", record.name);
                    }
                }
                setReportInfo({ month: reportMonth, days: reportDate.daysInMonth(), year: reportDate.format("yyyy") })
                setReportData(calculatedData);
                setLoading(false);
            };
            fileReader.readAsArrayBuffer(file);
        }
    }

    interface AdditionalTime {
        day: number;
        by: number;
        time: string;
        ignored: boolean;
    }

    interface OffDayStructure {
        day: number;
        ignored: boolean;
    }



    const calculateSalary = (record: { name: string; dates: {}[]; }, daysInMonth: number) => {
        const halfDayTime = moment(staffTimings[record.name]?.halfDay || "10:30", "HH:mm");
        const lateTime = moment(staffTimings[record.name]?.lateMark || "10:15", "HH:mm");
        const actualEndTime = moment(staffTimings[record.name]?.actualEnd || "20:00", "HH:mm");
        const overtimeStartTime = moment(staffTimings[record.name]?.overTimeStart || "20:30", "HH:mm");
        const halfDays: AdditionalTime[] = [];
        const lateDays: AdditionalTime[] = [];
        const overtimeDays: AdditionalTime[] = [];
        const earlyExit: AdditionalTime[] = [];
        const missedEntry: AdditionalTime[] = [];
        const dayOff: OffDayStructure[] = [];
        let lateDaysCount = 0;
        let missedEntryCount = 0;
        let offDaysCount = 0;
        for (const element of record.dates) {
            let dt = element as { day: number; start: string; end: string };
            const start = moment(dt.start, "HH:mm");
            const end = moment(dt.end, "HH:mm");

            //Missed punches
            if (dt.end === '' && dt.start !== '') {
                missedEntry.push({ day: dt.day, by: -1, time: "Missing Out Time", ignored: missedEntryCount < 1 });
                missedEntryCount++;
                continue;
            } else if (dt.end !== '' && dt.start === '') {
                missedEntry.push({ day: dt.day, by: -1, time: "Missing In Time", ignored: missedEntryCount < 1 });
                missedEntryCount++;
                continue;
            }

            //Off days
            if (dt.end === '' && dt.start === '') {
                dayOff.push({ day: dt.day, ignored: offDaysCount < allowedOffDays });
                offDaysCount++;
                continue;
            }

            //Late marks
            if (start.isAfter(halfDayTime)) {
                halfDays.push({ day: dt.day, by: start.diff(halfDayTime, "minutes"), time: dt.start, ignored: (lateDaysCount < freeLateDays) });
                console.log(lateDaysCount, dt.day);
                lateDaysCount++;
            } else if (start.isAfter(lateTime)) {
                lateDays.push({ day: dt.day, by: start.diff(lateTime, "minutes"), time: dt.start, ignored: (lateDaysCount < freeLateDays) });
                console.log(lateDaysCount, dt.day);
                lateDaysCount++;
            }


            if (end.isBefore(actualEndTime)) {
                earlyExit.push({ day: dt.day, by: actualEndTime.diff(end, "minutes"), time: dt.end, ignored: false });
                continue;
            }
            if (end.isAfter(overtimeStartTime)) {
                overtimeDays.push({ day: dt.day, by: end.diff(overtimeStartTime, "minutes"), time: dt.end, ignored: false });
            }
        }
        let presentDays = daysInMonth;

        //deduct leaves
        let presentDaysWithLateDays = presentDays - (dayOff.filter(v => !v.ignored).length)
        //deduct half days
        presentDaysWithLateDays -= (halfDays.filter(v => !v.ignored).length / 2);
        //deduct early exits
        presentDaysWithLateDays -= (earlyExit.filter(v => !v.ignored).length / 2);
        //deduct missed punches
        presentDaysWithLateDays -= (missedEntry.filter(v => !v.ignored).length / 2);

        let pay = ((staffTimings[record.name]?.salary || 0) / daysInMonth) * presentDaysWithLateDays;

        //deduct late marks
        pay -= (lateDays.filter(v => !v.ignored).length * lateMarkPenalty);

        //Calculate overtime
        let otPay = 0;
        for (const element of overtimeDays) {
            otPay += (Math.ceil(element.by / 30) * overtimePaymentRate);
        }
        pay += otPay

        console.log(`${record.name} should be paid ${currencyFormatter.format(pay)} including overtime of ${currencyFormatter.format(otPay)}`);

        return { name: record.name, workdays: presentDays, dayOff: dayOff, missedEntry: missedEntry, halfDays: halfDays, lateDays: lateDays, earlyExitDays: earlyExit, overTimeDays: overtimeDays, pay: pay, ot: otPay };
    }

    const getHalfDaySalary = (baseSal: number) => {
        return (baseSal / reportInfo.days) * 0.5;
    }

    return (
        <Card className="shadow" text="light" bg="primary">
            <Card.Body>
                <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Choose Attendance File</Form.Label>
                    <Form.Control type="file" onChange={(e) => { loadFile((e.target as HTMLInputElement).files) }} />
                </Form.Group>
                {loading ? '' : <><h3>Salary Calculation for {reportInfo.month} {reportInfo.year}<p className="small text-white-50">Total: {currencyFormatter.format(reportData.reduce((v: any, current) => v + current.pay, 0))}</p></h3>
                    {reportData.map((val) => {
                        return (<Accordion flush key={val.name}>
                            <Accordion.Header className="w-100">
                                <div className="w-100 pe-2 pb-2">
                                    <div className="text-start d-inline h5 text-capitalize">{val.name.toLowerCase()}<span className="small text-white-50"> including overtime of {currencyFormatter.format(val.ot)}</span> </div>
                                    <div className="text-end d-inline float-end">{currencyFormatter.format(val.pay)}</div>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item bg-transparent text-light border-white ps-0" key={val.name + 'item1present'}>
                                        <div><FontAwesomeIcon icon={faCalendarDays} />&nbsp;    {`Salary for ${reportInfo.days - val.dayOff.filter(v => !v.ignored).length} days (including ${val.dayOff.filter(v => v.ignored).length} offs + ${val.dayOff.filter(v => !v.ignored).length} leaves)`}</div>
                                        <div><FontAwesomeIcon icon={faPersonRunning} />&nbsp;    {`Late Mark for ${val.lateDays.length} days (${val.lateDays.filter(v => v.ignored).length} days ignored)`}</div>
                                        <div><FontAwesomeIcon icon={faArrowRightToBracket} />&nbsp;    {`Half Days for ${val.halfDays.length} days (${val.halfDays.filter(v => v.ignored).length} days ignored)`}</div>
                                        <div><FontAwesomeIcon icon={faArrowRightFromBracket} />&nbsp;    {`Early Exit for ${val.earlyExitDays.length} days`}</div>
                                        <div><FontAwesomeIcon icon={faPersonWalkingArrowRight} />&nbsp;    {`Missed attendance for ${val.missedEntry.length} days (${val.missedEntry.filter(v => v.ignored).length} days ignored)`}</div>
                                        <div><FontAwesomeIcon icon={faFaceSmile} />&nbsp;    {`Overtime for ${val.overTimeDays.length} days`}</div>
                                    </li>

                                    <li className="list-group-item bg-transparent text-light border-white ps-0" key={val.name + 'item2present'}>
                                        <Row>
                                            <Col xs="8">Base salary</Col>
                                            <Col xs="4" className="text-end">{currencyFormatter.format(staffTimings[val.name].salary)}</Col>
                                        </Row>
                                        <Row>
                                            <Col xs="6">Overtime</Col>
                                            <Col xs="6" className="text-end">+ {currencyFormatter.format(val.ot)}</Col>
                                        </Row>
                                        <Row>
                                            <Col xs="6">Leaves Deduction</Col>
                                            <Col xs="6" className="text-end">- {currencyFormatter.format(val.dayOff.filter(v => !v.ignored).length * getHalfDaySalary(staffTimings[val.name].salary) * 2)}</Col>
                                        </Row>
                                        <Row>
                                            <Col xs="8">Late Mark</Col>
                                            <Col xs="4" className="text-end">- {currencyFormatter.format(val.lateDays.filter(v => !v.ignored).length * lateMarkPenalty)}</Col>
                                        </Row>
                                        <Row>
                                            <Col xs="9">Half Day - Late Arrival</Col>
                                            <Col xs="3" className="text-end">- {currencyFormatter.format(val.halfDays.filter(v => !v.ignored).length * getHalfDaySalary(staffTimings[val.name].salary))}</Col>
                                        </Row>
                                        <Row>
                                            <Col xs="9">Half Day - Early Exit</Col>
                                            <Col xs="3" className="text-end">- {currencyFormatter.format(val.earlyExitDays.filter(v => !v.ignored).length * getHalfDaySalary(staffTimings[val.name].salary))}</Col>
                                        </Row>
                                        <Row>
                                            <Col xs="9">Half Day - Missed Entry</Col>
                                            <Col xs="3" className="text-end">- {currencyFormatter.format(val.missedEntry.filter(v => !v.ignored).length * getHalfDaySalary(staffTimings[val.name].salary))}</Col>
                                        </Row>
                                        <Row>
                                            <Col xs="8"><strong>Total</strong></Col>
                                            <Col xs="4" className="text-end"><strong>{currencyFormatter.format(val.pay)}</strong></Col>
                                        </Row>
                                    </li>

                                    {
                                        val.dayOff.map((item) => {
                                            return (<li className="list-group-item bg-transparent text-light border-white ps-0" key={val.name + 'item1' + item.day}>
                                                <FontAwesomeIcon icon={faCalendarXmark} className="text-danger" /><span className={item.ignored ? 'text-decoration-line-through' : ''}>  {`Took day off on ${item.day}`}<sup>{nth(item.day)}</sup></span></li>
                                            )
                                        })
                                    }
                                    {
                                        val.missedEntry.map((item) => {
                                            return (<li className="list-group-item bg-transparent text-light border-white ps-0" key={val.name + 'item2' + item.day}>
                                                <FontAwesomeIcon icon={faPersonWalkingArrowRight} className="text-danger" /><span className={item.ignored ? 'text-decoration-line-through' : ''}>  {`Missed puch-in or punch-out on ${item.day}`}<sup>{nth(item.day)}</sup></span><p className="small text-white-50 mb-0" style={{ marginTop: -4 }}>{item.time}</p></li>
                                            )
                                        })
                                    }
                                    {
                                        val.lateDays.map((item) => {
                                            return (<li className="list-group-item bg-transparent text-light border-white ps-0" key={val.name + 'item2' + item.day}>
                                                <FontAwesomeIcon icon={faArrowRightToBracket} className="text-danger" /><span className={item.ignored ? 'text-decoration-line-through' : ''}>  {`Was late on ${item.day}`}<sup>{nth(item.day)}</sup> {`by ${formatMinutes(item.by)}`}</span><p className="small text-white-50 mb-0" style={{ marginTop: -4 }}>Entry at {item.time}</p></li>
                                            )
                                        })
                                    }
                                    {
                                        val.halfDays.map((item) => {
                                            return (<li className="list-group-item bg-transparent text-light border-white ps-0" key={val.name + 'item3' + item.day}>
                                                <FontAwesomeIcon icon={faArrowRightToBracket} className="text-danger" /><span className={item.ignored ? 'text-decoration-line-through' : ''}>  {`Was very late (half-day) on ${item.day}`}<sup>{nth(item.day)}</sup> {`by ${formatMinutes(item.by)}`}</span><p className="small text-white-50 mb-0" style={{ marginTop: -4 }}>Entry at {item.time}</p></li>
                                            )
                                        })
                                    }
                                    {
                                        val.earlyExitDays.map((item) => {
                                            return (<li className="list-group-item bg-transparent text-light border-white ps-0" key={val.name + 'item4' + item.day}>
                                                <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-danger" /><span className={item.ignored ? 'text-decoration-line-through' : ''}>  {`Left early on ${item.day}`}<sup>{nth(item.day)}</sup> {`by ${formatMinutes(item.by)}`}</span><p className="small text-white-50 mb-0" style={{ marginTop: -4 }}>Exit at {item.time}</p></li>
                                            )
                                        })
                                    }
                                    {
                                        val.overTimeDays.map((item) => {
                                            return (<li className="list-group-item bg-transparent text-light border-white ps-0" key={val.name + 'item2' + item.day}>
                                                <FontAwesomeIcon icon={faFaceSmile} className="text-warning" />  {`Did overtime on ${item.day}`}<sup>{nth(item.day)}</sup> {`for ${formatMinutes(item.by)}`}<p className="small text-white-50 mb-0" style={{ marginTop: -4 }}>Exit at {item.time}</p></li>
                                            )
                                        })
                                    }
                                </ul>

                            </Accordion.Body>
                        </Accordion>)
                    })}
                </>}
            </Card.Body>
        </Card>
    )
}
