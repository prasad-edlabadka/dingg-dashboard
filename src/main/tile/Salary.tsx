import { useContext, useState } from "react";
import { Accordion, Form, Row, Col, Spinner } from "react-bootstrap";
import { currencyFormatter, formatDate, formatMinutes, nth } from "./Utility";
import { read, utils } from "xlsx";
import moment, { Moment } from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSmile, faCalendarDays, faCalendarXmark } from "@fortawesome/free-regular-svg-icons";
import {
  faArrowRightFromBracket,
  faArrowRightToBracket,
  faPersonWalkingArrowRight,
  faPersonRunning,
  faHourglassEnd,
} from "@fortawesome/free-solid-svg-icons";
import DiwaCard from "../../components/card/DiwaCard";
// import jsonData from "./example.json";
import nameMapping from "../../NameMapping.json";
import { AttendanceRecord, EmployeeSalary, ReportInfo, StaffTiming } from "./SalaryInterfaces";
import { TokenContext, API_BASE_URL } from "../../App";
import { addDays, addMinutes, endOfMonth, isBefore, startOfMonth } from "date-fns";

export default function Salary() {
  const { callAPIPromise } = useContext(TokenContext);
  const [reportData, setReportData] = useState<EmployeeSalary[]>([]);

  const [reportInfo, setReportInfo] = useState<ReportInfo>({ month: "", year: "", days: 0 });
  const [loading, setLoading] = useState(false);
  const [staffShiftData, setStaffShiftData] = useState<any[]>([]);

  const allowedOffDays = 4;
  const freeLateDays = 3;
  const lateMarkPenalty = 50;
  const overtimePaymentRate = 50;
  const longDayPayment = 200;
  const defaultSalary = 100000;

  // Function to convert Excel time to HH:MM format
  function convertExcelTime(excelTime: number): string {
    const totalMinutes = Math.round(excelTime * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }

  const formatTime = (time: string | Moment): string => {
    if (typeof time === "string") {
      return time;
    } else {
      return time.format("HH:mm");
    }
  };

  const loadFile = (files: FileList | null) => {
    if (files !== null) {
      console.log(files);
      setLoading(true);
      const file: File = files[0];
      const fileReader = new FileReader();
      fileReader.onloadend = (e: ProgressEvent<FileReader>) => {
        const workbook = read(e.target?.result, { dense: true });

        // Ignore the first two sheets, and process the remaining sheets
        const attendanceSheets = workbook.SheetNames.slice(2);

        // Create an empty array to hold attendance records
        const attendanceRecords: Array<AttendanceRecord> = [];

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
                const [year, month] = monthYearValues[index].split("~")[0].split("-");
                const fullDate = `${year}-${month}-${datePart}`; // Combine date w

                const times = index === 0 ? row.slice(1, 13) : index === 1 ? row.slice(16, 28) : row.slice(31, 43);
                const availableTimes = times.filter((time: any) => time);

                if (availableTimes.length > 0) {
                  const inTime = availableTimes[0];
                  const outTime = availableTimes.length > 1 ? availableTimes[availableTimes.length - 1] : "";

                  attendanceRecords.push({
                    employee_name: nameMapping[employeeName as keyof typeof nameMapping],
                    date: fullDate,
                    in_time: inTime !== "" ? convertExcelTime(inTime) : "",
                    out_time: outTime !== "" ? convertExcelTime(outTime) : "",
                  });
                }
              }
            });
          }
        });

        // Convert the list to JSON
        console.log(attendanceRecords);
        populateRecords(attendanceRecords);
        setLoading(false);
      };
      fileReader.readAsArrayBuffer(file);
    }
  };

  const processData = (data: any, salaryData: any) => {
    const shiftData = data;
    const outputData: any[] = [];
    shiftData.forEach((shift: any) => {
      if (outputData.find((v: any) => v.name === shift.name)) {
        const index = outputData.findIndex((v: any) => v.name === shift.name);
        outputData[index].schedule.push(...getSchedule(shift.schedule));
      } else {
        const salaryInfo = salaryData.find((v: any) => v.name === shift.name);
        outputData.push({
          name: shift.name,
          paidLeaves: salaryInfo?.paid_leaves || allowedOffDays,
          salary: salaryInfo?.base_salary || defaultSalary,
          incentive: salaryInfo?.incentiveBase * 0.1 || 0,
          schedule: [...getSchedule(shift.schedule)],
        });
      }
    });

    setStaffShiftData(outputData);
    console.log(outputData);
    return outputData;
  };

  const getSchedule = (shedule: any) => {
    const schedule = shedule.map((v: any) => {
      const start =
        v?.schedule_shifts && v.schedule_shifts[0]?.start_hour && minutesToTimeString(v.schedule_shifts[0].start_hour);
      const end =
        v?.schedule_shifts && v.schedule_shifts[0]?.end_hour && minutesToTimeString(v.schedule_shifts[0].end_hour);
      const actualStart = moment(start, "HH:mm");
      const actualEnd = moment(end, "HH:mm");
      return {
        date: v.date,
        actualStart: actualStart,
        actualEnd: actualEnd,
        halfDay: moment(addMinutes(actualStart.toDate(), 30), "HH:mm"),
        lateMark: moment(addMinutes(actualStart.toDate(), 15), "HH:mm"),
        overTimeStart: moment(addMinutes(actualEnd.toDate(), 30), "HH:mm"),
      };
    });
    return schedule;
  };

  const minutesToTimeString = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = mins < 10 ? `0${mins}` : mins;
    return `${formattedHours}:${formattedMinutes}`;
  };

  const populateRecords = async (attendanceRecords: AttendanceRecord[]) => {
    attendanceRecords = attendanceRecords.map((v) => {
      return {
        ...v,
        in_time: v.in_time !== "" ? moment(v.in_time, "HH:mm") : v.in_time,
        out_time: v.out_time !== "" ? moment(v.out_time, "HH:mm") : v.out_time,
      };
    });

    let startDate = startOfMonth(moment(attendanceRecords[0].date, "YYYY-MM-DD").toDate());
    let endOfMonthDate = endOfMonth(startDate);

    let staffShifs: any[] = [];

    while (isBefore(startDate, endOfMonthDate)) {
      const shiftAPIURL = `${API_BASE_URL}/employee/roaster?start_date=${formatDate(startDate)}`;
      const shiftDetails = await callAPIPromise(shiftAPIURL);
      shiftDetails.data.forEach((v: any) => {
        staffShifs.push(v);
      });
      console.log(shiftDetails, startDate);
      startDate = addDays(startDate, 7);
    }

    const employeeListURL = `${API_BASE_URL}/employees/get`;
    const employees = await callAPIPromise(employeeListURL);
    const employeeSalaryDetails = await Promise.all(
      employees.data.map(async (employee: any) => {
        const employeeSalaryURL = `${API_BASE_URL}/employee/setting?employee_id=${employee.id}`;
        const employeeSalary = await callAPIPromise(employeeSalaryURL);
        if (employeeSalary.message === "No data found.") {
          return null;
        }
        employeeSalary.data.name = employee.name;
        return employeeSalary.data;
      })
    );

    let filteredEmployeeSalaryDetails = employeeSalaryDetails.filter((v) => v != null);

    startDate = startOfMonth(endOfMonthDate);

    const empList = filteredEmployeeSalaryDetails.map((v) => v.employee_id).join(",");
    const dinggCalculatedAPIURL = `${API_BASE_URL}/vendor/target/all?employee_ids=${empList}&time_type=monthly&start_date=${formatDate(
      startDate
    )}&end_date=${formatDate(endOfMonthDate)}`;

    const staffTargets = await callAPIPromise(dinggCalculatedAPIURL);
    console.log("Filtered emp", filteredEmployeeSalaryDetails);
    filteredEmployeeSalaryDetails = filteredEmployeeSalaryDetails.map((v) => {
      const selectedStaff = staffTargets.data.find((s: any) => s.employee_id === v.employee_id);
      if (selectedStaff) {
        console.log(
          "Selected staff",
          selectedStaff,
          "v is",
          v,
          "incentive",
          selectedStaff.service_sales_achieved - selectedStaff.total_sales
        );
        const sales = Number.parseFloat(selectedStaff.service_sales_achieved);
        const target = Number.parseFloat(selectedStaff.total_sales);
        v.incentiveBase = sales - target > 0 ? sales - target : 0;
      } else {
        v.incetiveBase = 0;
      }

      return v;
    });

    console.log("Enriched llist", filteredEmployeeSalaryDetails);

    const staffShiftData = processData(staffShifs, filteredEmployeeSalaryDetails);

    const records: EmployeeSalary[] = [];
    staffShiftData.forEach((staff: StaffTiming) => {
      console.log("Calculating for ", staff.name);
      const record = calculate(attendanceRecords, staff);
      if (record != null) {
        records.push(record);
      }
    });
    setReportData(records);
    setLoading(false);
  };

  const calculate = (data: AttendanceRecord[], staff: StaffTiming) => {
    let lateMark = 0;

    let halfDays = [];
    let lateDays = [];
    let overTimeDays = [];
    let earlyExitDays = [];
    let missedEntry: any[] = [];
    let dayOff: any[] = [];
    let longDays: any[] = [];

    const employeeData: AttendanceRecord[] = data.filter((v) => v.employee_name === staff.name);

    //If employee data doesn't exist, return. No salary calculation can be done.
    if (employeeData.length === 0) {
      console.log("No data found for ", staff.name, data);
      return null;
    }

    for (const empRecord of employeeData) {
      const day = moment(empRecord.date, "YYYY-MM-DD").date();
      //Let's extract shift timings for this date
      const shift = staff.schedule.find((v) => v.date === empRecord.date);
      if (!shift) {
        console.log("No shift found for ", staff.name, " on ", empRecord.date);
        continue;
      }
      //Let's calculate half days.
      if (empRecord.in_time !== "" && (empRecord.in_time as Moment).isAfter(shift.halfDay)) {
        // console.log(`Found half day for ${emp.employee_name} as ${emp.in_time} on ${emp.date}`);
        halfDays.push({
          day: day,
          by: (empRecord.in_time as Moment).diff(shift.halfDay, "minutes"),
          time: formatTime(empRecord.in_time),
          ignored: false,
        });
      } else if (empRecord.in_time !== "" && (empRecord.in_time as Moment).isAfter(shift.lateMark)) {
        //Let's calculate late marks.
        // console.log(`Found late mark for ${emp.employee_name} as ${emp.in_time} on ${emp.date}`);
        lateMark++;
        lateDays.push({
          day: day,
          by: (empRecord.in_time as Moment).diff(shift.lateMark, "minutes"),
          time: formatTime(empRecord.in_time),
          ignored: lateMark <= freeLateDays,
        });
      }

      //Let's calculate overtime.
      if (empRecord.out_time !== "" && (empRecord.out_time as Moment).isAfter(shift.overTimeStart)) {
        //12 hours work means direct 200 payment.
        console.log(
          "Long day calculation for ",
          staff.name,
          (empRecord.out_time as Moment).diff(empRecord.in_time, "hours")
        );
        if ((empRecord.out_time as Moment).diff(empRecord.in_time, "hours") >= 12) {
          console.log("Found long day for ", staff.name, " on ", empRecord.date);
          longDays.push({
            day: day,
            by: (empRecord.out_time as Moment).diff(empRecord.in_time, "hours"),
            time: `from ${formatTime(empRecord.in_time)} to ${formatTime(empRecord.out_time)}`,
            ignored: false,
          });
        } else {
          // console.log(`Found overtime for ${emp.employee_name} as ${emp.out_time} on ${emp.date}`);
          overTimeDays.push({
            day: day,
            by: (empRecord.out_time as Moment).diff(shift.overTimeStart, "minutes"),
            time: formatTime(empRecord.out_time),
            ignored: false,
          });
        }
      }

      //Let's calculate early exit.
      if (empRecord.out_time !== "" && (empRecord.out_time as Moment).isBefore(shift.actualEnd)) {
        //Check if in time was early as well. This is due to change of shift on certain days.
        if (empRecord.in_time !== "" && !(empRecord.in_time as Moment).isBefore(shift.actualStart)) {
          earlyExitDays.push({
            day: day,
            by: (shift.actualEnd as Moment).diff(empRecord.out_time, "minutes"),
            time: formatTime(empRecord.out_time),
            ignored: false,
          });
        }

        //Chec for missing in and out timings
        if (empRecord.in_time === "" && empRecord.out_time !== "") {
          missedEntry.push({
            day: day,
            by: 0,
            time: "Missing In Time",
            ignored: false,
          });
        } else if (empRecord.in_time !== "" && empRecord.out_time === "") {
          missedEntry.push({
            day: day,
            by: 0,
            time: "Missing Out Time",
            ignored: false,
          });
        }
        // console.log(`Found early exit for ${emp.employee_name} as ${emp.out_time} on ${emp.date}`);
      }
    }

    const daysInMonth = moment(employeeData[0].date, "YYYY-MM-DD").daysInMonth();
    let dayOffCount = 0;
    //Check for days off
    for (let i = 1; i <= daysInMonth; i++) {
      let found = employeeData.find((v) => moment(v.date, "YYYY-MM-DD").date() === i) ? true : false;
      if (!found) {
        dayOffCount++;
        dayOff.push({ day: i, by: 0, time: "", ignored: dayOffCount <= staff.paidLeaves });
      }
    }

    let presentDays = daysInMonth;

    //deduct leaves
    let presentDaysWithLateDays = presentDays - dayOff.filter((v) => !v.ignored).length;
    //deduct half days
    presentDaysWithLateDays -= halfDays.filter((v) => !v.ignored).length / 2;
    //deduct early exits
    presentDaysWithLateDays -= earlyExitDays.filter((v) => !v.ignored).length / 2;
    //deduct missed punches
    presentDaysWithLateDays -= missedEntry.filter((v) => !v.ignored).length / 2;

    console.log("Total payable days for ", staff.name, " is ", presentDaysWithLateDays);
    let pay = (staff.salary / daysInMonth) * presentDaysWithLateDays;

    console.log("Total payable for ", staff.name, " is ", pay);
    //deduct late marks
    pay -= lateDays.filter((v) => !v.ignored).length * lateMarkPenalty;
    console.log("Total payable for ", staff.name, " after late marks is ", pay);

    //Calculate overtime
    let otPay = 0;
    for (const element of overTimeDays) {
      otPay += Math.ceil(element.by / 30) * overtimePaymentRate;
    }
    pay += otPay;
    console.log("Total payable for ", staff.name, " after overtime is ", pay, ". Overtime is ", otPay);

    //Calculate long days
    pay += longDays.length * longDayPayment;
    console.log(
      "Total payable for ",
      staff.name,
      " after long days is ",
      pay,
      ". Long days payment is ",
      longDays.length * longDayPayment
    );

    //Calculate Incentive
    pay += staff.incentive;
    console.log(
      "Total payable for ",
      staff.name,
      " after incentive is ",
      pay,
      ". incentive payment is ",
      staff.incentive
    );
    console.log(
      `${staff} should be paid ${currencyFormatter.format(pay)} including overtime of ${currencyFormatter.format(
        otPay
      )}`
    );

    const report: EmployeeSalary = {
      name: staff.name,
      halfDays,
      lateDays,
      earlyExitDays,
      overTimeDays,
      missedEntry,
      dayOff,
      longDays,
      workdays: presentDays,
      pay: pay,
      ot: otPay,
      incentive: staff.incentive,
    };

    setReportInfo({
      month: moment(employeeData[0].date, "YYYY-MM-DD").format("MMMM"),
      year: moment(employeeData[0].date, "YYYY-MM-DD").format("yyyy"),
      days: moment(employeeData[0].date, "YYYY-MM-DD").daysInMonth(),
    });
    return report;
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
        <Spinner animation="grow" className="text-color-50" />
      ) : (
        <>
          {reportInfo.month !== "" ? (
            <h3 className="text-color">
              Salary Calculation for {reportInfo.month} {reportInfo.year}
              <p className="small text-color-50 mt-1">
                Total: {currencyFormatter.format(reportData.reduce((v: any, current) => v + current.pay, 0))}
              </p>
            </h3>
          ) : (
            ""
          )}
          {reportData.map((val) => {
            const staff = staffShiftData.filter((v) => v.name === val.name)[0];
            return (
              <Accordion flush key={val.name}>
                <Accordion.Header className="w-100 text-color">
                  <div className="w-100 pe-2 pb-2">
                    <div className="text-start d-inline h5 text-capitalize text-color">
                      {val.name.toLowerCase()}
                      <span className="small text-color-50">
                        {" "}
                        incl. overtime of {currencyFormatter.format(val.ot)}
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
                      <div>
                        <FontAwesomeIcon icon={faHourglassEnd} />
                        &nbsp; {`${val.longDays.length} long days (12 hours or more)`}
                      </div>
                    </li>

                    <li
                      className="list-group-item bg-transparent text-color border-color ps-0"
                      key={val.name + "item2present"}
                    >
                      <Row>
                        <Col xs="8">Base salary</Col>
                        <Col xs="4" className="text-end">
                          {currencyFormatter.format(staff.salary)}
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="6">Overtime</Col>
                        <Col xs="6" className="text-end">
                          + {currencyFormatter.format(val.ot)}
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="6">Long Days</Col>
                        <Col xs="6" className="text-end">
                          + {currencyFormatter.format(val.longDays.filter((v) => !v.ignored).length * longDayPayment)}
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="6">Leaves Deduction</Col>
                        <Col xs="6" className="text-end">
                          -{" "}
                          {currencyFormatter.format(
                            val.dayOff.filter((v) => !v.ignored).length * getHalfDaySalary(staff.salary) * 2
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
                            val.halfDays.filter((v) => !v.ignored).length * getHalfDaySalary(staff.salary)
                          )}
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="9">Half Day - Early Exit</Col>
                        <Col xs="3" className="text-end">
                          -{" "}
                          {currencyFormatter.format(
                            val.earlyExitDays.filter((v) => !v.ignored).length * getHalfDaySalary(staff.salary)
                          )}
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="9">Half Day - Missed Entry</Col>
                        <Col xs="3" className="text-end">
                          -{" "}
                          {currencyFormatter.format(
                            val.missedEntry.filter((v) => !v.ignored).length * getHalfDaySalary(staff.salary)
                          )}
                        </Col>
                      </Row>
                      <Row>
                        <Col xs="9">Service Incentive</Col>
                        <Col xs="3" className="text-end">
                          + {currencyFormatter.format(val.incentive)}
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
