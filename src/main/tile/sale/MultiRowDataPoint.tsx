import { Col, Row } from "react-bootstrap";
import { TokenContext } from "../../../App";
import { useContext } from "react";

function MultiRowDataPoint({ data }: { data: any[] }) {
    const {darkMode} = useContext(TokenContext);
    return (
        <Row>
            {data.map((item, index) => {
                return (
                    <Col xs="6" key={`${item.title1}-${item.title2}-${index}`}>
                        <h3 className="align-self-center mb-0 fw-bolder">{item.value1}</h3>
                        <h6 className={`mb-0 small text-${darkMode?"black":"white"}-50`}>{item.title1}</h6>
                        <h3 className="align-self-center mb-0 fw-bolder">{item.value2}</h3>
                        <h6 className={`mb-0 small text-${darkMode?"black":"white"}-50`}>{item.title2}</h6>
                    </Col>
                )
            })}
        </Row>
    )
}

export default MultiRowDataPoint;