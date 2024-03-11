import { Button } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { TokenContext } from "../../App";
import { useContext } from "react";

function DiwaRefreshButton({refresh}:{refresh:()=>void}) {
    const {darkMode} = useContext(TokenContext);
    return (
        <div className="position-absolute top-0 end-0" style={{ marginTop: -10 }} data-testid="refresh-button-div">
            <Button variant="indigo" className={`text-color`} size="lg" onClick={refresh} data-testid="refresh-button"><Icon.ArrowClockwise data-testid="refresh-icon"/></Button>
        </div>
    );
}

export default DiwaRefreshButton;