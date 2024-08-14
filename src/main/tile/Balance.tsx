import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { currencyFormatter, formatDate, getFirstDayOfWeek } from "./Utility";
import { addDays, isAfter, endOfDay, endOfMonth, subMonths, startOfMonth, addMonths, subDays, format } from "date-fns";
import { TokenContext, API_BASE_URL } from "../../App";
import DiwaButtonGroup from "../../components/button/DiwaButtonGroup";
import DiwaCard from "../../components/card/DiwaCard";
import TitleWithRefresh from "./sale/TitleWithRefresh";
import SaleRow from "./sale/SaleRow";
import DataPoint from "./sale/DataPoint";
import MultiRowDataPoint from "./sale/MultiRowDataPoint";
import { Col, Row } from "react-bootstrap";
import DiwaPaginationButton from "../../components/button/DiwaPaginationButton";
import SimpleDataPoint from "./sale/SimpleDataPoint";
import DiwaRefreshButton from "../../components/button/DiwaRefreshButton";

export default function Balance() {
  const { callAPI } = useContext(TokenContext);

  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pnl, setPnl] = useState([]);

  const buttonState = useState(0);

  useEffect(() => {
    setLoading(true);
    const apiURL = `${API_BASE_URL}/vendor/account/list`;

    callAPI(apiURL, (data: any) => {
      setLoading(false);
      if (!data) return;
      setPnl(
        data.data.length === 0
          ? []
          : data.data
              .sort((a: { id: number }, b: { id: number }) => a.id < b.id)
              .map((v: any) => {
                return {
                  title: v.name,
                  value: v.current_balance,
                  previous: v.current_balance,
                };
              })
      );
    });
  }, [reload]);

  return (
    <>
      <Row>
        <Col xs={12}>
          <DiwaCard varient="primary" loadingTracker={loading}>
            <div className="position-relative text-color mb-2">
              <h2>Account Balance</h2>
              <DiwaRefreshButton refresh={() => setReload(!reload)} />
            </div>
            <SimpleDataPoint data={pnl} />
          </DiwaCard>
        </Col>
      </Row>
    </>
  );
}
