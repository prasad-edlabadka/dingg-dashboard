import { Col, Container, Row } from "react-bootstrap";
import DinggLogin from "./DinggLogin";
import Tiles from "./Tiles";

function Main({ token, setToken }: { token: string | null, setToken: any }) {
    
    if (!token) {
        return (
            <Container>
                <Row>
                    <Col style={{ height: 40 }}></Col>
                </Row>
                <DinggLogin setToken={setToken} />
            </Container>
        )
    }
    return (
        <Container>
            <Tiles token={token} setToken={setToken} />
        </Container>)

}

export default Main;