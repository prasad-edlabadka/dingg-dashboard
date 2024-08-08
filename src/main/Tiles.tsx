import { Col, Row } from "react-bootstrap";
import BookingsV2 from "./tile/BookingsV2";
import Sale2 from "./tile/Sale2";

export default function Tiles() {
  const tileList = [Sale2];
  return (
    <div>
      <Row>
        {tileList.map((Comp, key) => (
          <Col xs={12} md={5} className="gy-2" key={"tilCol" + key}>
            <Comp key={"tile" + key} />
          </Col>
        ))}

        <Col xs={12} md={7} className="gy-4 gx-4">
          <BookingsV2 key={"tile999"} />
        </Col>
      </Row>
      <Row>
        <Col>&nbsp;</Col>
      </Row>
    </div>
  );
}
