import { Col, Row } from "react-bootstrap";
import Salary from "./tile/Salary";
import Staff from "./tile/staff/Staff";
import ServiceStats from "./tile/staff/ServiceStats";

export default function StaffTiles() {
  const tileList = [Staff, Salary, ServiceStats];
  return (
    <div>
      <Row>
        {tileList.map((Comp, key) => (
          <Col xl={12} xs={12} className="gy-2" key={"tilCol" + key}>
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
