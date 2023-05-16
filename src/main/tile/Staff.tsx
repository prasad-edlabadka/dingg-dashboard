import { useEffect, useState, useContext } from "react";
import { Col, Row } from "react-bootstrap";
import { currencyFormatter, formatDate, getLastMonth } from "./Utility";
import { TokenContext } from "../../App";
import DiwaButtonGroup from "../../components/button/DiwaButtonGroup";
import DiwaCard from "../../components/card/DiwaCard";
import DiwaRefreshButton from "../../components/button/DiwaRefreshButton";
import TargetProgress from "./staff/TargetProgress";

export default function Staff() {
    const { callAPI } = useContext(TokenContext)
    const [reportData, setReportData] = useState({ data: [{ "service price": 0, stylist: "" }] });
    const buttonState = useState(0);
    const [, setActiveButtonIndex] = buttonState;
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
    const [loading, setLoading] = useState(false);
    const [staffTargets, setStaffTargets] = useState({});

    const defaultTarget = 100000;
    const targetURL = "https://api.dingg.app/api/v1/vendor/target/all";

    useEffect(() => {
        setLoading(true);
        const apiURL = `https://api.dingg.app/api/v1/vendor/report/sales?start_date=${formatDate(startDate)}&report_type=staff_service_summary&end_date=${formatDate(endDate)}&app_type=web`
        callAPI(targetURL, (targetData: any) => {
            setStaffTargets(getTargets(targetData));
            callAPI(apiURL, (data: any) => {
                data.data = data.data.sort((a: any, b: any) => {
                    return b["service price"] - a["service price"];
                });
                setReportData(data);
                setLoading(false);
            });
        });

        const getTargets = (targetData: any) => {
            const targets = targetData.data;
            const targetMap: any = {};
            targets.forEach((target: any) => {
                targetMap[target.employee?.name || "Manager"] = target.total_sales;
            });
            return targetMap;
        }

    }, [startDate, endDate, callAPI]);

    const refresh = () => {
        setDuration('current');
        setActiveButtonIndex(0);
    }

    const date = new Date();
    const setDuration = (type: string) => {
        if (type === 'current') {
            setStartDate(new Date(date.getFullYear(), date.getMonth(), 1));
            setEndDate(date);
        } else {
            const lastMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
            setStartDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
            setEndDate(new Date(lastMonthDate.getTime() - 1));
        }
    }

    const buttons = [
        { title: (new Date()).toLocaleDateString('en-GB', { month: 'long' }), onClick: () => setDuration('current') },
        { title: getLastMonth().toLocaleDateString('en-GB', { month: 'long' }), onClick: () => setDuration('previous') }
    ];

    return (
        <DiwaCard varient="indigo" loadingTracker={loading}>
            <div className="position-relative">
                <h2>Staff Sales Target</h2>
                <DiwaRefreshButton refresh={() => refresh()} />
            </div>
            <DiwaButtonGroup buttons={buttons} state={buttonState} />
            {
                reportData.data.map((val, index) => {
                    const target = (staffTargets[val.stylist.trim() as keyof typeof staffTargets] || defaultTarget)
                    const targetPercentage = Math.round(val["service price"] * 100 / target);
                    const targetNoDiscountPercentage = Math.round(val["service amount"] * 100 / target);
                    return (
                        <div key={'staff' + index} className="mt-3 pt-2 pb-2 rounded black-bg">
                            <Row className="ps-2 pe-2 align-bottom">
                                <Col xs={7} className="align-bottom pe-0"><h4>{val.stylist}</h4></Col>
                                <Col xs={5} className="text-end align-bottom text-white-50 ps-0">Target {currencyFormatter.format(target)}</Col>
                            </Row>
                            <TargetProgress label="Without discount" value={val["service price"]} target={staffTargets[val.stylist.trim() as keyof typeof staffTargets]} percentAchieved={targetPercentage} />
                            <TargetProgress label="With discount" value={val["service amount"]} target={staffTargets[val.stylist.trim() as keyof typeof staffTargets]} percentAchieved={targetNoDiscountPercentage} />
                        </div>)
                })
            }
        </DiwaCard>
    )
}
