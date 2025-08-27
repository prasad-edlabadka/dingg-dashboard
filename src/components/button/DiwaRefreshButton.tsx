// import { Button } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";

const safeRefresh = (refresh: () => void) => {
  try {
    refresh();
  } catch (error) {
    console.error(error);
  }
};

function DiwaRefreshButton({
  refresh,
  className,
  containerStyle,
}: {
  refresh: () => void;
  className?: string;
  containerStyle?: React.CSSProperties;
}) {
  return (
    // <div className="position-absolute top-0 end-0" style={{ marginTop: -10 }} data-testid="refresh-button-div">
    //   <Button
    //     variant="indigo"
    //     className={className || `text-color`}
    //     size="lg"
    //     onClick={() => safeRefresh(refresh)}
    //     data-testid="refresh-button"
    //   >
    //     <Icon.ArrowClockwise data-testid="refresh-icon" />
    //   </Button>
    // </div>
    <div className="position-absolute top-0 end-0" style={containerStyle} data-testid="refresh-button-div">
      <button
        type="button"
        className={`${className} icon-btn refresh`}
        aria-label="Refresh"
        onClick={() => safeRefresh(refresh)}
      >
        <Icon.ArrowClockwise />
      </button>
    </div>
  );
}

export default DiwaRefreshButton;
