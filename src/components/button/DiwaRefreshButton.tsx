import { Button } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";

function DiwaRefreshButton({refresh}:{refresh:()=>void}) {
    return (
        <div className="position-absolute top-0 end-0" style={{ marginTop: -10 }} data-testid="refresh-button-div">
            <Button variant="indigo" className="text-light" size="lg" onClick={refresh} data-testid="refresh-button"><Icon.ArrowClockwise data-testid="refresh-icon"/></Button>
        </div>
    );
}

export default DiwaRefreshButton;