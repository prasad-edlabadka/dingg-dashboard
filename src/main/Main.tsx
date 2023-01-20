import { Col, Container, Row } from "react-bootstrap";
import CustomerTiles from "./CustomerTiles";
import DinggLogin from "./DinggLogin";
import ProductTiles from "./ProductTiles";
import Tiles from "./Tiles";

function Main({ token, setToken, navOption, setNavOption }: { token: string | null, setToken: any, navOption: string | null, setNavOption: any }) {

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
    switch (navOption) {
        case "home":
            return (
                <Container>
                    <Tiles token={token} setToken={setToken} />
                </Container>)
        case "products":
            return (
                <Container>
                    <ProductTiles token={token} setToken={setToken} />
                </Container>)
        case "customers":
            return (
                <Container>
                    <CustomerTiles token={token} setToken={setToken} />
                </Container>)
        default:
            return <></>;
    }

}

export default Main;