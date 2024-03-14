import { Button } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";

const safeRefresh = (refresh: () => void) => {
    try {
        refresh();
    } catch (error) {
        console.error(error);
    }
}

function DiwaRefreshButton({ refresh }: { refresh: () => void }) {
    return (
        <div className="position-absolute top-0 end-0" style={{ marginTop: -10 }} data-testid="refresh-button-div">
            <Button variant="indigo" className={`text-color`} size="lg" onClick={() => safeRefresh(refresh)} data-testid="refresh-button"><Icon.ArrowClockwise data-testid="refresh-icon" /></Button>
        </div>
    );
}

export default DiwaRefreshButton;