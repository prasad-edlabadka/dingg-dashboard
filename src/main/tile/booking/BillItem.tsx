import { Col, Row } from "react-bootstrap";
import { currencyFormatter } from "../Utility";

export default function BillItem({uniqueKey, name, employee, amount, discount, Icon, iconProps}: { uniqueKey: string, name: string, employee: string, amount: number, discount: number, Icon: any, iconProps?: object }) {
    return (
        <li className={`list-group-item bg-transparent text-color border-color-25 ps-0`} key={uniqueKey}>
            <Row>
                <Col xs={1}><Icon {...iconProps} /></Col>
                <Col xs={11} className="ps-2">
                    <span>{name}</span>
                 <p className={`small text-color-50 mb-0`} style={{ marginTop: -3}}>
                    {(employee !== "") && employee}
                    {(employee !== "") && <span className='text-color'>&nbsp;&nbsp;|&nbsp;&nbsp;</span>}
                    {currencyFormatter.format(amount)}
                    {(discount !== 0) && <span className='text-color'>&nbsp;&nbsp;|&nbsp;&nbsp;</span>}
                    {(discount !== 0) && (100 - Math.round((amount - discount)*100/amount))}
                    {(discount !== 0) && "% Off"}
                    {(discount !== 0) && <span className='text-color'>&nbsp;&nbsp;|&nbsp;&nbsp;</span>}
                    {(discount !== 0) && currencyFormatter.format(amount - discount)}
                </p>
                </Col>
            </Row>
              
        </li>
    )
}