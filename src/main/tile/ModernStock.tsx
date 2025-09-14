import { useContext, useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import { currencyFormatter } from "./Utility";
import { TokenContext, API_BASE_URL } from "../../App";
import DiwaCard from "../../components/card/DiwaCard";
// import DiwaRefreshButton from "../../components/button/DiwaRefreshButton";
import * as Icon from "react-bootstrap-icons";

export default function ModernStock() {
  const [reportData, setReportData] = useState([
    {
      itemsTotal: 0,
      depth: 0,
      name: "",
      quantity: 0,
      cost: 0,
      low_qty: 0,
      items: [{ depth: 0, name: "", quantity: 0, cost: 0, low_qty: 0 }],
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [total, setTotal] = useState(-1);
  const { callAPI } = useContext(TokenContext);

  useEffect(() => {
    setLoading(true);
    const apiURL = `${API_BASE_URL}/product/sub-categories-products?is_low_qty=true`;
    callAPI(apiURL, (data: any) => {
      let tot = 0;
      let sortedData = [];
      for (var d in data.data) {
        tot += (Number(data.data[d].cost) || 0) * (Number(data.data[d].low_qty) + 1);
        if (data.data[d].depth === 2) {
          data.data[d].items = [];
          data.data[d].itemsTotal = 0;
          sortedData.push(data.data[d]);
        }
      }
      for (d in data.data) {
        let record = data.data[d];
        if (record.depth === 1) {
          let item = sortedData.find((v) => v.id === record.parent);
          item.items.push(record);
          item.itemsTotal += Number(record.cost);
        }
      }
      setReportData(sortedData);
      setTotal(tot);
      setLoading(false);
    });
  }, [refreshFlag, callAPI]);

  return (
    <div className="kpi-card-container">
      <DiwaCard varient="primary" loadingTracker={loading} className="glass-panel customer-card">
        <div className="position-relative mb-2">
          <h2 className="panel-title text-color">
            Products Low on Stock
            <p className={`panel-sub small text-color-danger-50 mb-0`}>
              Estimated Total Cost: {currencyFormatter.format(total)}
            </p>
          </h2>
          <div className="position-absolute top-0 end-0" data-testid="refresh-button-div">
            <button
              type="button"
              className="icon-btn refresh"
              aria-label="Refresh"
              onClick={() => setRefreshFlag(!refreshFlag)}
              disabled={loading}
            >
              <Icon.ArrowClockwise />
            </button>
          </div>
          {/* <DiwaRefreshButton refresh={() => setRefreshFlag(!refreshFlag)} /> */}
        </div>
        {reportData.map((val, index) => {
          return (
            <Accordion flush key={"stockitem" + index}>
              <Accordion.Header className="w-100">
                <div className="w-100 pe-2 pb-2 panel-normal">
                  <div className=" panel-normal text-start d-inline h5 text-color">{val.name}</div>
                  <div className=" panel-normal text-end d-inline float-end text-color">
                    {val.items.length} items{" "}
                    <p className="panel-sub d-inline small mb-0 text-color-50">
                      ({currencyFormatter.format(val.itemsTotal)})
                    </p>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <ul className="list-group list-group-flush">
                  {val.items.map((item, index2) => {
                    return (
                      <li
                        className="panel-normal list-group-item bg-transparent text-color border-color-25 ps-0"
                        key={val.name + "item" + index2}
                      >
                        {item.name}
                        <p className="small text-color-danger-50 mb-0" style={{ marginTop: -4 }}>
                          {item.quantity} available in stock. Minimum {Number(item.low_qty) + 1} should be ordered.
                        </p>
                        <p className={`small text-color-50 mb-0`} style={{ marginTop: -4 }}>
                          Cost: {currencyFormatter.format(item.cost)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </Accordion.Body>
            </Accordion>
          );
        })}
      </DiwaCard>
    </div>
  );
}
