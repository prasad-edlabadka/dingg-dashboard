import { Col, Row } from "react-bootstrap"
import BookingsV2 from "./tile/BookingsV2"

export default function CustomerTiles({ token, setToken }: { token: string, setToken: any }) {
    //const tileList = [Stock, Consumption]
    return (
        <div>
            <Row>
                <Col xl={12} xs={12} className="gy-4"><BookingsV2 token={token} setToken={setToken} key={'tile999'} /></Col>
            </Row>
            <Row>
                <Col>&nbsp;</Col>
            </Row>
        </div>
    )
}