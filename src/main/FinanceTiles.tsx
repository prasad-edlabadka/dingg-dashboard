import { Col, Row } from "react-bootstrap";
import Expenses from "./tile/Expenses";
import PaymentMethods from "./tile/PaymentMethods";
import Balance from "./tile/Balance";
import ModernExpenses from "./tile/ModernExpenses";
import ModernBalance from "./tile/ModernBalance";
import ModernPaymentMethods from "./tile/ModernPaymentMethods";

export default function FinanceTiles() {
  const tileList = [Expenses, Balance, PaymentMethods];
  return (
    <div>
      <Row>
        <Col md={12 / tileList.length} xs={12} className="gy-2" key={"tilColExpense"}>
          <ModernExpenses key={"tileExpense"} />
        </Col>
        <Col md={12 / tileList.length} xs={12} className="gy-2" key={"tilColbalance"}>
          <ModernBalance key={"tileBalance"} />
        </Col>
        <Col md={12 / tileList.length} xs={12} className="gy-2" key={"tilColMethod"}>
          <ModernPaymentMethods key={"tileMethod"} />
        </Col>
        {/* {tileList.map((Comp, key) => (
          <Col md={12 / tileList.length} xs={12} className="gy-2" key={"tilCol" + key}>
            <Comp key={"tile" + key} />
          </Col>
        ))} */}
      </Row>
      <Row>
        <Col>&nbsp;</Col>
      </Row>
    </div>
  );
}
