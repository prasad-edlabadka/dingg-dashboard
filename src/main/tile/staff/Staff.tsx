import { useEffect, useState, useContext, useCallback } from "react";
import { Col, Row } from "react-bootstrap";
import { currencyFormatter, formatDate, getLastMonth } from "../Utility";
import { TokenContext, API_BASE_URL } from "../../../App";
import DiwaButtonGroup from "../../../components/button/DiwaButtonGroup";
import DiwaCard from "../../../components/card/DiwaCard";
import DiwaRefreshButton from "../../../components/button/DiwaRefreshButton";
import TargetProgress from "./TargetProgress";
import { addMonths } from "date-fns";

interface EmployeeData {
  id: number;
  name: string;
  target: number;
  dinggCalculatedTarget: number;
  withoutDiscount: number;
  withDiscount: number;
  tip: number;
  membership: number;
  membershipTotal: number;
  completionPercentage: number;
}

const defaultTarget = 100000;

const fetchEmployeeData = async (callAPIPromise: any, startDate: Date, endDate: Date) => {
  const employeeURL = `${API_BASE_URL}/employees/get`;
  const allEmployees = await callAPIPromise(employeeURL);
  const filteredEmployees = allEmployees.data.filter(
    (emp: any) => emp.title !== "Owner" && emp.title !== "Administrator"
  );

  const employeeData = await Promise.all(
    filteredEmployees.map(async (emp: any) => {
      const targetURL = `${API_BASE_URL}/employee/setting?employee_id=${emp.id}`;
      const targetData = await callAPIPromise(targetURL);
      return {
        id: emp.id,
        name: emp.name,
        target: targetData.data?.sales_target || defaultTarget,
      };
    })
  );

  const empList = employeeData.map((v) => v.id).join(",");
  const dinggCalculatedAPIURL = `${API_BASE_URL}/vendor/target/all?employee_ids=${empList}&time_type=monthly&start_date=${formatDate(
    startDate
  )}&end_date=${formatDate(endDate)}`;
  const reportData = await callAPIPromise(dinggCalculatedAPIURL);

  const salonAPIURL = `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(
    startDate
  )}&report_type=staff_service_summary&end_date=${formatDate(endDate)}&app_type=web`;
  const salonReportData = await callAPIPromise(salonAPIURL);

  const tipURL = `${API_BASE_URL}/vendor/report/sales?report_type=by_staff_tip_summary&start_date=${formatDate(
    startDate
  )}&end_date=${formatDate(endDate)}&app_type=web`;
  const tipData = await callAPIPromise(tipURL);

  const membershipSoldURL = `${API_BASE_URL}/vendor/report/sales?report_type=staff_by_membership&start_date=${formatDate(
    startDate
  )}&end_date=${formatDate(endDate)}&app_type=web&range_type=month`;
  const membershipData = await callAPIPromise(membershipSoldURL);

  return employeeData.map((v) => {
    const target = reportData.data.find((r: any) => r.employee.id === v.id)?.service_sales_achieved || 0;
    const targetPercentage = Math.round((target * 100) / v.target);
    const emp = salonReportData.data.find((r: any) => r.stylist === v.name) || {};
    const withDiscount = emp["service amount"] || 0;
    const withoutDiscount = emp["service price"] || 0;
    const tip = tipData.data.find((r: any) => r["staff name"] === v.name) || {};
    const membership = membershipData.data.find((r: any) => r.stylist === v.name) || {};

    return {
      ...v,
      dinggCalculatedTarget: Number.parseFloat(target),
      completionPercentage: targetPercentage,
      withoutDiscount: withoutDiscount,
      withDiscount: withDiscount,
      tip: tip["received tip"] || 0,
      membership: Number.parseFloat(membership["membership count"] || 0),
      membershipTotal: membership.total || 0,
    };
  });
};

