import { Col, Row } from "react-bootstrap"
import Consumption from "./tile/Consumption"
import Stock from "./tile/Stock"

export default function ProductTiles({ token, setToken}: { token: string, setToken: any}) {
    const tileList = [Stock, Consumption]
    return (
        <div>
            <Row>
                {tileList.map((Comp, key) => (<Col xl={4} xs={12} className="gy-4" key={'tilCol' + key}><Comp token={token} setToken={setToken} key={'tile' + key} /></Col>))}
            </Row>
            <Row>
                <Col>&nbsp;</Col>
            </Row>
        </div>
    )
}