import { Col, OverlayTrigger, ProgressBar, Row, Tooltip } from "react-bootstrap";
import { currencyFormatter } from "../Utility";

export default function TargetProgress({label, value, target, percentAchieved, percentAchievedSuffix}: {label: string, value: number, target: number, percentAchieved: number, percentAchievedSuffix?: string}) {
    return (
        <Row className="ps-2 pe-2">
            <Col xs={7} className="text-color-50">{label}</Col>
            <Col xs={5} className="text-end align-bottom">{currencyFormatter.format(value)}</Col>
            <Col lg={12} className="mt-1">
                <OverlayTrigger overlay={
                    <Tooltip id="tooltip-disabled">{percentAchieved}% {percentAchievedSuffix || "Achieved"}</Tooltip>}>
                    <ProgressBar now={percentAchieved} style={{ height: 6, marginBottom: 12 }} variant="danger" striped animated/>
                </OverlayTrigger>
            </Col>
        </Row>
    )
}