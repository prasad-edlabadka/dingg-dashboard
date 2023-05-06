import { Col, Row } from "react-bootstrap"
import Consumption from "./tile/Consumption"
import Stock from "./tile/Stock"

export default function ProductTiles() {
    const tileList = [Stock, Consumption]
   
    return (
        <div>
            <Row>
                {tileList.map((Comp, key) => (<Col xl={4} xs={12} className="gy-2" key={'tilCol' + key}><Comp key={'tile' + key} /></Col>))}
            </Row>
            <Row>
                <Col>&nbsp;</Col>
            </Row>
        </div>
    )
}