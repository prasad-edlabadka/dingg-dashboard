import { Button, Col, Row } from "react-bootstrap";
import DiwaRefreshButton from "../../../components/button/DiwaRefreshButton";
import * as Icon from "react-bootstrap-icons";
// import DatePicker from "react-datepicker";
import DatePicker, { DateConfig } from "react-mobile-datepicker-ts";
import "../../../custom-datepicker.css";
import { useEffect, useState } from "react";
import { formatDate } from "date-fns";
// import "react-mobile-datepicker-ts/dist/main.css";

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
  const monthMap = {
    "1": "Jan",
    "2": "Feb",
    "3": "Mar",
    "4": "Apr",
    "5": "May",
    "6": "Jun",
    "7": "Jul",
    "8": "Aug",
    "9": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
  };

  const dateConfig: DateConfig[] = [
    {
      type: "year",
      format: "YYYY",
      caption: "Year",
      step: 1,
    },
    {
      type: "month",
      format: (value: Date) => monthMap[(value.getMonth() + 1 + "") as keyof typeof monthMap],
      caption: "Month",
      step: 1,
    },
    {
      type: "date",
      format: "DD",
      caption: "Day",
      step: 1,
    },
  ];

  function detectMobileAndOS() {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // Detect Mobile
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

    // Detect OS
    let os: string | null = null;

    if (/windows phone/i.test(userAgent)) {
      os = "Windows Phone";
    } else if (/android/i.test(userAgent)) {
      os = "Android";
    } else if (/ipad|iphone|ipod/i.test(userAgent)) {
      os = "iOS";
    } else if (/macintosh/i.test(userAgent) && "ontouchend" in document) {
      os = "iPadOS"; // iPadOS detection
    } else if (/mac/i.test(userAgent)) {
      os = "MacOS";
    } else if (/win/i.test(userAgent)) {
      os = "Windows";
    } else if (/linux/i.test(userAgent)) {
      os = "Linux";
    } else {
      os = "Unknown";
    }

    return { isMobile, os };
  }

  useEffect(() => {
    console.log("showDatePicker", showDatePicker);
    const body = document.getElementsByTagName("body")[0];
    if (showDatePicker) {
      body.classList.add("modal-open");
      body.style.overflow = "hidden";
    } else {
      body.classList.remove("modal-open");
      body.style.overflow = "auto";
    }
  }, [showDatePicker]);

  const [isIos] = useState(
    detectMobileAndOS().os === "iOS" || detectMobileAndOS().os === "iPadOS" || detectMobileAndOS().os === "MacOS"
  );

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
            <Button
              variant="indigo"
              className={`text-color`}
              size="lg"
              onClick={() => setShowDatePicker(true)}
              data-testid="date-selector-button"
            >
              <Icon.Calendar2Date data-testid="calendar-icon" className="text-light" />
            </Button>
            <DatePicker
              value={date}
              isOpen={showDatePicker}
              onSelect={(date: any) => {
                calculateDisplayDate(date || new Date());
                if (onDateChange) onDateChange(date || new Date());
                setShowDatePicker(false);
              }}
              onCancel={() => {
                setShowDatePicker(false);
              }}
              theme={isIos ? "ios" : "android"}
              isPopup={true}
              max={new Date()}
              showHeader={true}
              showFooter={true}
              showCaption={true}
              dateConfig={dateConfig}
              headerFormat="DD-MM-YYYY"
            />
          </div>

          <DiwaRefreshButton refresh={onRefresh} className="text-light" />
        </div>
      </Col>
    </Row>
  );
}

export default HeadingWithRefresh;
