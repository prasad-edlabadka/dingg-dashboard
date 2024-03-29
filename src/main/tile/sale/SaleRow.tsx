import { Col, Row } from "react-bootstrap";
import * as Icon from 'react-bootstrap-icons';
import { currencyFormatter } from "../Utility";

function SaleRow({ title, current, previous, variation, primary }: { title: string, current: number, previous: number, variation: number, primary: boolean }) {
    return (
        <Row className={`border-bottom border-color-25 pb-1 pt-1`}>
            {primary && <Col xs="5" className="align-self-top text-color"><h4>{title}</h4></Col>}
            {!primary && <Col xs="5" className={`align-self-top text-color text-opacity-75 small`}>{title}</Col>}
            <Col xs="7">
                {primary && <h1 className="align-self-center mb-0 fw-bolder text-color">{currencyFormatter.format(current)}</h1>}
                {!primary && <h5 className={`align-self-center mb-0 text-color text-opacity-75`}>{currencyFormatter.format(current)}</h5>}
                <div className={`small text-color-50`} style={{ marginTop: -2 }}>previous {currencyFormatter.format(previous)} ({variation > 0 ?
                    <Icon.CaretUpFill className={`ms-0 me-1 caret-success-color`} /> : <Icon.CaretDownFill className={`ms-0 me-1 caret-danger-color`} />}{Math.abs(variation)}%)</div>
                <span className="small align-self-center ps-2 float-end text-color-50"></span>
            </Col>
        </Row>
    );
}

export default SaleRow;