import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Accordion, Button, Col, Form, Offcanvas, Row } from "react-bootstrap";
import { currencyFormatter, formatDate, formatDisplayDate, formatMobileNumber, formatTime } from "./Utility";
import * as Icon from "react-bootstrap-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpa, faTicket, faMoneyBill1, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { TokenContext, API_BASE_URL } from "../../App";
import DiwaCard from "../../components/card/DiwaCard";
import BillItem from "./booking/BillItem";
import HeadingWithRefresh from "./booking/HeadingWithRefresh";
import { compareAsc, compareDesc, differenceInMonths, formatDistanceToNow, parse } from "date-fns";
import JustHeading from "./booking/JustHeading";

interface CustomerDetails {
  id: number;
  email: string;
  fname: string;
  lname: string;
  gender: string;
  mobile: string;
  profile_pic: string | null;
  display_name: string;
  customer_uuid: string;
  is_mobile_verify: boolean;
}

interface Customer {
  user?: CustomerDetails;
  user_id?: number;
  registration_no?: string;
  id: number;
  type_id?: number;
  vendor_location_id?: number;
  is_member?: boolean;
  updatedAt?: string;
  amount_spend?: number;
  total_visit?: number;
  no_show?: number | null;
  wallet?: number;
  amount_due?: number;
  last_visit?: string;
  dial_code?: number;
  fname?: string;
  lname?: string;
  email?: string;
  mobile?: string;
  gender?: string;
  profile_pic?: string | null;
  rn?: string;
  totalBusiness: number;
}

interface Employee {
  id: string;
  name: string;
}

interface Bill {
  id: number;
  total: number;
  bill_number: string;
}

interface CustomerSummary {
  createdAt: string;
  services: string;
  status: number;
  token_number: number;
  employee: Employee;
  bill: Bill;
}

interface BookingData {
  customerName: string;
  start: string;
  end: string;
  desc: string;
  status: number;
  services: ServiceSummary[];
  billAmount: number;
  customer: Customer;
}

interface ServiceSummary {
  name: string;
  employee: string;
}

interface PaymentMode {
  amount: number;
  payment_mode: number;
}

interface Product {
  id: string;
  price: number;
  qty: number;
  discount: number;
  product: ProductSummary;
  employee: Employee;
}

interface ProductSummary {
  id: string;
  name: string;
  sac_code: number;
}

interface Service {
  id: number;
  price: number;
  qty: number;
  discount: number;
  tax: number;
  total: number;
  net: number;
  paid: number;
  redeem: number;
  discount_id: string;
  discount_type: string;
  emp_share_on_redeem: number;
  p_modes: PaymentMode[];
  tax_percent: number;
  tax_1_percent: number;
  tax_2_percent: number;
  employee: Employee;
  vendor_service: {
    id: number;
    service: string;
    service_time: string;
    sub_category: {
      sac_code: string;
    };
  };
}

interface Membership {
  id: number;
  price: number;
  qty: number;
  discount: number;
  tax: number;
  total: number;
  net: number;
  paid: number;
  redeem: number;
  discount_id: string;
  discount_type: string;
  emp_share_on_redeem: number;
  p_modes: PaymentMode[];
  tax_percent: number;
  tax_1_percent: number;
  tax_2_percent: number;
  employee: Employee;
  membership: {
    id: number;
    membership_type: {
      id: number;
      type: string;
    };
  };
  bill_service_splits: any[];
}

interface Package {
  id: number;
  employee_id: number;
  price: number;
  qty: number;
  discount: number;
  tax: number;
  total: number;
  net: number;
  paid: number;
  redeem: number;
  discount_id: string | null;
  discount_type: string | null;
  emp_share_on_redeem: number;
  p_modes: PaymentMode[];
  tax_percent: number;
  tax_1_percent: number;
  tax_2_percent: number;
  package: {
    id: number;
    package_type: {
      id: number;
      package_name: string;
    };
  };
  employee: Employee;
}

interface Voucher {
  employee_id: number;
  price: number;
  qty: number;
  discount: number;
  tax: number;
  total: number;
  net: number;
  paid: number;
  redeem: number;
  discount_id: string | null;
  discount_type: string | null;
  emp_share_on_redeem: number;
  p_modes: PaymentMode[] | null;
  tax_percent: number | null;
  tax_1_percent: number | null;
  tax_2_percent: number | null;
  voucher: {
    id: number;
    voucher_type: {
      id: number;
      name: string;
    };
  };
  employee: Employee;
}

