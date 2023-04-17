import { Button, Col, Row } from "react-bootstrap";
import * as Icon from 'react-bootstrap-icons';

function TitleWithRefresh({ title, varient, onRefresh }: { title: string, varient: string, onRefresh: () => void }) {
    return (
        <Row className="border-bottom border-white pb-2 pt-2">
            <Col xs="12">
                {title}
                <Button className="align-self-center" style={{ marginLeft: 8, backgroundColor: "transparent", border: "none" }} variant={varient} onClick={onRefresh}>
                    <Icon.ArrowClockwise />
                </Button>
            </Col>
        </Row>
    )
}

export default TitleWithRefresh;