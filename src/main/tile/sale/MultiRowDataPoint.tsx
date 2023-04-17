import { Col, Row } from "react-bootstrap";

function MultiRowDataPoint({ data }: { data: any[] }) {
    return (
        <Row>
            {data.map((item, index) => {
                return (
                    <Col xs="6">
                        <h3 className="align-self-center mb-0 fw-bolder">{item.value1}</h3>
                        <h6 className="mb-0 small text-white-50">{item.title1}</h6>
                        <h3 className="align-self-center mb-0 fw-bolder">{item.value2}</h3>
                        <h6 className="mb-0 small text-white-50">{item.title2}</h6>
                    </Col>
                )
            })}
        </Row>
    )
}

export default MultiRowDataPoint;