interface Tip {
  id: number;
  bill_id: number;
  employee_id: number;
  suggested_amount: number;
  received_amount: number;
  is_settled: boolean;
  createdAt: string;
  updatedAt: string;
  employee: Employee;
}

interface BillPayment {
  id: number;
  bill_id: number;
  payment_date: string;
  payment_mode: number;
  amount: number;
  redemption: boolean;
  note: string;
  vendor_location_id: string;
  createdAt: string;
  updatedAt: string;
}

interface BillingData {
  id: number;
  selected_date: string;
  bill_number: string;
  total: number;
  paid: number;
  payment_status: string;
  status: boolean;
  cancel_reason: string;
  net: number;
  tax: number;
  roundoff: number;
  user: {
    id: number;
    fname: string;
    lname: string;
    display_name: string;
    mobile: string;
    is_member: boolean;
  };
  products: Product[];
  services: Service[];
  memberships: Membership;
  packages: Package;
  vouchers: Voucher[];
  tips: Tip[];
  payments: {
    price: number;
    discount: number;
    tax: number;
    total: number;
  };
  bill_payments: BillPayment[];
}

interface Appointment {
  id: number;
  status: string;
  bill: {
    id: number | null;
  };
}

interface Bill {
  id: number;
}

interface Book {
  id: number;
  status: number;
  token_number: number;
  createdAt: string;
  start_time: string;
  end_time: string;
  employee_name: string;
  employee_id: number;
  services: string;
  is_editable: boolean;
  source: number;
  bill: Bill;
}

interface ExtendedProps {
  user: Customer;
  req_employee: string | null;
  book: Book;
  appointment: Appointment;
}

interface Booking {
  id: number;
  resourceId: number;
  start: string;
  end: string;
  p_start: string | null;
  p_end: string | null;
  orig_start: string;
  orig_end: string;
  desc: string;
  createdAt: string;
  is_active_queue: boolean;
  show_separate_bill: boolean;
  title: string;
  extendedProps: ExtendedProps;
}

