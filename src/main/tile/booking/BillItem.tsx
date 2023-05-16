import { Col, Row } from "react-bootstrap";
import { currencyFormatter } from "../Utility";

export default function BillItem({key, name, employee, amount, discount, Icon, iconProps}: { key: string, name: string, employee: string, amount: number, discount: number, Icon: any, iconProps?: object }) {
    return (
        <li className="list-group-item bg-transparent text-light border-white ps-0" key={key}>
            <Row>
                <Col xs={1}><Icon {...iconProps} /></Col>
                <Col xs={11} className="ps-2">
                    <span>{name}</span>
                 <p className="small text-white-50 mb-0" style={{ marginTop: -3}}>
                    {(employee !== "") && employee}
                    {(employee !== "") && <span className="text-white">&nbsp;&nbsp;|&nbsp;&nbsp;</span>}
                    {currencyFormatter.format(amount)}
                    {(discount !== 0) && <span className="text-white">&nbsp;&nbsp;|&nbsp;&nbsp;</span>}
                    {(discount !== 0) && (100 - Math.round((amount - discount)*100/amount))}
                    {(discount !== 0) && "% Off"}
                    {(discount !== 0) && <span className="text-white">&nbsp;&nbsp;|&nbsp;&nbsp;</span>}
                    {(discount !== 0) && currencyFormatter.format(amount - discount)}
                </p>
                </Col>
            </Row>
              
        </li>
    )
}