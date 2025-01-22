import { Col, Container, Row } from "react-bootstrap";
import DinggLogin from "./DinggLogin";
import ProductTiles from "./ProductTiles";
import Tiles from "./Tiles";
import FinanceTiles from "./FinanceTiles";
import StaffTiles from "./StaffTiles";
import { useContext } from "react";
import { TokenContext } from "../App";
import DiwaCard from "../components/card/DiwaCard";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSun, faMoon } from "@fortawesome/free-regular-svg-icons";

function Main() {
  const { token, navOption, employeeName, location } = useContext(TokenContext) as {
    token: string;
    navOption: "home" | "products" | "finance" | "staff";
    employeeName: string;
    location: string;
  };
  const screens = {
    home: Tiles,
    products: ProductTiles,
    finance: FinanceTiles,
    staff: StaffTiles,
  };
  // const [darkMode, setDarkMode] = useState(document.body.classList.contains('dark'));

  // const toggleDarkMode = () => {
  //     setDarkMode(!darkMode);
  //     !darkMode ? document.body.classList.add('dark') : document.body.classList.remove('dark');
  //     // localStorage.setItem("darkMode", (!darkMode).toString());
  // };

  if (!token) {
    return (
      <Container>
        <Row>
          <Col style={{ height: 40 }}></Col>
        </Row>
        <DinggLogin />
      </Container>
    );
  }
  const SelectedScreen = screens[navOption || "home"] || Tiles;

  return (
    <Container>
      <DiwaCard varient="pink" loadingTracker={false}>
        <h4 className="mb-0 text-color">
          Welcome {employeeName}
          <p className="small mb-0">To {location}</p>
        </h4>
        {/* <Col xs="4" className="d-flex justify-content-end align-items-center">
                <span className="d-inline pe-2 text-color"><FontAwesomeIcon icon={faSun} className="text-color" /></span>
                <span className="d-inline">
                    <Form.Check // prettier-ignore
                        type="switch"
                        id="dark-mode-switch"
                        className="form-control-lg pe-0"
                        checked={darkMode}
                        onChange={toggleDarkMode}
                    />
                </span>
                <span className="d-inline text-color"><FontAwesomeIcon icon={faMoon} className="text-color" /></span>

            </Col> */}
      </DiwaCard>
      {<SelectedScreen />}
    </Container>
  );
}

export default Main;
