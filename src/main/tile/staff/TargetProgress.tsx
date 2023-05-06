import { Col, OverlayTrigger, ProgressBar, Row, Tooltip } from "react-bootstrap";
import { currencyFormatter } from "../Utility";

export default function TargetProgress({label, value, target, percentAchieved}: {label: string, value: number, target: number, percentAchieved: number}) {
    return (
        <Row className="ps-2 pe-2">
            <Col xs={7} className="text-white-50">{label}</Col>
            <Col xs={5} className="text-end align-bottom">{currencyFormatter.format(value)}</Col>
            <Col lg={12} className="mt-1">
                <OverlayTrigger overlay={
                    <Tooltip id="tooltip-disabled">{percentAchieved}% Achieved</Tooltip>}>
                    <ProgressBar now={Math.round(value * 100 / (target || 100000))} style={{ height: 6, marginBottom: 12 }} variant="danger" striped animated/>
                </OverlayTrigger>
            </Col>
        </Row>
    )
}