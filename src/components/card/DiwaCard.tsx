import { Card } from "react-bootstrap";
import "./DiwaCard.scss";

function DiwaCard(props: {
  children?: any;
  varient: "danger" | "success" | "primary" | "warning" | "dark" | "indigo" | "purple" | "pink" | "none";
  loadingTracker: boolean;
  className?: any;
}) {
  const { varient, loadingTracker } = props;

  const textVarient = varient === "indigo" || varient === "purple" || varient === "pink" ? "dark" : "light";
  return (
    <Card
      className={`mt-3 diwa-card ${props.className}`}
      bg={varient}
      text={textVarient}
      data-testid="card-parent"
      aria-busy={loadingTracker}
    >
      <Card.Body className="diwa-card-body" data-testid="card-content-body">
        {props.children}
      </Card.Body>
      {loadingTracker && (
        <div className="diwa-loading-overlay" aria-hidden="true">
          <div className="spinner-wrap" role="status" aria-live="polite" aria-label="Loading">
            <span className="fancy-spinner">
              <span className="glow" />
            </span>
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      )}
    </Card>
  );
}

export default DiwaCard;
