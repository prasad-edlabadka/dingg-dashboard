import { Col, Row } from "react-bootstrap"
import Sale from "./tile/Sale"

export default function Tiles({token, setToken}:{token:string, setToken:any}) {
    const tileList = [Sale]
    return (
        <Row>
            {tileList.map((Comp, key) => (<Col sm={4}><Comp token={token} setToken={setToken} key={'tile'+key}/></Col>))}
        </Row>
    )
}