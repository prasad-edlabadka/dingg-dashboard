import { Col, Row } from "react-bootstrap";

function DataPoint({ data }: { data: any[] }) {
    return (
        <Row>
            {data.map((item, index) => {
                return (
                    <Col xs="4" key={item.title + index} className={`text-color ms-0 me-0 pe-1 ${index === 0 ? '' : 'ps-1'}`}>
                        <h6 className="mb-0">{item.title}</h6>
                        <h4 className="align-self-center mb-0 text-nowrap">{item.value}</h4>
                        <div className={`small text-color-50`} style={{ marginTop: -2 }}>{item.subTitle || 'previous'} {item.previous}</div>
                    </Col>
                )
            })}
        </Row>
    )
}

export default DataPoint;