import { useEffect, useState, useContext } from "react";
import { Col, Row } from "react-bootstrap";
import { currencyFormatter, formatDate, getLastMonth } from "./Utility";
import { TokenContext, API_BASE_URL } from "../../App";
import DiwaButtonGroup from "../../components/button/DiwaButtonGroup";
import DiwaCard from "../../components/card/DiwaCard";
import DiwaRefreshButton from "../../components/button/DiwaRefreshButton";
import TargetProgress from "./staff/TargetProgress";

export default function Staff() {
  const { callAPI } = useContext(TokenContext);
  const [reportData, setReportData] = useState({ data: [{ "service price": 0, stylist: "" }] });
  const buttonState = useState(0);
  const [, setActiveButtonIndex] = buttonState;
  const [endDate, setEndDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
  const [loading, setLoading] = useState(false);
  const [staffTargets, setStaffTargets] = useState([
    {
      total_sales: "0",
      employee: {
        id: 0,
        name: "",
      },
    },
  ]);
  const [tips, setTips] = useState([
    {
      "staff name": "",
      "received tip": 0,
      "unsettled tip": 0,
      "settled tip": 0,
    },
  ]);
  const [calculatedTarget, setCalculatedTarget] = useState({});

  const defaultTarget = 100000;

  useEffect(() => {
    setLoading(true);
    const apiURL = `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(
      startDate
    )}&report_type=staff_service_summary&end_date=${formatDate(endDate)}&app_type=web`;
    callAPI(`${API_BASE_URL}/vendor/target/all`, (targetData: any) => {
      setStaffTargets(getTargets(targetData));
      callAPI(apiURL, (data: any) => {
        data.data = data.data.sort((a: any, b: any) => {
          return b["service price"] - a["service price"];
        });
        setReportData(data);
        setLoading(false);
      });
    });

    const employeeURL = `${API_BASE_URL}/employees/get`;
    callAPI(employeeURL, (data: any) => {
      const empList = data.data.map((v: { id: any }) => v.id).join(",");
      const reportApiURL = `${API_BASE_URL}/vendor/target/all?employee_ids=${empList}&time_type=monthly&start_date=${formatDate(
        startDate
      )}&end_date=${formatDate(endDate)}`;
      callAPI(reportApiURL, (reportData: any) => {
        const calculatedTarget: any = {};
        reportData.data.forEach((v: { employee: { name: string }; service_sales_achieved: number }) => {
          calculatedTarget[v.employee.name] = v.service_sales_achieved;
        });
        console.log(calculatedTarget);
        setCalculatedTarget(calculatedTarget);
      });
    });

    const tipURL = `${API_BASE_URL}/vendor/report/sales?report_type=by_staff_tip_summary&start_date=${formatDate(
      startDate
    )}&end_date=${formatDate(endDate)}&app_type=web`;
    callAPI(tipURL, (data: any) => {
      setTips(data.data);
    });

    const getTargets = (targetData: any) => {
      return targetData.data;
    };
  }, [startDate, endDate, callAPI]);

  const refresh = () => {
    setDuration("current");
    setActiveButtonIndex(0);
  };

  const getTarget = (name: string) => {
    if (!staffTargets) return defaultTarget;
    return Number.parseFloat(
      staffTargets.find((v) => v?.employee?.name.toLowerCase() === name.toLowerCase())?.total_sales ||
        `${defaultTarget}`
    );
  };

  const date = new Date();
  const setDuration = (type: string) => {
    if (type === "current") {
      setStartDate(new Date(date.getFullYear(), date.getMonth(), 1));
      setEndDate(date);
    } else {
      const lastMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
      setStartDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
      setEndDate(new Date(lastMonthDate.getTime() - 1));
    }
  };

  const buttons = [
    { title: new Date().toLocaleDateString("en-GB", { month: "long" }), onClick: () => setDuration("current") },
    { title: getLastMonth().toLocaleDateString("en-GB", { month: "long" }), onClick: () => setDuration("previous") },
  ];

  const calculatePercentage = (achieved: number, target: number) => {
    return Math.round((achieved * 100) / target);
  };

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
        {reportData.data.map((val, index) => {
          const target = getTarget(val.stylist.trim());
          const targetPercentage = Math.round((val["service price"] * 100) / target);
          const targetNoDiscountPercentage = Math.round((val["service amount"] * 100) / target);
          const tip = tips.find(
            (v: { "staff name": string }) => v["staff name"].toLowerCase() === val.stylist.toLowerCase()
          );
          return (
            <Col xs={12} md={4} key={"staff" + index} className="">
              <div className="mt-3 pt-2 pb-2 rounded black-bg">
                <Row className="ps-2 pe-2 align-bottom">
                  <Col xs={7} className="align-bottom pe-0 text-color">
                    <h4>{val.stylist}</h4>
                  </Col>
                  <Col xs={5} className="text-end align-bottom text-color-50 ps-0">
                    Target {currencyFormatter.format(target)}
                  </Col>
                </Row>
                <TargetProgress
                  label="Without discount"
                  value={val["service price"]}
                  target={target}
                  percentAchieved={targetPercentage}
                />
                <TargetProgress
                  label="With discount"
                  value={val["service amount"]}
                  target={target}
                  percentAchieved={targetNoDiscountPercentage}
                />
                <TargetProgress
                  label="Dingg Calculated"
                  value={calculatedTarget[val.stylist]}
                  target={target}
                  percentAchieved={calculatePercentage(calculatedTarget[val.stylist], target)}
                />
                <TargetProgress
                  label="Tip Received"
                  value={tip?.["received tip"] || 0}
                  target={tip?.["received tip"] || 0}
                  percentAchieved={calculatePercentage(tip?.["settled tip"] || 0, tip?.["received tip"] || 0)}
                  percentAchievedSuffix="Paid"
                />
              </div>
            </Col>
          );
        })}
      </Row>
    </DiwaCard>
  );
}
