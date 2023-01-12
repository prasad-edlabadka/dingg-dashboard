import { Col, Row } from "react-bootstrap"
import BookingsV2 from "./tile/BookingsV2"
import PaymentMethods from "./tile/PaymentMethods"
//import Prediction from "./tile/Prediction"
//import Sale from "./tile/Sale"
import Sale2 from "./tile/Sale2"
import Staff from "./tile/Staff"
import Stock from "./tile/Stock"

export default function Tiles({token, setToken}:{token:string, setToken:any}) {
    const tileList = [Sale2, Staff, PaymentMethods, Stock]
    return (
        <div>
        <Row>
            {tileList.map((Comp, key) => (<Col xl={4} xs={12} className="gy-4" key={'tilCol'+key}><Comp token={token} setToken={setToken} key={'tile'+key}/></Col>))}
        </Row>
        <Row>
            <Col xl={12} xs={12} className="gy-4"><BookingsV2 token={token} setToken={setToken} key={'tile999'}/></Col>
        </Row>
        
        <Row>
            <Col>&nbsp;</Col>
        </Row>
        </div>
    )
}