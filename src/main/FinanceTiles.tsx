import { Col, Row } from "react-bootstrap"
import Expenses from "./tile/Expenses"
import PaymentMethods from "./tile/PaymentMethods"
import Staff from "./tile/Staff"

export default function FinanceTiles({ token, setToken }: { token: string, setToken: any }) {
    const tileList = [Expenses, Staff, PaymentMethods]
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