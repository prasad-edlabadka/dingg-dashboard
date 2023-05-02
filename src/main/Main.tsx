import { Col, Container, Row } from "react-bootstrap";
import DinggLogin from "./DinggLogin";
import ProductTiles from "./ProductTiles";
import Tiles from "./Tiles";
import FinanceTiles from "./FinanceTiles";
import StaffTiles from "./StaffTiles";
import { useContext } from "react";
import { TokenContext } from "../App";

function Main() {
    const {token, navOption} = useContext(TokenContext);
    const screens = {
        "home": Tiles,
        "products": ProductTiles,
        "finance": FinanceTiles,
        "staff":StaffTiles
    }
    if (!token) {
        return (
            <Container>
                <Row>
                    <Col style={{ height: 40 }}></Col>
                </Row>
                <DinggLogin />
            </Container>
        )
    }
    const SelectedScreen = screens[navOption || 'home'] || Tiles;
    return (<Container>
        {<SelectedScreen />}
    </Container>)
}

export default Main;