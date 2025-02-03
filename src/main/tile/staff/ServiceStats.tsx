import { useContext, useEffect, useState } from "react";
import DiwaCard from "../../../components/card/DiwaCard";
import DiwaButtonGroup from "../../../components/button/DiwaButtonGroup";
import { addDays, addMonths, endOfMonth, endOfWeek, startOfMonth } from "date-fns";
import { currencyFormatter, formatDate, formatDisplayDate, getFirstDayOfWeek } from "../Utility";
import { Button, Form, Offcanvas, Table } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { API_BASE_URL, TokenContext } from "../../../App";
import DiwaPaginationButton from "../../../components/button/DiwaPaginationButton";

export default function ServiceStats() {
  const { callAPI } = useContext(TokenContext);

  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(new Date());
  const buttonState = useState(2);
  const [buttonIndex, setButtonIndex] = buttonState;
  const [show, setShow] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [displayServices, setDisplayServices] = useState<any>({});
  const [filterText, setFilterText] = useState("");
  const [secondFilterText, setSecondFilterText] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [buttons] = useState([
    { title: "Daily", onClick: () => setDuration("day"), api: "day" },
    { title: "Weekly", onClick: () => setDuration("week"), api: "week" },
    { title: "Monthly", onClick: () => setDuration("month"), api: "month" },
    { title: "Yearly", onClick: () => setDuration("year"), api: "year" },
  ]);

  const setDuration = (duration: string) => {
    if (duration === "day") {
      setStartDate(new Date());
      setEndDate(new Date());
    } else if (duration === "week") {
      setStartDate(getFirstDayOfWeek(new Date()));
      setEndDate(new Date());
    } else if (duration === "month") {
      setStartDate(startOfMonth(new Date()));
      setEndDate(new Date());
    } else if (duration === "year") {
      setStartDate(new Date(new Date().getFullYear(), 0, 1));
      setEndDate(new Date());
    }
  };

  const previous = () => {
    switch (buttonIndex) {
      case 0:
        setStartDate(addDays(startDate, -1));
        setEndDate(addDays(endDate, -1));
        break;
      case 1:
        setStartDate(addDays(startDate, -7));
        setEndDate(addDays(endOfWeek(addDays(startDate, -7)), 1));
        break;
      case 2:
        setStartDate(addMonths(startDate, -1));
        setEndDate(endOfMonth(addMonths(startDate, -1)));
        break;
      case 3:
        setStartDate(addMonths(startDate, -12));
        setEndDate(endOfMonth(addMonths(startDate, -12)));
        break;
      default:
        break;
    }
    resetCache();
  };

  const next = () => {
    switch (buttonIndex) {
      case 0:
        setStartDate(addDays(startDate, 1));
        setEndDate(addDays(endDate, 1));
        break;
      case 1:
        setStartDate(addDays(startDate, 7));
        setEndDate(addDays(endOfWeek(addDays(endDate, 7)), 1));
        break;
      case 2:
        setStartDate(addMonths(startDate, 1));
        setEndDate(endOfMonth(addMonths(startDate, 1)));
        break;
      case 3:
        setStartDate(addMonths(startDate, 12));
        setEndDate(endOfMonth(addMonths(startDate, 12)));
        break;
      default:
        break;
    }
    resetCache();
  };

  const current = () => {
    switch (buttonIndex) {
      case 0:
        setStartDate(new Date());
        setEndDate(new Date());
        break;
      case 1:
        setStartDate(getFirstDayOfWeek(new Date()));
        setEndDate(new Date());
        break;
      case 2:
        setStartDate(startOfMonth(new Date()));
        setEndDate(new Date());
        break;
      default:
        break;
    }
    resetCache();
  };

  const refresh = () => {
    setStartDate(startOfMonth(new Date()));
    setEndDate(new Date());
    setButtonIndex(2);
    resetCache();
  };

  const resetCache = () => {
    setDailyData([]);
    setWeeklyData([]);
    setMonthlyData([]);
    setYearlyData([]);
  };

  useEffect(() => {
    setLoading(true);
    const apiURL = `${API_BASE_URL}/subcategory`;
    callAPI(apiURL, async (data: any) => {
      const categories = data.data;
      const fetchedServices: any[] = [];
      await Promise.all(
        categories.map(async (category: any) => {
          const services = category.vendor_services;
          fetchedServices.push(...services);
        })
      );
      setServices(fetchedServices);
      const storedServices: string | null = localStorage.getItem("servicesToTrack");
      const servicesToTrack = storedServices ? JSON.parse(storedServices) : [];
      setSelectedServices(servicesToTrack);
      setLoading(false);
    });
  }, [callAPI]);

  useEffect(() => {
    console.log("Calling useeffect 2");
    if (buttonIndex === 0 && Object.keys(dailyData).length > 0) {
      setDisplayServices(dailyData);
      return;
    } else if (buttonIndex === 1 && Object.keys(weeklyData).length > 0) {
      setDisplayServices(weeklyData);
      return;
    } else if (buttonIndex === 2 && Object.keys(monthlyData).length > 0) {
      setDisplayServices(monthlyData);
      return;
    } else if (buttonIndex === 3 && Object.keys(yearlyData).length > 0) {
      setDisplayServices(yearlyData);
      return;
    }

    const apiURL = `${API_BASE_URL}/vendor/report/sales?start_date=${formatDate(startDate)}&end_date=${formatDate(
      endDate
    )}&app_type=web&report_type=staff_by_service&range_type=${buttons[buttonIndex].api}`;
    setLoading(true);
    callAPI(apiURL, async (data: any) => {
      if (!data) {
        setLoading(false);
        return;
      }
      const checkedServices =
        selectedServices.length === 0 ? JSON.parse(localStorage.getItem("servicesToTrack") || "[]") : selectedServices;
      console.log("Checked services are ", checkedServices);
      const filteredServices =
        data?.data?.filter((service: any) => checkedServices && checkedServices.includes(service.service)) || [];
      //group filteredServices by service
      const groupedServices: any = {};

      await Promise.all(
        filteredServices.map((service: any) => {
          return new Promise<void>((resolve) => {
            if (!groupedServices[service.service]) {
              groupedServices[service.service] = [];
            }
            groupedServices[service.service].push(service);
            resolve();
          });
        })
      );

      console.log("Grouped services are ", groupedServices, data?.data);
      setDisplayServices(groupedServices);
      switch (buttonIndex) {
        case 0:
          setDailyData(groupedServices);
          break;
        case 1:
          setWeeklyData(groupedServices);
          break;
        case 2:
          setMonthlyData(groupedServices);
          break;
        case 3:
          setYearlyData(groupedServices);
          break;
        default:
          break;
      }
      setLoading(false);
    });
  }, [startDate, endDate, buttonIndex, buttons, callAPI]);

  const saveServiceSelection = (name: string, status: boolean) => {
    const trackedServices = [...selectedServices];
    if (status) {
      trackedServices.push(name);
    } else {
      const index = trackedServices.indexOf(name);
      if (index > -1) {
        trackedServices.splice(index, 1);
      }
    }

    localStorage.setItem("servicesToTrack", JSON.stringify(trackedServices));
    console.log(JSON.stringify(trackedServices));
    setSelectedServices(trackedServices);
  };

  const handleSelectAllChange = (isSelected: boolean) => {
    setSelectAll(isSelected);
    const filteredServiceNames = services
      .filter((v) => {
        if (filterText === "") return true;
        return v.service.toLowerCase().includes(filterText.toLowerCase());
      })
      .map((service: any) => service.service);
    if (isSelected) {
      const newSelectedServices = Array.from(new Set([...selectedServices, ...filteredServiceNames]));
      setSelectedServices(newSelectedServices);
      localStorage.setItem("servicesToTrack", JSON.stringify(newSelectedServices));
    } else {
      const newSelectedServices = selectedServices.filter((service) => !filteredServiceNames.includes(service));
      setSelectedServices(newSelectedServices);
      localStorage.setItem("servicesToTrack", JSON.stringify(newSelectedServices));
    }
  };

  const handleClose = () => {
    refresh();
    setShow(false);
  };

  const handleShow = () => {
    setShow(true);
  };

  return (
    <DiwaCard varient="indigo" loadingTracker={loading}>
      <DiwaButtonGroup buttons={buttons} state={buttonState} />
      <div className="position-relative">
        <h2 className="text-color">
          Service Analysis{" "}
          <p className="small text-color-danger-50 mb-1">
            {formatDisplayDate(startDate)} to {formatDisplayDate(endDate)}
          </p>
        </h2>
        <div className="position-absolute top-0 end-0" style={{ marginTop: -6 }}>
          <Button variant="indigo" className="text-color" size="lg" onClick={() => handleShow()}>
            <Icon.Gear />
          </Button>
          <Button variant="indigo" className="text-color" size="lg" onClick={() => refresh()}>
            <Icon.ArrowClockwise />
          </Button>
        </div>
        <DiwaPaginationButton previous={previous} current={current} next={next} />
        <div>
          <Form.Control
            type="text"
            placeholder="Enter service name"
            value={secondFilterText}
            className="mb-4"
            onChange={(e) => setSecondFilterText(e.target.value)}
          />
          <Table hover responsive>
            <tbody>
              {Object.keys(displayServices)
                .filter((v) => {
                  if (secondFilterText === "") return true;
                  return v.toLowerCase().includes(secondFilterText.toLowerCase());
                })
                .map((serviceName) => (
                  <>
                    <tr key={serviceName}>
                      <td colSpan={3} style={{ fontWeight: "bold" }} className="text-color">
                        {serviceName}
                      </td>
                    </tr>
                    {displayServices[serviceName].map((service: any, index: number) => (
                      <tr key={`${serviceName}-${index}`}>
                        <td className="text-color">{service.stylist}</td>
                        <td className="text-color">{service["service count"]}</td>
                        <td className="text-color">{currencyFormatter.format(service.price)}</td>
                      </tr>
                    ))}
                  </>
                ))}
              <tr key="total">
                <td className="text-white bg-primary fw-bold">Total</td>
                <td className="text-white bg-primary fw-bold">
                  {displayServices &&
                    Object.keys(displayServices).length > 0 &&
                    Object.values(displayServices).reduce((acc, val: any) => {
                      return (
                        acc + val.reduce((acc2: number, val2: any) => acc2 + Number.parseInt(val2["service count"]), 0)
                      );
                    }, 0)}
                </td>
                <td className="text-white bg-primary fw-bold">
                  {currencyFormatter.format(
                    displayServices &&
                      Object.keys(displayServices).length > 0 &&
                      Object.values(displayServices).reduce((acc, val: any) => {
                        return acc + val.reduce((acc2: number, val2: any) => acc2 + val2.price, 0);
                      }, 0)
                  )}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
        <Offcanvas
          show={show}
          className="h-auto bg-dark text-color"
          placement="bottom"
          backdrop={true}
          scroll={false}
          keyboard={false}
          id="offcanvasBottom"
          onHide={handleClose}
        >
          <Offcanvas.Header closeButton closeVariant="white">
            <h5>Select Services To Track</h5>
          </Offcanvas.Header>
          <Offcanvas.Body className="pt-0">
            <Form className="mt-0 text-color">
              <Form.Control
                type="text"
                placeholder="Enter service name"
                value={filterText}
                className="mb-4"
                onChange={(e) => setFilterText(e.target.value)}
              />
              <Form.Check
                type="switch"
                label="Select All"
                checked={selectAll}
                onChange={(e) => handleSelectAllChange(e.target.checked)}
              />

              {services
                .filter((v) => {
                  if (filterText === "") return true;
                  return v.service.toLowerCase().includes(filterText.toLowerCase());
                })
                .map((service: any) => (
                  <Form.Check
                    type="switch"
                    label={service.service + " (" + currencyFormatter.format(service.price) + ")"}
                    key={service.id}
                    checked={selectedServices.includes(service.service)}
                    onChange={(event) => saveServiceSelection(service.service, event.target.checked)}
                  />
                ))}
            </Form>
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </DiwaCard>
  );
}
