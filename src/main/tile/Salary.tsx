import { useEffect, useState } from "react";
import { Accordion, Form, Row, Col } from "react-bootstrap";
import { currencyFormatter, formatMinutes, nth } from "./Utility";
import { read, utils } from "xlsx";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSmile, faCalendarDays, faCalendarXmark } from "@fortawesome/free-regular-svg-icons";
import {
  faArrowRightFromBracket,
  faArrowRightToBracket,
  faPersonWalkingArrowRight,
  faPersonRunning,
} from "@fortawesome/free-solid-svg-icons";
import DiwaCard from "../../components/card/DiwaCard";
import jsonData from "./example.json";

export default function Salary() {
  const [reportData, setReportData] = useState([
    {
      name: "",
      halfDays: [
        {
          day: 0,
          by: 0,
          time: "",
          ignored: false,
        },
      ],
      lateDays: [
        {
          day: 0,
          by: 0,
          time: "",
          ignored: false,
        },
      ],
      earlyExitDays: [
        {
          day: 0,
          by: 0,
          time: "",
          ignored: false,
        },
      ],
      overTimeDays: [
        {
          day: 0,
          by: 0,
          time: "",
          ignored: false,
        },
      ],
      missedEntry: [
        {
          day: 0,
          by: 0,
          time: "",
          ignored: false,
        },
      ],
      dayOff: [
        {
          day: 0,
          ignored: false,
        },
      ],
      workdays: 0,
      pay: 0,
      ot: 0,
    },
  ]);

  const [reportInfo, setReportInfo] = useState({ month: "", year: "2023", days: 0 });
  const [loading, setLoading] = useState(true);

  const staffTimings = {
    DEEPA: {
      actualStart: "10:30",
      lateMark: "10:45",
      halfDay: "12:00",
      actualEnd: "20:30",
      overTimeStart: "21:00",
      salary: 16500,
    },
    ASHWINI: {
      actualStart: "11:00",
      lateMark: "11:15",
      halfDay: "11:30",
      actualEnd: "21:00",
      overTimeStart: "21:30",
      salary: 18000,
    },
    JASSI: {
      actualStart: "11:00",
      lateMark: "11:15",
      halfDay: "11:30",
      actualEnd: "21:00",
      overTimeStart: "21:30",
      salary: 38000,
    },
    AFSHAR2: {
      actualStart: "10:00",
      lateMark: "10:15",
      halfDay: "10:30",
      actualEnd: "20:00",
      overTimeStart: "20:30",
      salary: 25000,
    },
    AKANKSHA: {
      actualStart: "10:00",
      lateMark: "10:15",
      halfDay: "10:30",
      actualEnd: "20:00",
      overTimeStart: "20:30",
      salary: 20000,
    },
    NEHA: {
      actualStart: "11:00",
      lateMark: "11:15",
      halfDay: "11:30",
      actualEnd: "21:00",
      overTimeStart: "21:30",
      salary: 10000,
    },
    RIZWAN: {
      actualStart: "10:00",
      lateMark: "10:15",
      halfDay: "10:30",
      actualEnd: "20:00",
      overTimeStart: "20:30",
      salary: 19000,
    },
    "SOBIYA HK": {
      actualStart: "10:00",
      lateMark: "10:15",
      halfDay: "10:30",
      actualEnd: "20:00",
      overTimeStart: "20:30",
      salary: 13000,
    },
  };
  const allowedOffDays = 4;
  const freeLateDays = 3;
  const lateMarkPenalty = 50;
  const overtimePaymentRate = 50;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = () => {};

  interface ParsedData {
    v: string | number;
    t: string;
    w: string;
  }

  interface Employee {
    userId: string;
    name: string;
    department: string;
    timings: { [day: number]: string };
  }

  const startRow = 4;
  const nameColumn = 1;
  const dateStartColumn = 1;
  let reportMonth = "";
  // Function to convert Excel time to HH:MM format
  function convertExcelTime(excelTime: number): string {
    const totalMinutes = Math.round(excelTime * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }

  const loadFile = (files: FileList | null) => {
    if (files !== null) {
      console.log(files);
      const file: File = files[0];
      const fileReader = new FileReader();
      fileReader.onloadend = (e: ProgressEvent<FileReader>) => {
        const workbook = read(e.target?.result, { dense: true });
        const wb = workbook;

        // Ignore the first two sheets, and process the remaining sheets
        const attendanceSheets = workbook.SheetNames.slice(2);

        // Create an empty array to hold attendance records
        const attendanceRecords: Array<{ employee_name: string; date: string; in_time: string; out_time: string }> = [];

        // Iterate through each attendance sheet
        attendanceSheets.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const sheetJson: any[] = utils.sheet_to_json(sheet, { header: 1 });

          // Extract employee names from specific cells
          const employeeNames = [sheetJson[3][9], sheetJson[3][24], sheetJson[3][39]];

          // Extract month and year from specific cells
          const monthYearValues = [sheetJson[4][1], sheetJson[4][16], sheetJson[4][31]];

          // Iterate through each row to gather attendance details (from row 13 to 43)
          for (let i = 12; i <= 42; i++) {
            const row = sheetJson[i];
            const dates = [row[0], row[15], row[30]]; // Columns A, P, AE for dates

            employeeNames.forEach((employeeName, index) => {
              if (employeeName && dates[index]) {
                const datePart = dates[index].split(" ")[0]; // Extract the date part before the space
                const [year, month, day] = monthYearValues[index].split("~")[0].split("-");
                const fullDate = `${year}-${month}-${datePart}`; // Combine date w

                const times = index === 0 ? row.slice(1, 13) : index === 1 ? row.slice(16, 28) : row.slice(31, 43);
                const availableTimes = times.filter((time: any) => time);

                if (availableTimes.length > 0) {
                  const inTime = availableTimes[0];
                  const outTime = availableTimes[availableTimes.length - 1];

                  attendanceRecords.push({
                    employee_name: employeeName,
                    date: fullDate,
                    in_time: convertExcelTime(inTime),
                    out_time: convertExcelTime(outTime),
                  });
                }
              }
            });
          }
        });

        // Convert the list to JSON
        const attendanceJson = JSON.stringify(attendanceRecords, null, 2);
        console.log(attendanceJson);
        const records: any[] = [];
        Object.keys(staffTimings).forEach((key) => {
          const record = calculate(attendanceRecords, key);
          if (record != null) {
            records.push(record);
          }
        });
        setReportData(records);
        setLoading(false);

        // const data = wb.Sheets[wb.SheetNames[0]]["!data"] || [[]];
        // console.log(JSON.stringify(data));
        // const reportDate = moment((data[1][0].v as string).split(":")[1].split("~")[0], "yyyy-MM-dd");
        // reportMonth = reportDate.format("MMMM");
        // const calculatedData = [];
        // for (let i = startRow; i < data.length; i += 3) {
        //   console.log("Value is", data[i][nameColumn], i);
        //   if (!data[i][nameColumn]) {
        //     console.log("Name not found. Incrementing i", i);
        //     i -= 2;
        //     continue;
        //   }
        //   let record = { name: "", dates: [{}] };
        //   record.name = data[i][nameColumn].v as string;
        //   console.log(`Processing ${record.name}`);
        //   if (staffTimings[record.name]) {
        //     record.dates.pop();
        //     for (let j = dateStartColumn; j < 32; j++) {
        //       let time = { day: j, start: "", end: "" };
        //       const dateTimes = (data[i] || [])[j];
        //       console.log(`Processing ${record.name} on ${i}, ${j}, ${JSON.stringify(dateTimes)}`);
        //       let additionalDateTime: string = ((data[i + 3] || [])[j]?.v as string) || "";
        //       console.log(`additional time: ${additionalDateTime}:${JSON.stringify(dateTimes)}`);
        //       additionalDateTime = additionalDateTime.trim().match(/^[0-2][0-3]:[0-5][0-9]$/)
        //         ? additionalDateTime.trim()
        //         : "";

        //       if (dateTimes) {
        //         let dateTimesSplit = (dateTimes?.v as string).split("\n");
        //         time.start = dateTimesSplit[0];
        //         time.end = additionalDateTime === "" ? dateTimesSplit[dateTimesSplit.length - 1] : additionalDateTime;
        //       }
        //       record.dates.push(time);
        //     }
        //     console.log(record);
        //     calculatedData.push(calculateSalary(record, reportDate.daysInMonth()));
        //   } else {
        //     console.log("Staff name not found", record.name);
        //   }
        // }
        // setReportInfo({ month: reportMonth, days: reportDate.daysInMonth(), year: reportDate.format("yyyy") });
        // setReportData(calculatedData);
        // setLoading(false);
      };
      fileReader.readAsArrayBuffer(file);
    }
  };

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

  const calculate = (data: any, empName: string) => {
    let halfDay = 0;
    let lateMark = 0;
    let overTime = 0;
    let earlyExit = 0;

    let halfDays = [];
    let lateDays = [];
    let overTimeDays = [];
    let earlyExitDays = [];
    let missedEntry: any[] = [];
    let dayOff: any[] = [];

    const sortedData = data
      .sort((a: any, b: any) => {
        return a.employee_name.localeCompare(b.employee_name);
      })
      .filter((v: any) => v.employee_name == empName);

    if (sortedData.length === 0) {
      return null;
    }

    for (const emp of sortedData as {
      employee_name: keyof typeof staffTimings;
      in_time: string;
      out_time: string;
      date: string;
    }[]) {
      const halfDayTime = moment(staffTimings[emp.employee_name]?.halfDay || "10:30", "HH:mm");
      if (moment(emp.in_time, "HH:mm").isAfter(halfDayTime)) {
        // console.log(`Found half day for ${emp.employee_name} as ${emp.in_time} on ${emp.date}`);
        halfDay++;
        halfDays.push({
          day: moment(emp.date, "YYYY-MM-DD").date(),
          by: moment(emp.in_time, "HH:mm").diff(halfDayTime, "minutes"),
          time: emp.in_time,
          ignored: false,
        });
        halfDay++;
      }
      if (moment(emp.in_time, "HH:mm").isAfter(moment(staffTimings[emp.employee_name]?.lateMark || "10:15", "HH:mm"))) {
        // console.log(`Found late mark for ${emp.employee_name} as ${emp.in_time} on ${emp.date}`);
        lateMark++;
        lateDays.push({
          day: moment(emp.date, "YYYY-MM-DD").date(),
          by: moment(emp.in_time, "HH:mm").diff(
            moment(staffTimings[emp.employee_name]?.lateMark || "10:15", "HH:mm"),
            "minutes"
          ),
          time: emp.in_time,
          ignored: lateMark < freeLateDays,
        });
      }
      if (
        moment(emp.out_time, "HH:mm").isAfter(
          moment(staffTimings[emp.employee_name]?.overTimeStart || "21:30", "HH:mm")
        )
      ) {
        // console.log(`Found overtime for ${emp.employee_name} as ${emp.out_time} on ${emp.date}`);
        overTime++;
        overTimeDays.push({
          day: moment(emp.date, "YYYY-MM-DD").date(),
          by: moment(emp.out_time, "HH:mm").diff(
            moment(staffTimings[emp.employee_name]?.overTimeStart || "21:30", "HH:mm"),
            "minutes"
          ),
          time: emp.out_time,
          ignored: false,
        });
      }
      if (
        moment(emp.out_time, "HH:mm").isBefore(moment(staffTimings[emp.employee_name]?.actualEnd || "21:00", "HH:mm"))
      ) {
        // console.log(`Found early exit for ${emp.employee_name} as ${emp.out_time} on ${emp.date}`);
        earlyExit++;
        earlyExitDays.push({
          day: moment(emp.date, "YYYY-MM-DD").date(),
          by: moment(staffTimings[emp.employee_name]?.actualEnd || "21:00", "HH:mm").diff(
            moment(emp.out_time, "HH:mm"),
            "minutes"
          ),
          time: emp.out_time,
          ignored: false,
        });
      }
    }
    // console.log("Half day", halfDay);
    // console.log("Late mark", lateMark);
    // console.log("Overtime", overTime);
    // console.log("Early exit", earlyExit);
    // console.log("Sorted data", sortedData);
    const daysInMonth = moment(sortedData[0].date, "YYYY-MM-DD").daysInMonth();
    let dayOffCount = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      //   console.log(
      //     "Checking for",
      //     i,
      //     sortedData.find((v: any) => {
      //       console.log(v.date, moment(v.date, "YYYY-MM-DD"), i);
      //       return moment(v.date, "YYYY-MM-DD").date() === i;
      //     })
      //   );
      let found = sortedData.find((v: any) => moment(v.date, "YYYY-MM-DD").date() === i) ? true : false;
      //   console.log("Checking for", i, found);
      if (!found) {
        dayOffCount++;
        dayOff.push({ day: i, by: 0, time: "", ignored: dayOffCount <= allowedOffDays });
      }
    }

    sortedData.forEach((v: any) => {
      if (v.in_time === "" && v.out_time !== "") {
        missedEntry.push({ day: moment(v.date, "YYYY-MM-DD").date(), by: 0, time: "Missing In Time", ignored: false });
      } else if (v.in_time !== "" && v.out_time === "") {
        missedEntry.push({ day: moment(v.date, "YYYY-MM-DD").date(), by: 0, time: "Missing Out Time", ignored: false });
      }
    });

    let presentDays = daysInMonth;

    //deduct leaves
    let presentDaysWithLateDays = presentDays - dayOff.filter((v) => !v.ignored).length;
    //deduct half days
    presentDaysWithLateDays -= halfDays.filter((v) => !v.ignored).length / 2;
    //deduct early exits
    presentDaysWithLateDays -= earlyExitDays.filter((v) => !v.ignored).length / 2;
    //deduct missed punches
    presentDaysWithLateDays -= missedEntry.filter((v) => !v.ignored).length / 2;

    let pay = ((staffTimings[empName]?.salary || 0) / daysInMonth) * presentDaysWithLateDays;

    //deduct late marks
    pay -= lateDays.filter((v) => !v.ignored).length * lateMarkPenalty;

    //Calculate overtime
    let otPay = 0;
    for (const element of overTimeDays) {
      otPay += Math.ceil(element.by / 30) * overtimePaymentRate;
    }
    pay += otPay;

    console.log(
      `${empName} should be paid ${currencyFormatter.format(pay)} including overtime of ${currencyFormatter.format(
        otPay
      )}`
    );

    const report = {
      name: empName,
      halfDays,
      lateDays,
      earlyExitDays,
      overTimeDays,
      missedEntry,
      dayOff,
      workdays: presentDays,
      pay: pay,
      ot: otPay,
    };
    // console.log("Report", report);
    // setReportData([report]);
    // console.log("Missed puches", moment(sortedData[0].date, "YYYY-MM-DD").daysInMonth() - sortedData.length);
    // console.log(sortedData);
    // console.log(sortedData[0].date);
    setReportInfo({
      month: moment(sortedData[0].date, "YYYY-MM-DD").format("MMMM"),
      year: moment(sortedData[0].date, "YYYY-MM-DD").format("yyyy"),
      days: moment(sortedData[0].date, "YYYY-MM-DD").daysInMonth(),
    });
    return report;
  };

  const calculateSalary = (record: { name: string; dates: {}[] }, daysInMonth: number) => {
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
      if (dt.end === "" && dt.start !== "") {
        missedEntry.push({ day: dt.day, by: -1, time: "Missing Out Time", ignored: missedEntryCount < 1 });
        missedEntryCount++;
        continue;
      } else if (dt.end !== "" && dt.start === "") {
        missedEntry.push({ day: dt.day, by: -1, time: "Missing In Time", ignored: missedEntryCount < 1 });
        missedEntryCount++;
        continue;
      }

      //Off days
      if (dt.end === "" && dt.start === "") {
        dayOff.push({ day: dt.day, ignored: offDaysCount < allowedOffDays });
        offDaysCount++;
        continue;
      }

      //Late marks
      if (start.isAfter(halfDayTime)) {
        halfDays.push({
          day: dt.day,
          by: start.diff(halfDayTime, "minutes"),
          time: dt.start,
          ignored: lateDaysCount < freeLateDays,
        });
        console.log(lateDaysCount, dt.day);
        lateDaysCount++;
      } else if (start.isAfter(lateTime)) {
        lateDays.push({
          day: dt.day,
          by: start.diff(lateTime, "minutes"),
          time: dt.start,
          ignored: lateDaysCount < freeLateDays,
        });
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
    let presentDaysWithLateDays = presentDays - dayOff.filter((v) => !v.ignored).length;
    //deduct half days
    presentDaysWithLateDays -= halfDays.filter((v) => !v.ignored).length / 2;
    //deduct early exits
    presentDaysWithLateDays -= earlyExit.filter((v) => !v.ignored).length / 2;
    //deduct missed punches
    presentDaysWithLateDays -= missedEntry.filter((v) => !v.ignored).length / 2;

    let pay = ((staffTimings[record.name]?.salary || 0) / daysInMonth) * presentDaysWithLateDays;

    //deduct late marks
    pay -= lateDays.filter((v) => !v.ignored).length * lateMarkPenalty;

    //Calculate overtime
    let otPay = 0;
    for (const element of overtimeDays) {
      otPay += Math.ceil(element.by / 30) * overtimePaymentRate;
    }
    pay += otPay;

    console.log(
      `${record.name} should be paid ${currencyFormatter.format(pay)} including overtime of ${currencyFormatter.format(
        otPay
      )}`
    );

    return {
      name: record.name,
      workdays: presentDays,
      dayOff: dayOff,
      missedEntry: missedEntry,
      halfDays: halfDays,
      lateDays: lateDays,
      earlyExitDays: earlyExit,
      overTimeDays: overtimeDays,
      pay: pay,
      ot: otPay,
    };
  };

  const getHalfDaySalary = (baseSal: number) => {
    return (baseSal / reportInfo.days) * 0.5;
  };

  return (
    <DiwaCard varient={"primary"} loadingTracker={false}>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label className="text-color">Choose Attendance File</Form.Label>
        <Form.Control
          type="file"
          onChange={(e) => {
            loadFile((e.target as HTMLInputElement).files);
          }}
        />
      </Form.Group>
      {loading ? (
        ""
      ) : (
        <>
          <h3 className="text-color">
            Salary Calculation for {reportInfo.month} {reportInfo.year}
            <p className="small text-color-50 mt-1">
              Total: {currencyFormatter.format(reportData.reduce((v: any, current) => v + current.pay, 0))}
            </p>
          </h3>
          {reportData.map((val) => {
            return (
              <Accordion flush key={val.name}>
                <Accordion.Header className="w-100 text-color">
                  <div className="w-100 pe-2 pb-2">
                    <div className="text-start d-inline h5 text-capitalize text-color">
                      {val.name.toLowerCase()}
                      <span className="small text-color-50">
                        {" "}
                        including overtime of {currencyFormatter.format(val.ot)}
                      </span>{" "}
                    </div>
                    <div className="text-end d-inline float-end text-color">{currencyFormatter.format(val.pay)}</div>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <ul className="list-group list-group-flush">
                    <li
                      className="list-group-item bg-transparent text-color border-color ps-0"
                      key={val.name + "item1present"}
                    >
                      <div>
                        <FontAwesomeIcon icon={faCalendarDays} />
                        &nbsp;{" "}
                        {`Salary for ${reportInfo.days - val.dayOff.filter((v) => !v.ignored).length} days (including ${
                          val.dayOff.filter((v) => v.ignored).length
                        } offs + ${val.dayOff.filter((v) => !v.ignored).length} leaves)`}
                      </div>
                      <div>
                        <FontAwesomeIcon icon={faPersonRunning} />
                        &nbsp;{" "}
                        {`Late Mark for ${val.lateDays.length} days (${
                          val.lateDays.filter((v) => v.ignored).length
                        } days ignored)`}
                      </div>
                      <div>
                        <FontAwesomeIcon icon={faArrowRightToBracket} />
                        &nbsp;{" "}
                        {`Half Days for ${val.halfDays.length} days (${
                          val.halfDays.filter((v) => v.ignored).length
                        } days ignored)`}
                      </div>
                      <div>
                        <FontAwesomeIcon icon={faArrowRightFromBracket} />
                        &nbsp; {`Early Exit for ${val.earlyExitDays.length} days`}
                      </div>
                      <div>
                        <FontAwesomeIcon icon={faPersonWalkingArrowRight} />
                        &nbsp;{" "}
                        {`Missed attendance for ${val.missedEntry.length} days (${
                          val.missedEntry.filter((v) => v.ignored).length
                        } days ignored)`}
                      </div>
                      <div>
                        <FontAwesomeIcon icon={faFaceSmile} />
                        &nbsp; {`Overtime for ${val.overTimeDays.length} days`}
                      </div>
                    </li>

                    <li
                      className="list-group-item bg-transparent text-color border-color ps-0"
                      key={val.name + "item2present"}
                    >
                      <Row>
                        <Col xs="8">Base salary</Col>
                        <Col xs="4" className="text-end">
                          {currencyFormatter.format(staffTimings[val.name].salary)}
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="6">Overtime</Col>
                        <Col xs="6" className="text-end">
                          + {currencyFormatter.format(val.ot)}
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="6">Leaves Deduction</Col>
                        <Col xs="6" className="text-end">
                          -{" "}
                          {currencyFormatter.format(
                            val.dayOff.filter((v) => !v.ignored).length *
                              getHalfDaySalary(staffTimings[val.name].salary) *
                              2
                          )}
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="8">Late Mark</Col>
                        <Col xs="4" className="text-end">
                          - {currencyFormatter.format(val.lateDays.filter((v) => !v.ignored).length * lateMarkPenalty)}
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="9">Half Day - Late Arrival</Col>
                        <Col xs="3" className="text-end">
                          -{" "}
                          {currencyFormatter.format(
                            val.halfDays.filter((v) => !v.ignored).length *
                              getHalfDaySalary(staffTimings[val.name].salary)
                          )}
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="9">Half Day - Early Exit</Col>
                        <Col xs="3" className="text-end">
                          -{" "}
                          {currencyFormatter.format(
                            val.earlyExitDays.filter((v) => !v.ignored).length *
                              getHalfDaySalary(staffTimings[val.name].salary)
                          )}
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="9">Half Day - Missed Entry</Col>
                        <Col xs="3" className="text-end">
                          -{" "}
                          {currencyFormatter.format(
                            val.missedEntry.filter((v) => !v.ignored).length *
                              getHalfDaySalary(staffTimings[val.name].salary)
                          )}
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="8">
                          <strong>Total</strong>
                        </Col>
                        <Col xs="4" className="text-end">
                          <strong>{currencyFormatter.format(val.pay)}</strong>
                        </Col>
                      </Row>
                    </li>

                    {val.dayOff.map((item) => {
                      return (
                        <li
                          className="list-group-item bg-transparent text-color border-color ps-0"
                          key={val.name + "item1" + item.day}
                        >
                          <FontAwesomeIcon icon={faCalendarXmark} className="text-danger" />
                          <span className={item.ignored ? "text-decoration-line-through" : ""}>
                            {" "}
                            {`Took day off on ${item.day}`}
                            <sup>{nth(item.day)}</sup>
                          </span>
                        </li>
                      );
                    })}
                    {val.missedEntry.map((item) => {
                      return (
                        <li
                          className="list-group-item bg-transparent text-color border-color ps-0"
                          key={val.name + "item2" + item.day}
                        >
                          <FontAwesomeIcon icon={faPersonWalkingArrowRight} className="text-danger" />
                          <span className={item.ignored ? "text-decoration-line-through" : ""}>
                            {" "}
                            {`Missed puch-in or punch-out on ${item.day}`}
                            <sup>{nth(item.day)}</sup>
                          </span>
                          <p className="small text-color-50 mb-0" style={{ marginTop: -4 }}>
                            {item.time}
                          </p>
                        </li>
                      );
                    })}
                    {val.lateDays.map((item) => {
                      return (
                        <li
                          className="list-group-item bg-transparent text-color border-color ps-0"
                          key={val.name + "item2" + item.day}
                        >
                          <FontAwesomeIcon icon={faArrowRightToBracket} className="text-danger" />
                          <span className={item.ignored ? "text-decoration-line-through" : ""}>
                            {" "}
                            {`Was late on ${item.day}`}
                            <sup>{nth(item.day)}</sup> {`by ${formatMinutes(item.by)}`}
                          </span>
                          <p className="small text-color-50 mb-0" style={{ marginTop: -4 }}>
                            Entry at {item.time}
                          </p>
                        </li>
                      );
                    })}
                    {val.halfDays.map((item) => {
                      return (
                        <li
                          className="list-group-item bg-transparent text-color border-color ps-0"
                          key={val.name + "item3" + item.day}
                        >
                          <FontAwesomeIcon icon={faArrowRightToBracket} className="text-danger" />
                          <span className={item.ignored ? "text-decoration-line-through" : ""}>
                            {" "}
                            {`Was very late (half-day) on ${item.day}`}
                            <sup>{nth(item.day)}</sup> {`by ${formatMinutes(item.by)}`}
                          </span>
                          <p className="small text-color-50 mb-0" style={{ marginTop: -4 }}>
                            Entry at {item.time}
                          </p>
                        </li>
                      );
                    })}
                    {val.earlyExitDays.map((item) => {
                      return (
                        <li
                          className="list-group-item bg-transparent text-color border-color ps-0"
                          key={val.name + "item4" + item.day}
                        >
                          <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-danger" />
                          <span className={item.ignored ? "text-decoration-line-through" : ""}>
                            {" "}
                            {`Left early on ${item.day}`}
                            <sup>{nth(item.day)}</sup> {`by ${formatMinutes(item.by)}`}
                          </span>
                          <p className="small text-color-50 mb-0" style={{ marginTop: -4 }}>
                            Exit at {item.time}
                          </p>
                        </li>
                      );
                    })}
                    {val.overTimeDays.map((item) => {
                      return (
                        <li
                          className="list-group-item bg-transparent text-color border-color ps-0"
                          key={val.name + "item2" + item.day}
                        >
                          <FontAwesomeIcon icon={faFaceSmile} className="text-warning" />{" "}
                          {`Did overtime on ${item.day}`}
                          <sup>{nth(item.day)}</sup> {`for ${formatMinutes(item.by)}`}
                          <p className="small text-color-50 mb-0" style={{ marginTop: -4 }}>
                            Exit at {item.time}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </Accordion.Body>
              </Accordion>
            );
          })}
        </>
      )}
    </DiwaCard>
  );
}
