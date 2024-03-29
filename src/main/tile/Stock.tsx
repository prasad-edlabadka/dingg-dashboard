import { useContext, useEffect, useState } from "react";
import { Accordion} from "react-bootstrap";
import { currencyFormatter } from "./Utility";
import { TokenContext, API_BASE_URL } from "../../App";
import DiwaCard from "../../components/card/DiwaCard";
import DiwaRefreshButton from "../../components/button/DiwaRefreshButton";

export default function Stock() {
    const [reportData, setReportData] = useState([{ itemsTotal: 0, "depth": 0, name: "", quantity: 0, cost: 0, low_qty: 0, items: [{ "depth": 0, name: "", quantity: 0, cost: 0, low_qty: 0 }] }]);
    const [loading, setLoading] = useState(true);
    const [refreshFlag, setRefreshFlag] = useState(false);
    const [total, setTotal] = useState(-1);
    const { callAPI } = useContext(TokenContext)

    useEffect(() => {
        setLoading(true);
        const apiURL = `${API_BASE_URL}/product/sub-categories-products?is_low_qty=true`;
        callAPI(apiURL, (data: any) => {
            let tot = 0;
            let sortedData = [];
            for (var d in data.data) {
                tot += ((Number(data.data[d].cost) || 0) * (Number(data.data[d].low_qty) + 1));
                if (data.data[d].depth === 2) {
                    data.data[d].items = [];
                    data.data[d].itemsTotal = 0;
                    sortedData.push(data.data[d]);
                }
            }
            for (d in data.data) {
                let record = data.data[d];
                if (record.depth === 1) {
                    let item = sortedData.find(v => v.id === record.parent);
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
        <DiwaCard varient="danger" loadingTracker={loading}>
            <div className="position-relative">
                <h2 className="text-color">Products Low on Stock<p className={`small text-color-danger-50 mb-0`}>Estimated Total Cost: {currencyFormatter.format(total)}</p></h2>
                <DiwaRefreshButton refresh={() => setRefreshFlag(!refreshFlag)} />
            </div>
            {
                reportData.map((val, index) => {
                    return (
                        <Accordion flush key={'stockitem' + index}>
                            <Accordion.Header className="w-100">
                                <div className="w-100 pe-2 pb-2">
                                    <div className="text-start d-inline h5 text-color">{val.name}</div>
                                    <div className="text-end d-inline float-end text-color">{val.items.length} items <p className="d-inline small mb-0 text-color-50">({currencyFormatter.format(val.itemsTotal)})</p></div>
                                </div>

                            </Accordion.Header>
                            <Accordion.Body>
                                <ul className="list-group list-group-flush">
                                    {
                                        val.items.map((item, index2) => {
                                            return (<li className="list-group-item bg-transparent text-color border-color ps-0" key={val.name + 'item' + index2}>
                                                {item.name}<p className="small text-color-danger-50 mb-0" style={{ marginTop: -4 }}>{item.quantity} available in stock. Minimum {Number(item.low_qty) + 1} should be ordered.</p><p className={`small text-color-50 mb-0`} style={{ marginTop: -4 }}>Cost: {currencyFormatter.format(item.cost)}</p></li>
                                            )
                                        })
                                    }

                                </ul>

                            </Accordion.Body>
                        </Accordion>
                    )

                })
            }
        </DiwaCard>
    )
}
