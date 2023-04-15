import { Card, Spinner } from "react-bootstrap";
import './DiwaCard.scss';

function DiwaCard(props: { children?: any; varient: "danger" | "success" | "primary" | "warning" | "dark" | "indigo" | "purple";  loadingTracker: boolean; }) {

    const { varient, loadingTracker } = props;
    return (
        <Card className="shadow mt-3" bg={varient} text="light" data-testid="card-parent">
            {
                loadingTracker ? <Card.Body data-testid="card-loading-body"><Spinner animation="grow" /></Card.Body> :
                    <Card.Body data-testid="card-content-body">
                        {props.children}
                    </Card.Body>
            }
        </Card>
    )
}

export default DiwaCard; 