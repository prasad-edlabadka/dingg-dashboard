import { Col, Row } from "react-bootstrap";
// import Consumption from "./tile/Consumption";
// import Stock from "./tile/Stock";
import ModernStock from "./tile/ModernStock";
import ModernConsumption from "./tile/ModernConsumption";

export default function ProductTiles() {
  const tileList = [ModernStock, ModernConsumption];

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
