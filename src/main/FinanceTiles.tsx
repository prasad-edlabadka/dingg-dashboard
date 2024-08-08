import { Col, Row } from "react-bootstrap";
import Expenses from "./tile/Expenses";
import PaymentMethods from "./tile/PaymentMethods";

export default function FinanceTiles() {
  const tileList = [Expenses, PaymentMethods];
  return (
    <div>
      <Row>
        {tileList.map((Comp, key) => (
          <Col md={12 / tileList.length} xs={12} className="gy-2" key={"tilCol" + key}>
            <Comp key={"tile" + key} />
          </Col>
        ))}
      </Row>
      <Row>
        <Col>&nbsp;</Col>
      </Row>
    </div>
  );
}
