import { useContext, useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import { formatDate } from "./Utility";
import { TokenContext, API_BASE_URL } from "../../App";
import DiwaCard from "../../components/card/DiwaCard";
import DiwaRefreshButton from "../../components/button/DiwaRefreshButton";

interface ModernConsumptionData {
  Category: string;
  "Sub Category": string;
  Brand: string;
  "product name": string;
  "purchase price": number;
  "Item Code": string;
  "purchase price w/o tax": number;
  "issue date": string;
  "consumption date": string;
  "used by": string;
  services: string;
  "total volume": number;
  "consumption volume": number;
  "invoice number": string | null;
  invoice_id: string | null;
}

export default function ModernConsumption() {
  const [consumptionData, setConsumptionData] = useState<Partial<Record<string, ModernConsumptionData[]>>>({});
  const [loading, setLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const { callAPI } = useContext(TokenContext);

  useEffect(() => {
    setLoading(true);
    const apiURL = `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(
      new Date()
    )}&report_type=product_consumption_log&app_type=web`;
    callAPI(apiURL, (data: any) => {
      const grouped = Object.groupBy(data.data, (v: ModernConsumptionData) => {
        return v["Category"] + v["Sub Category"];
      });
      console.log(JSON.stringify(grouped));
      // const grouped = groupBy(data.data, (v: string) => `${v["Category"]} - ${v["Sub Category"]}`);
      setConsumptionData(grouped);
      setLoading(false);
    });
  }, [refreshFlag, callAPI]);

  return (
    <div className="kpi-card-container">
      <DiwaCard varient="primary" loadingTracker={loading} className="glass-panel customer-card">
        <div className="position-relative text-color mb-2">
          <h2 className="panel-title text-color">Today's Consumption</h2>
          <DiwaRefreshButton refresh={() => setRefreshFlag(!refreshFlag)} containerStyle={{ marginTop: -6 }} />
        </div>
        {Object.keys(consumptionData).length === 0 ? (
          <>
            <div className="noise" aria-hidden />
            <div className="d-flex flex-column align-items-center justify-content-center py-4 empty-state">
              <div className="empty-icon mb-2" aria-hidden>
                📦
              </div>
              <div className="h5 text-color mb-1">No consumption yet</div>
              <div className="small text-color-50">No consumption logged for today.</div>
            </div>
          </>
        ) : (
          Object.keys(consumptionData).map((keyName, index) => {
            const val = consumptionData[keyName as keyof typeof consumptionData];
            return (
              <Accordion flush key={`consumptionitem${index}`}>
                <Accordion.Header className="w-100">
                  <div className="w-100 pe-2 pb-2">
                    <div className="panel-normal text-start d-inline h5 text-color">{keyName}</div>
                    <div className="panel-normal text-end d-inline float-end text-color">{val?.length} items</div>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <ul className="list-group list-group-flush">
                    {val?.map((item, index2) => {
                      return (
                        <li
                          className="panel-normal list-group-item bg-transparent text-color border-color ps-0"
                          key={keyName + "item" + index2}
                        >
                          {item["product name"]}
                          <p className="small text-color-50 mb-0" style={{ marginTop: -4 }}>
                            {item["consumption volume"]} of {item["total volume"]} consumed.{" "}
                            {/* {item["status"] === "CONSUMED"
                            ? `It is fully consumed. Cost: ${currencyFormatter.format(Number(item["purchase price"]))}`
                            : ""} */}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </Accordion.Body>
              </Accordion>
            );
          })
        )}
      </DiwaCard>
    </div>
  );
}
