import { Col, Row } from "react-bootstrap";

function MultiRowDataPoint({ data }: { data: any[] }) {
    return (
        <Row>
            {data.map((item, index) => {
                return (
                    <Col xs="6" key={`${item.title1}-${item.title2}-${index}`} className="text-color">
                        <h3 className="align-self-center mb-0">{item.value1}</h3>
                        <h6 className={`mb-0 small text-color-50`}>{item.title1}</h6>
                        <h3 className="align-self-center mb-0">{item.value2}</h3>
                        <h6 className={`mb-0 small text-color-50`}>{item.title2}</h6>
                    </Col>
                )
            })}
        </Row>
    )
}

export default MultiRowDataPoint;