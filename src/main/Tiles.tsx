import { Col, Row } from "react-bootstrap"
import Prediction from "./tile/Prediction"
import Sale from "./tile/Sale"
import Staff from "./tile/Staff"

export default function Tiles({token, setToken}:{token:string, setToken:any}) {
    const tileList = [Sale, Staff, Prediction]
    return (
        <Row>
            {tileList.map((Comp, key) => (<Col sm={4} xs={12} className="gy-4"><Comp token={token} setToken={setToken} key={'tile'+key}/></Col>))}
        </Row>
    )
}