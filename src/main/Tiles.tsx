import { Col, Row } from "react-bootstrap"
import PaymentMethods from "./tile/PaymentMethods"
//import Prediction from "./tile/Prediction"
import Sale from "./tile/Sale"
import Staff from "./tile/Staff"

export default function Tiles({token, setToken}:{token:string, setToken:any}) {
    const tileList = [Sale, Staff, PaymentMethods]
    return (
        <div>
        <Row>
            {tileList.map((Comp, key) => (<Col xl={4} xs={12} className="gy-4"><Comp token={token} setToken={setToken} key={'tile'+key}/></Col>))}
        </Row>
        <Row>
            <Col>&nbsp;</Col>
        </Row>
        </div>
    )
}