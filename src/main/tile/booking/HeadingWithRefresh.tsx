import { Button, Col, Row } from "react-bootstrap";
import DiwaRefreshButton from "../../../components/button/DiwaRefreshButton";
import * as Icon from "react-bootstrap-icons";
import DatePicker from "react-datepicker";
import "../../../custom-datepicker.css";
import { useState } from "react";
import { formatDate } from "date-fns";

function HeadingWithRefresh({
  date,
  onRefresh,
  onDateChange,
}: {
  date: Date;
  onRefresh: () => void;
  onDateChange?: (date: Date) => void;
}) {
  const [displayDate, setDisplayDate] = useState("Today");
  const selectDate = () => {
    if (onDateChange) onDateChange(new Date());
  };
  const calculateDisplayDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) {
      setDisplayDate("Today");
    } else if (date.toDateString() === yesterday.toDateString()) {
      setDisplayDate("Yesterday");
    } else {
      setDisplayDate("on " + formatDate(date, "dd MMM yyyy"));
    }
  };
  return (
    <Row>
      <Col lg="12" xs="12">
        <div className="position-relative today rounded">
          <h5 className="text-light ">Customers {displayDate}</h5>
          <div
            className="position-absolute top-0 end-0"
            style={{ marginTop: -12, marginRight: 30 }}
            data-testid="calendar-button-div"
          >
            <DatePicker
              customInput={
                <Button
                  variant="indigo"
                  className={`text-color`}
                  size="lg"
                  onClick={() => selectDate()}
                  data-testid="date-selector-button"
                >
                  <Icon.Calendar2Date data-testid="calendar-icon" />
                </Button>
              }
              selected={date}
              todayButton="Today"
              onChange={(date) => {
                calculateDisplayDate(date || new Date());
                if (onDateChange) onDateChange(date || new Date());
              }}
            />
          </div>

          <DiwaRefreshButton refresh={onRefresh} />
        </div>
      </Col>
    </Row>
  );
}

export default HeadingWithRefresh;