export default function BookingsV2() {
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const { callAPI, callPUTAPI, callAPIPromise } = useContext(TokenContext);
  const [customerDetails, setCustomerDetails] = useState([
    { id: 0, user_histories: [{ amount_spend: 0, total_visit: 0 }] },
  ] as Array<any>);
  const [show, setShow] = useState(false);
  const [summaryShow, setSummaryShow] = useState(false);
  const [customerSummary, setCustomerSummary] = useState<CustomerSummary[]>([]);

  const firstName = useRef<HTMLInputElement>(null);
  const lastName = useRef<HTMLInputElement>(null);
  const [firstNameValue, setFirstNameValue] = useState("");
  const [lastNameValue, setLastNameValue] = useState("");
  const [customerId, setCustomerId] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [clicked, setClicked] = useState(false);
  const handleClose = () => setShow(false);
  const handleSummaryClose = () => setSummaryShow(false);

  const [bookingData, setBookingData] = useState<BookingData[]>([]);
  const [billingData, setBillingData] = useState<BillingData[]>([]);
  const [groupedMembers, setGroupedMembers] = useState<Partial<Record<string, Customer[]>>>({});

  const statusColor = ["dark", "primary", "danger", "success", "dark", "primary", "dark", "warning", "warning"];
  const statusDesc = [
    "Unknown",
    "Service Started",
    "Cancelled",
    "Completed - Bill not generated",
    "Unknown",
    "Upcoming",
    "Confirmed",
    "Tentative",
    "Customer Arrived",
  ];
  const inactiveDurationInMonths = 2;

  const loadMembers = useCallback(async () => {
    const memberURL = `${API_BASE_URL}/vendor/customer_list?page=1&limit=500&amount_start=0&membership_type=0&amount_start=0&is_multi_location=false`;
    const members = await callAPIPromise(memberURL);
    const inactiveMembers: Customer[] = members.data.filter(
      (v: Customer) =>
        differenceInMonths(new Date(), parse(v.last_visit || "", "yyyy-MM-dd", new Date())) > inactiveDurationInMonths
    );
    setGroupedMembers(
      Object.groupBy(
        inactiveMembers,
        (v) => `${formatDistanceToNow(parse(v.last_visit || "", "yyyy-MM-dd", new Date()), { addSuffix: true })}`
      )
    );
    return members;
  }, [callAPIPromise]);

  const loadBillingData = useCallback(
    async (members: any, bookingDate: Date) => {
      const billURL = `${API_BASE_URL}/vendor/bills?web=true&page=1&limit=1000&start=${formatDate(
        bookingDate
      )}&end=${formatDate(bookingDate)}&term=&is_product_only=`;
      const bills = await callAPIPromise(billURL);
      if (!bills || bills.data.length === 0) {
        setBillingData([]);
      } else {
        const updatedBills = await Promise.all(
          bills.data.map(async (bill: any) => {
            const billDetailsURL = `${API_BASE_URL}/bill?bill_id=${bill.id}`;
            const billDetails = await callAPIPromise(billDetailsURL);
            const {
              billSItems,
              billPItems,
              billmitem,
              billpkitem,
              billvitems,
              bill_tips,
              price,
              discount,
              tax,
              total,
            } = billDetails.data;
            bill.services = billSItems || [];
            bill.products = billPItems || [];
            bill.memberships = billmitem;
            bill.packages = billpkitem;
            bill.vouchers = billvitems;
            bill.tips = bill_tips || [];
            bill.payments = { price, discount, tax, total };
            //Check if user is a member
            bill.user.is_member = members.data.some((m: { user_id: any }) => m.user_id === bill.user.id);
            return bill;
          })
        );
        setBillingData(updatedBills);
      }
    },
    [callAPIPromise]
  );

  const loadAppointments = useCallback(async () => {
    // const bookingDate = appointmentDate;
    const apiURL = `${API_BASE_URL}/calender/booking?date=${formatDate(appointmentDate)}`;
    const appointments = await callAPIPromise(apiURL);
    return appointments.data;
  }, [appointmentDate, callAPIPromise]);

  useEffect(() => {
    const doIt = async () => {
      const appointments: Booking[] = await loadAppointments();
      const groupedAppointments =
        Object.groupBy(appointments, (b) => {
          return ((b.extendedProps.user.fname || "") + (b.extendedProps.user.lname || "")).trim();
        }) || [];

      const customers = await Promise.all(
        appointments.map(async (appointment: any) => {
          const customerURL = `${API_BASE_URL}/vendor/customer/detail?id=${appointment.extendedProps.user.id}&is_multi_location=false`;
          const customerData = await callAPIPromise(customerURL);
          return customerData.data;
        })
      );

      setCustomerDetails(customers);

      const members = await loadMembers();

      const bookings = Object.keys(groupedAppointments)
        .filter((v) => {
          const a = groupedAppointments[v] || [];
          return a[0].extendedProps.book.bill ? false : true;
        })
        .map((v) => {
          const data = groupedAppointments[v] || [];
          const startDate = data
            .map((m: { start: any }) => m.start)
            .sort((a, b) => {
              return compareAsc(a, b);
            })[0];
          const endDate = data
            .map((m: { end: any }) => m.end)
            .sort((a, b) => {
              return compareDesc(a, b);
            })[0];
          const services: { name: any; employee: any }[] = [];
          let billAmount = 0;
          data.forEach((d: { extendedProps: { book: { services: string; employee_name: any } } }) => {
            d.extendedProps.book.services.split(",").map((a: any) => {
              billAmount += extractAmount(a);
              services.push({
                name: a,
                employee: d.extendedProps.book.employee_name,
              });
              return null;
            });
          });
          return {
            customerName: v,
            start: startDate,
            end: endDate,
            desc: data[0].desc && " Because " + data[0].desc.split("reason : ")[1],
            status: data[0].extendedProps.book.status,
            services: services,
            billAmount: billAmount,
            customer: {
              id: data[0].extendedProps.user.id,
              totalBusiness: 0,
            },
          };
        });
      setBookingData(bookings);

      await loadBillingData(members, appointmentDate);
    };

    setLoading(true);
    Promise.all([doIt()]).then(() => {
      setLoading(false);
    });
  }, [reload, appointmentDate, loadMembers, loadBillingData, loadAppointments, callAPIPromise]);

  const extractAmount = (txt: string): number => {
    const indexOfSymbol = txt.indexOf("₹");
    if (indexOfSymbol < 0) return 0;
    let amountString = txt.substring(indexOfSymbol + 1);
    amountString = amountString.substring(0, amountString.length - 1);
    return parseFloat(amountString);
  };

  const refresh = () => {
    setLoading(true);
    setReload(!reload);
  };

  const editName = (id: number, fname: string, lname: string) => {
    setShow(true);
    setCustomerId(id);
    setFirstNameValue(fname);
    setLastNameValue(lname);
  };

  const submitUpdatedName = (e: any) => {
    e.preventDefault();
    if (clicked) return;
    setClicked(true);
    const apiURL = `${API_BASE_URL}/vendor/customer_detail`;
    const getAPIURL = `${API_BASE_URL}/vendor/customer/detail?id=${customerId}&is_multi_location=false`;
    callAPI(getAPIURL, (customerData: any) => {
      const data = {
        ...customerData.data,
        id: customerId,
        fname: firstName.current?.value || firstNameValue,
        lname: lastName.current?.value || lastNameValue,
      };
      callPUTAPI(apiURL, data, (customerData: any) => {
        if (customerData.success) {
          setErrorMessage("");
          setClicked(false);
          handleClose();
          refresh();
        } else {
          setErrorMessage("Failed to update name");
          setClicked(false);
        }
      });
    });
  };

  const loadSummary = async () => {
    const apiURL = `${API_BASE_URL}/vendor/customer/history?id=${customerId}&page=1&limit=100&multiLocation=true`;
    const summary = await callAPIPromise(apiURL);
    setCustomerSummary(summary.data);
  };

  type Varient = "danger" | "success" | "primary" | "warning" | "dark" | "indigo" | "purple";

  return (
    <div>
      <HeadingWithRefresh
        date={appointmentDate}
        onRefresh={() => refresh()}
        onDateChange={(date: Date) => setAppointmentDate(date)}
      />

      <Row>
        {billingData.length === 0 ? (
          <Col md={12} xs={12} className="gy-2">
            <DiwaCard varient="primary" loadingTracker={loading}>
              <h2 className="text-color">No customers yet</h2>
            </DiwaCard>
          </Col>
        ) : (
          billingData.map((booking, index) => {
            const cust = customerDetails.find((v) => v.id === booking.user.id)?.user_histories[0];
            return (
              <Col md={12} xs={12} className="gy-2" key={"booking" + index}>
                <DiwaCard varient={booking.status ? "success" : "danger"} loadingTracker={loading}>
                  <div>
                    <h3 className="text-color">
                      {booking.user.is_member ? (
                        <Icon.StarFill style={{ marginTop: -4, paddingRight: 4 }} color="gold" />
                      ) : (
                        ""
                      )}
                      <span
                        onClick={() => {
                          setCustomerId(booking.user.id);
                          setSummaryShow(true);
                        }}
                      >
                        {`${booking.user.fname || ""} ${booking.user.lname || ""}`.trim()} (
                        {currencyFormatter.format(booking.payments.total)})
                      </span>
                      <p className="d-inline float-end small">
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          onClick={() => editName(booking.user.id, `${booking.user.fname}`, `${booking.user.lname}`)}
                        />
                      </p>
                      <p className="d-block small mb-0 text-color-50">
                        Spent {currencyFormatter.format(cust?.amount_spend)} in {cust?.total_visit} visits with average
                        of {currencyFormatter.format(cust?.amount_spend / cust?.total_visit)} per visit
                      </p>
                      <p className="d-block small mb-0 text-color-50">
                        Mobile:{" "}
                        <a href={`tel:${formatMobileNumber(booking.user.mobile)}`} className="text-color-50">
                          {formatMobileNumber(booking.user.mobile)}
                        </a>
                      </p>
                    </h3>

                    <div className="small"></div>
                    <ul className="list-group list-group-flush">
                      {booking.services.map((service, index) => (
                        <BillItem
                          key={booking.id + "s" + index}
                          uniqueKey={booking.id + "s" + index}
                          name={service.vendor_service.service}
                          employee={service.employee.name}
                          amount={service.price * service.qty}
                          discount={service.discount}
                          Icon={FontAwesomeIcon}
                          iconProps={{ icon: faSpa, className: "bill-item-icon" }}
                        />
                      ))}
                      {booking.products.map((prod, index) => (
                        <BillItem
                          key={booking.id + "p" + index}
                          uniqueKey={booking.id + "p" + index}
                          name={prod.product.name}
                          employee={prod.employee.name}
                          amount={prod.price}
                          discount={prod.discount}
                          Icon={Icon.BoxSeam}
                          iconProps={{ className: "bill-item-icon", style: { marginTop: -4 } }}
                        />
                      ))}

                      {booking.packages && (
                        <BillItem
                          key={booking.id + "pk" + index}
                          uniqueKey={booking.id + "pk" + index}
                          name={booking.packages.package.package_type.package_name}
                          employee={booking.packages.employee.name}
                          amount={booking.packages.price}
                          discount={booking.packages.discount}
                          Icon={Icon.UiChecksGrid}
                          iconProps={{ className: "bill-item-icon", style: { marginTop: -4 } }}
                        />
                      )}

                      {booking.memberships && (
                        <BillItem
                          key={booking.id + "m" + index}
                          uniqueKey={booking.id + "m" + index}
                          name={booking.memberships.membership.membership_type.type}
                          employee={booking.memberships.employee.name}
                          amount={booking.memberships.price}
                          discount={booking.memberships.discount}
                          Icon={Icon.StarFill}
                          iconProps={{ className: "bill-item-icon", style: { marginTop: -4 } }}
                        />
                      )}

                      {booking.vouchers.map((voucher, index) => (
                        <BillItem
                          key={booking.id + "v" + index}
                          uniqueKey={booking.id + "v" + index}
                          name={voucher.voucher.voucher_type.name}
                          employee={voucher.employee.name}
                          amount={voucher.price}
                          discount={voucher.discount}
                          Icon={FontAwesomeIcon}
                          iconProps={{ icon: faTicket, className: "bill-item-icon" }}
                        />
                      ))}

                      {booking.tips.map((tip, index) => (
                        <BillItem
                          key={booking.id + "tip" + index}
                          uniqueKey={booking.id + "tip" + index}
                          name={`Tip for ${tip.employee.name}`}
                          employee={""}
                          amount={tip.suggested_amount}
                          discount={0}
                          Icon={FontAwesomeIcon}
                          iconProps={{ icon: faMoneyBill1, className: "bill-item-icon" }}
                        />
                      ))}
                    </ul>
                    <hr className="mt-1 mb-1 border-color" />
                    <div className="w-100 text-color-50">
                      {booking.status ? (
                        <>
                          <div className="text-start d-inline small align-top">
                            Without discount: {currencyFormatter.format(booking.payments.price)}
                          </div>
                          <div className="text-end d-inline small float-end align-top">
                            Discount: {currencyFormatter.format(booking.payments.discount)} (
                            {Math.round((booking.payments.discount * 100) / booking.payments.price)}%)
                          </div>
                        </>
                      ) : (
                        <div className="text-start d-inline small">Cancellation Reason: {booking.cancel_reason}</div>
                      )}
                    </div>
                  </div>
                </DiwaCard>
              </Col>
            );
          })
        )}
      </Row>
      <Row>
        {bookingData.map((booking) => {
          const varient = (statusColor[booking.status] || "dark") as Varient;
          return (
            <Col md={12} xs={12} className="gy-2" key={booking.customerName}>
              <DiwaCard varient={varient} loadingTracker={loading}>
                <div className="text-color">
                  <h3
                    onClick={() => {
                      setCustomerId(booking.customer.id);
                      setSummaryShow(true);
                    }}
                  >
                    {booking.customerName} ({currencyFormatter.format(booking.billAmount)})
                  </h3>
                  <ul className="list-group list-group-flush">
                    {booking.services.map((service) => {
                      return (
                        <li
                          className="list-group-item bg-transparent text-color border-color ps-0"
                          key={booking.customerName + service.name}
                        >
                          {service.name}
                          <p className="small text-color-50 mb-0" style={{ marginTop: -4 }}>
                            {service.employee}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <hr className="mt-1 mb-1 border-color" />
                <div className="w-100 text-color">
                  <div className="text-start d-inline small align-top">
                    {statusDesc[booking.status] || "Unknown"}
                    {booking.desc}
                  </div>
                  <div className="text-end d-inline small float-end align-top">
                    {formatTime(new Date(booking.start))} - {formatTime(new Date(booking.end))}
                  </div>
                </div>
              </DiwaCard>
            </Col>
          );
        })}
      </Row>
      <Row>
        <Col>&nbsp;</Col>
      </Row>
      <JustHeading title1="Inactive Members" />
      <DiwaCard varient="primary" loadingTracker={loading}>
        {Object.keys(groupedMembers).map((keyName, index) => {
          const val = groupedMembers[keyName];
          return (
            <Accordion flush key={"stockitem" + index}>
              <Accordion.Header className="w-100">
                <div className="w-100 pe-2 pb-2">
                  <div className="text-start d-inline h5 text-color">Visited {keyName}</div>
                  <div className="text-end d-inline float-end text-color">{val?.length} members</div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <ul className="list-group list-group-flush">
                  {val?.map((item: any, index2: number) => {
                    return (
                      <li
                        className="list-group-item bg-transparent text-color border-color ps-0"
                        key={item.user.fname + "inactive" + index2}
                      >
                        <div className="d-flex justify-content-between">
                          <div
                            onClick={() => {
                              setCustomerId(item.user.id);
                              setSummaryShow(true);
                            }}
                          >
                            {item.user.fname} {item.user.lname}
                          </div>
                          <div>
                            <p className={`small text-color-50 mb-0`} style={{ marginTop: -4 }}>
                              Mobile:{" "}
                              <a href={`tel:${formatMobileNumber(item.mobile)}`} className="text-color-50">
                                {formatMobileNumber(item.mobile)}
                              </a>
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Accordion.Body>
            </Accordion>
          );
        })}
      </DiwaCard>
      <Offcanvas
        show={show}
        className="h-auto bg-dark text-white"
        placement="bottom"
        backdrop={true}
        scroll={false}
        keyboard={false}
        id="offcanvasBottom"
        onHide={handleClose}
      >
        <Offcanvas.Header closeButton closeVariant="color">
          <h5 className="text-color">Edit Name</h5>
        </Offcanvas.Header>
        <Offcanvas.Body className="pt-0">
          <Form className="mt-0 text-color" onSubmit={submitUpdatedName}>
            <Row className="align-items-center mb-1">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="mb-1">First Name</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="First Name"
                    ref={firstName}
                    defaultValue={firstNameValue}
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="mb-1">Last Name</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Last Name"
                    ref={lastName}
                    defaultValue={lastNameValue}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="align-items-center pt-3">
              <Col xs={12}>
                <Button variant="success" className="text-light" type="submit" disabled={clicked}>
                  {clicked ? "Wait..." : "Save"}
                </Button>
              </Col>
            </Row>
            {errorMessage !== "" && (
              <Row className="align-items-center mb-2">
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="mb-1 text-danger">{errorMessage}</Form.Label>
                  </Form.Group>
                </Col>
              </Row>
            )}
            <Row className="align-items-center">
              &nbsp;
              <br />
              <br />
            </Row>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Customer Summary */}
      <Offcanvas
        show={summaryShow}
        className="h-auto text-color"
        placement="bottom"
        backdrop={true}
        scroll={false}
        keyboard={false}
        id="offcanvasBottom"
        onHide={handleSummaryClose}
        onShow={() => loadSummary()}
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <h5>Customer Summary</h5>
        </Offcanvas.Header>
        <Offcanvas.Body className="pt-0">
          <ul className="list-group list-group-flush">
            {customerSummary.map((val, index) => {
              return (
                <li className="list-group-item bg-transparent text-color border-color ps-0" key={val + "item" + index}>
                  <div className="w-100 pe-2 pb-2">
                    {val.services.split(",").map((service: string, index2: number) => {
                      return <div className="text-start d-block">{service}</div>;
                    })}
                    <div className="text-start d-inline small align-top text-color-50">
                      <div className="text-start d-inline float-start">
                        By {val.employee.name} On {formatDisplayDate(new Date(val.createdAt))}
                      </div>
                      {val.bill?.total && (
                        <div className="text-end d-inline float-end">
                          Total Bill: {currencyFormatter.format(val.bill?.total)}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
