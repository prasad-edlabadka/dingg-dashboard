import { Col, Row } from "react-bootstrap";

function JustHeading({title1}: { title1: string}) {
    return (
        <Row>
            <Col lg="12" xs="12">
                <div className="position-relative today rounded">
                    <h5 className="text-light ">{title1}</h5>
                </div>
            </Col>
        </Row>
    )
}

export default JustHeading;