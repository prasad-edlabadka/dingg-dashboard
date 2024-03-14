import { Card, Spinner } from "react-bootstrap";
import './DiwaCard.scss';
import { useContext } from "react";
import { TokenContext } from "../../App";

function DiwaCard(props: { children?: any; varient: "danger" | "success" | "primary" | "warning" | "dark" | "indigo" | "purple" | "pink"; loadingTracker: boolean; }) {

    const { varient, loadingTracker } = props;
    const { darkMode } = useContext(TokenContext);

    const textVarient = darkMode ? (varient === "indigo" || varient === "purple" || varient == "pink" ? "dark" : varient) : "light";
    return (
        <Card className="shadow mt-3" bg={varient} text={textVarient} data-testid="card-parent">
            {
                loadingTracker ? <Card.Body data-testid="card-loading-body"><Spinner animation="grow" className="text-color-50" /></Card.Body> :
                    <Card.Body data-testid="card-content-body">
                        {props.children}
                    </Card.Body>
            }
        </Card>
    )
}

export default DiwaCard; 