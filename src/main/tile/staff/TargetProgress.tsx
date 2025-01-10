import { Col, OverlayTrigger, ProgressBar, Row, Tooltip } from "react-bootstrap";
import { currencyFormatter } from "../Utility";

export default function TargetProgress({
  label,
  value,
  target,
  percentAchieved,
  percentAchievedSuffix,
  type,
}: {
  label: string;
  value: number | string;
  target: number;
  percentAchieved: number;
  percentAchievedSuffix?: string;
  type?: string;
}) {
  return (
    <Row className="ps-2 pe-2">
      <Col xs={7} className="text-color-50">
        {label}
      </Col>
      <Col xs={5} className="text-end align-bottom text-color">
        {(!type || type === "currency") && typeof value === "number" ? currencyFormatter.format(value) : value}
      </Col>
      <Col lg={12} className="mt-1">
        <OverlayTrigger
          overlay={
            <Tooltip id="tooltip-disabled">
              {percentAchieved}% {percentAchievedSuffix || "Achieved"}
            </Tooltip>
          }
        >
          <ProgressBar
            now={percentAchieved}
            style={{ height: 6, marginBottom: 12 }}
            variant="danger"
            striped
            animated
          />
        </OverlayTrigger>
      </Col>
    </Row>
  );
}
