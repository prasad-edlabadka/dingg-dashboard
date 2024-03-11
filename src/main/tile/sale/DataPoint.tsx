import { Col, Row } from "react-bootstrap";
import { TokenContext } from "../../../App";
import { useContext } from "react";

function DataPoint({ data }: { data: any[] }) {
    const {darkMode} = useContext(TokenContext);
    return (
        <Row>
            {data.map((item, index) => {
                return (
                    <Col xs="4" key={item.title + index} className={`text-color ms-0 me-0 pe-1 ${index === 0?'':'ps-1'}`}>
                        <h6 className="mb-0">{item.title}</h6>
                        <h4 className="align-self-center mb-0">{item.value}</h4>
                        <div className={`small text-color-50`} style={{ marginTop: -2 }}>{item.subTitle || 'previous'} {item.previous}</div>
                    </Col>
                )
            })}
        </Row>
    )
}

export default DataPoint;