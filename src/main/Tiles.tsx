import { Col, Row } from "react-bootstrap";
// import BookingsV2 from "./tile/BookingsV2";
// import Sale2 from "./tile/Sale2";
import SaleModern from "./tile/SaleModern";
import ModernBooking from "./tile/ModernBooking";

export default function Tiles() {
  const tileList = [SaleModern];
  return (
    <div>
      <Row>
        {tileList.map((Comp, key) => (
          <Col xs={12} md={5} className="gy-2" key={"tilCol" + key}>
            <Comp key={"tile" + key} />
          </Col>
        ))}

        <Col xs={12} md={7} className="gy-2 gx-4">
          <ModernBooking key={"tile999"} />
        </Col>
      </Row>
      <Row>
        <Col>&nbsp;</Col>
      </Row>
    </div>
  );
}
