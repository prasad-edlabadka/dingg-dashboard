import { Col, Row } from "react-bootstrap";
import * as Icon from 'react-bootstrap-icons';
import { currencyFormatter } from "../Utility";
import { TokenContext } from "../../../App";
import { useContext } from "react";

function SaleRow({title, current, previous, variation, primary}: {title: string, current: number, previous: number, variation: number, primary: boolean}) {
    const {darkMode} = useContext(TokenContext);
    return (
        <Row className={`border-bottom border-${darkMode?"dark":"white"} border-opacity-25 pb-1 pt-1`}>
            {primary && <Col xs="4" className="align-self-center"><h4>{title}</h4></Col>}
            {!primary && <Col xs="4" className={`align-self-top text-${darkMode?"dark":"white"} text-opacity-75 small`}>{title}</Col>}
            <Col xs="8">
                {primary && <h1 className="align-self-center mb-0 fw-bolder">{currencyFormatter.format(current)}</h1>}
                {!primary && <h5 className={`align-self-center mb-0 text-${darkMode?"dark":"white"} text-opacity-75`}>{currencyFormatter.format(current)}</h5>}
                <div className={`small text-${darkMode?"black":"white"}-50`} style={{ marginTop: -2 }}>previous {currencyFormatter.format(previous)} ({variation > 0 ?
                    <Icon.CaretUpFill className={`ms-0 me-1 ${darkMode?"text-success":""}`} /> : <Icon.CaretDownFill className={`ms-0 me-1 ${darkMode?"text-danger":""}`} />}{Math.abs(variation)}%)</div>
                <span className="small align-self-center ps-2 float-end text-white-50"></span>
            </Col>
        </Row>
    );
}

export default SaleRow;