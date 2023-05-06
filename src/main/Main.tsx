import { Col, Container, Row } from "react-bootstrap";
import DinggLogin from "./DinggLogin";
import ProductTiles from "./ProductTiles";
import Tiles from "./Tiles";
import FinanceTiles from "./FinanceTiles";
import StaffTiles from "./StaffTiles";
import { useContext } from "react";
import { TokenContext } from "../App";
import DiwaCard from "../components/card/DiwaCard";

function Main() {
    const { token, navOption, employeeName, location } = useContext(TokenContext);
    const screens = {
        "home": Tiles,
        "products": ProductTiles,
        "finance": FinanceTiles,
        "staff": StaffTiles
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
        <DiwaCard varient="purple" loadingTracker={false}>
            <h4 className="mb-0">Welcome {employeeName}<p className="small mb-0">To {location}</p></h4>
        </DiwaCard>
        {<SelectedScreen />}
    </Container>)
}

export default Main;