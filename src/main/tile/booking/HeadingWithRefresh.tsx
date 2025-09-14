import { Button, Col, Row, Offcanvas } from "react-bootstrap";
import DiwaRefreshButton from "../../../components/button/DiwaRefreshButton";
import * as Icon from "react-bootstrap-icons";
import { useState } from "react";
import { formatDate } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../../custom-datepicker.css";

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
  const [showDatePicker, setShowDatePicker] = useState(false);

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
  // const monthMap = {
  //   "1": "Jan",
  //   "2": "Feb",
  //   "3": "Mar",
  //   "4": "Apr",
  //   "5": "May",
  //   "6": "Jun",
  //   "7": "Jul",
  //   "8": "Aug",
  //   "9": "Sep",
  //   "10": "Oct",
  //   "11": "Nov",
  //   "12": "Dec",
  // };

  // Month map is no longer needed with react-datepicker

  // function detectMobileAndOS() {
  //   const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  //   // Detect Mobile
  //   const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

  //   // Detect OS
  //   let os: string | null = null;

  //   if (/windows phone/i.test(userAgent)) {
  //     os = "Windows Phone";
  //   } else if (/android/i.test(userAgent)) {
  //     os = "Android";
  //   } else if (/ipad|iphone|ipod/i.test(userAgent)) {
  //     os = "iOS";
  //   } else if (/macintosh/i.test(userAgent) && "ontouchend" in document) {
  //     os = "iPadOS"; // iPadOS detection
  //   } else if (/mac/i.test(userAgent)) {
  //     os = "MacOS";
  //   } else if (/win/i.test(userAgent)) {
  //     os = "Windows";
  //   } else if (/linux/i.test(userAgent)) {
  //     os = "Linux";
  //   } else {
  //     os = "Unknown";
  //   }

  //   return { isMobile, os };
  // }

  // Body overflow is handled automatically by React Bootstrap's Offcanvas

  // const [isIos] = useState(
  //   detectMobileAndOS().os === "iOS" || detectMobileAndOS().os === "iPadOS" || detectMobileAndOS().os === "MacOS"
  // );

  return (
    <Row className="customer-card-container">
      <Col lg="12" xs="12">
        <div className="heading-bar-customers">
          <h5 className="heading-title">Customers {displayDate}</h5>
          <div className="customers-actions">
            <Button
              variant="indigo"
              className="calendar-btn"
              size="lg"
              onClick={() => setShowDatePicker(true)}
              data-testid="date-selector-button"
            >
              <Icon.Calendar2Date data-testid="calendar-icon" className="icon" />
            </Button>
            <Offcanvas
              show={showDatePicker}
              onHide={() => setShowDatePicker(false)}
              placement="bottom"
              className="offcanvas-glass text-color"
              backdrop={true}
              scroll={false}
              keyboard={false}
            >
              <Offcanvas.Header closeButton closeVariant="color" className="offcanvas-head">
                <h5 className="text-color">Select Date</h5>
              </Offcanvas.Header>
              <Offcanvas.Body className="offcanvas-body pt-0">
                <DatePicker
                  selected={date}
                  onChange={(newDate: Date | null) => {
                    if (newDate) {
                      calculateDisplayDate(newDate);
                      if (onDateChange) onDateChange(newDate);
                      setShowDatePicker(false);
                    }
                  }}
                  inline
                  maxDate={new Date()}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  dateFormat="dd MMM yyyy"
                  monthsShown={1}
                  calendarClassName="mobile-friendly-calendar text-color"
                />
              </Offcanvas.Body>
            </Offcanvas>
            <DiwaRefreshButton refresh={onRefresh} className="refresh-btn" />
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default HeadingWithRefresh;