export default function Staff() {
  const { callAPIPromise } = useContext(TokenContext);
  const buttonState = useState(0);
  const [, setActiveButtonIndex] = buttonState;
  const [endDate, setEndDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchEmployeeData(callAPIPromise, startDate, endDate).then((data) => {
      const managerData = data.find((v) => v.name === "Manager");
      if (managerData) {
        const dinggCalculatedTarget = data.reduce((acc, val) => acc + val.dinggCalculatedTarget, 0);
        const withoutDiscount = data.reduce((acc, val) => acc + val.withoutDiscount, 0);
        const withDiscount = data.reduce((acc, val) => acc + val.withDiscount, 0);
        const tip = data.reduce((acc, val) => acc + val.tip, 0);
        const membership = data.reduce((acc, val) => acc + val.membership, 0);
        const membershipTotal = data.reduce((acc, val) => acc + val.membershipTotal, 0);
        const storeData = structuredClone(managerData);
        Object.assign(storeData, {
          name: "Store",
          dinggCalculatedTarget,
          withoutDiscount,
          withDiscount,
          tip,
          membership,
          membershipTotal,
        });
        data.push(storeData);
      }

      data.sort((a, b) => (a.completionPercentage >= b.completionPercentage ? -1 : 1));
      setEmployees(data);
      setLoading(false);
    });
  }, [callAPIPromise, startDate, endDate]);

  const setDuration = useCallback((type: string) => {
    const date = new Date();
    if (type === "current") {
      setStartDate(new Date(date.getFullYear(), date.getMonth(), 1));
      setEndDate(date);
    } else if (type === "previous") {
      const lastMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
      setStartDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
      setEndDate(new Date(lastMonthDate.getTime() - 1));
    } else if (type === "previous2") {
      const lastMonthDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      setStartDate(new Date(date.getFullYear(), date.getMonth() - 2, 1));
      setEndDate(new Date(lastMonthDate.getTime() - 1));
    } else if (type === "previous3") {
      const lastMonthDate = new Date(date.getFullYear(), date.getMonth() - 2, 1);
      setStartDate(new Date(date.getFullYear(), date.getMonth() - 3, 1));
      setEndDate(new Date(lastMonthDate.getTime() - 1));
    }
  }, []);

  const refresh = useCallback(() => {
    setDuration("current");
    setActiveButtonIndex(0);
  }, [setActiveButtonIndex, setDuration]);

  const buttons = [
    { title: new Date().toLocaleDateString("en-GB", { month: "long" }), onClick: () => setDuration("current") },
    { title: getLastMonth().toLocaleDateString("en-GB", { month: "long" }), onClick: () => setDuration("previous") },
    {
      title: addMonths(new Date(), -2).toLocaleDateString("en-GB", { month: "long" }),
      onClick: () => setDuration("previous2"),
    },
    {
      title: addMonths(new Date(), -3).toLocaleDateString("en-GB", { month: "long" }),
      onClick: () => setDuration("previous3"),
    },
  ];

  const calculatePercentage = useCallback((achieved: number, target: number) => {
    return Math.round((achieved * 100) / target);
  }, []);

  return (
    <DiwaCard varient="indigo" loadingTracker={loading}>
      <div className="position-relative text-color">
        <h2>
          Staff Sales Target<p className="small mb-0 text-color-50">For services only</p>
        </h2>
        <DiwaRefreshButton refresh={refresh} />
      </div>
      <DiwaButtonGroup buttons={buttons} state={buttonState} />

      <Row className="gx-3">
        {employees.map((val, index) => (
          <Col xs={12} md={4} key={"staff" + index} className="">
            <div className={`mt-3 pt-2 pb-2 rounded ${val.name === "Store" ? "store-bg" : "black-bg"}`}>
              <Row className="ps-2 pe-2 align-bottom">
                <Col xs={7} className="align-bottom pe-0 text-color">
                  <h4>{val.name}</h4>
                </Col>
                <Col xs={5} className="text-end align-bottom text-color-50 ps-0">
                  Target {currencyFormatter.format(val.target)}
                </Col>
              </Row>
              <TargetProgress
                label="Without discount"
                value={val.withoutDiscount}
                target={val.target}
                percentAchieved={calculatePercentage(val.withoutDiscount, val.target)}
              />
              <TargetProgress
                label="With discount"
                value={val.withDiscount}
                target={val.target}
                percentAchieved={calculatePercentage(val.withDiscount, val.target)}
              />
              <TargetProgress
                label="Dingg Calculated"
                value={val.dinggCalculatedTarget}
                target={val.target}
                percentAchieved={calculatePercentage(val.dinggCalculatedTarget, val.target)}
              />
              <TargetProgress
                label="Tip Received"
                value={val.tip}
                target={val.tip}
                percentAchieved={100}
                percentAchievedSuffix="Paid"
              />
              <TargetProgress
                label="Memberships Sold"
                value={`${val.membership} (${currencyFormatter.format(val.membershipTotal)})`}
                target={val.membership}
                percentAchieved={100}
                type="number"
              />
            </div>
          </Col>
        ))}
      </Row>
    </DiwaCard>
  );
}
