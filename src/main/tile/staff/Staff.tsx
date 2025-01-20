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

export default function Staff() {
  const { callAPI, callAPIPromise } = useContext(TokenContext);
  const buttonState = useState(0);
  const [, setActiveButtonIndex] = buttonState;
  const [endDate, setEndDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
  const [loading, setLoading] = useState(false);

  const [employees, setEmployees] = useState<EmployeeData[]>([]);

  const defaultTarget = 100000;

  useEffect(() => {
    const employeeData: EmployeeData[] = [];
    setLoading(true);
    const employeeURL = `${API_BASE_URL}/employees/get`;
    callAPI(employeeURL, (allEmployees: any) => {
      allEmployees.data = allEmployees.data.filter(
        (emp: any) => emp.title !== "Owner" && emp.title !== "Administrator"
      );
      Promise.all(
        allEmployees.data.map((emp: any) => {
          const targetURL = `${API_BASE_URL}/employee/setting?employee_id=${emp.id}`;
          return callAPIPromise(targetURL).then((targetData: any) => {
            return {
              id: emp.id,
              name: emp.name,
              target: targetData.data?.sales_target || defaultTarget,
            };
          });
        })
      ).then(async (data: EmployeeData[]) => {
        setEmployees(data);
        const empList = data.map((v) => v.id).join(",");
        const dinggCalculatedAPIURL = `${API_BASE_URL}/vendor/target/all?employee_ids=${empList}&time_type=monthly&start_date=${formatDate(
          startDate
        )}&end_date=${formatDate(endDate)}`;

        //Dingg Calculated target
        const reportData = await callAPIPromise(dinggCalculatedAPIURL);
        data = data.map((v) => {
          const target = reportData.data.find((r: any) => r.employee.id === v.id)?.service_sales_achieved || 0;
          const targetPercentage = Math.round((target * 100) / v.target);
          return { ...v, dinggCalculatedTarget: Number.parseFloat(target), completionPercentage: targetPercentage };
        });

        //Salon calculated target
        const salonAPIURL = `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(
          startDate
        )}&report_type=staff_service_summary&end_date=${formatDate(endDate)}&app_type=web`;
        const salonReportData = await callAPIPromise(salonAPIURL);
        data = data.map((v) => {
          const emp = salonReportData.data.find((r: any) => r.stylist === v.name) || {};
          const withDiscount = emp["service amount"] || 0;
          const withoutDiscount = emp["service price"] || 0;
          return { ...v, withoutDiscount: withoutDiscount, withDiscount: withDiscount };
        });

        //Tip
        const tipURL = `${API_BASE_URL}/vendor/report/sales?report_type=by_staff_tip_summary&start_date=${formatDate(
          startDate
        )}&end_date=${formatDate(endDate)}&app_type=web`;
        const tipData = await callAPIPromise(tipURL);
        data = data.map((v) => {
          const tip = tipData.data.find((r: any) => r["staff name"] === v.name) || {};
          return { ...v, tip: tip["received tip"] || 0 };
        });

        //Membership
        const membershipSoldURL = `${API_BASE_URL}/vendor/report/sales?report_type=staff_by_membership&start_date=${formatDate(
          startDate
        )}&end_date=${formatDate(endDate)}&app_type=web&range_type=month`;
        const membershipData = await callAPIPromise(membershipSoldURL);
        data = data.map((v) => {
          const membership = membershipData.data.find((r: any) => r.stylist === v.name) || {};
          return {
            ...v,
            membership: Number.parseFloat(membership["membership count"] || 0),
            membershipTotal: membership.total || 0,
          };
        });

        //Update manager's data
        data = data.map((v) => {
          if (v.name === "Manager") {
            const dinggCalculatedTarget = data.reduce((acc, val) => acc + val.dinggCalculatedTarget, 0);
            const withoutDiscount = data.reduce((acc, val) => acc + val.withoutDiscount, 0);
            const withDiscount = data.reduce((acc, val) => acc + val.withDiscount, 0);
            const tip = data.reduce((acc, val) => acc + val.tip, 0);
            const membership = data.reduce((acc, val) => acc + val.membership, 0);
            const membershipTotal = data.reduce((acc, val) => acc + val.membershipTotal, 0);
            return {
              ...v,
              dinggCalculatedTarget: dinggCalculatedTarget,
              withoutDiscount: withoutDiscount,
              withDiscount: withDiscount,
              tip: tip,
              membership: membership,
              membershipTotal: membershipTotal,
            };
          }
          return v;
        });

        data = data.sort((a: EmployeeData, b: EmployeeData) => {
          return a.completionPercentage >= b.completionPercentage ? -1 : 1;
        });

        setEmployees(data);
        console.log(data);
        setLoading(false);
      });
    });
  }, [callAPI, startDate, endDate]);

  const refresh = () => {
    setDuration("current");
    setActiveButtonIndex(0);
  };

  const date = new Date();
  const setDuration = (type: string) => {
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
  };

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
        <DiwaRefreshButton refresh={() => refresh()} />
      </div>
      <DiwaButtonGroup buttons={buttons} state={buttonState} />

      <Row className="gx-3">
        {employees.map((val, index) => {
          return (
            <Col xs={12} md={4} key={"staff" + index} className="">
              <div className="mt-3 pt-2 pb-2 rounded black-bg">
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
          );
        })}
      </Row>
    </DiwaCard>
  );
}
