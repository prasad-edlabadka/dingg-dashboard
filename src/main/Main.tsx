import { Col, Container, Row } from "react-bootstrap";
import DinggLogin from "./DinggLogin";
import ProductTiles from "./ProductTiles";
import Tiles from "./Tiles";
import FinanceTiles from "./FinanceTiles";

function Main({ token, setToken, navOption, setNavOption }: { token: string | null, setToken: any, navOption: string | null, setNavOption: any }) {

    const screens = {
        "home": Tiles,
        "products": ProductTiles,
        "finance": FinanceTiles
    }
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
    const SelectedScreen = screens[navOption || 'home'];
    return (<Container>
        {<SelectedScreen token={token} setToken={setToken} />}
    </Container>)
}

export default Main;