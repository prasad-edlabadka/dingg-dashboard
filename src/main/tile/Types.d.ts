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

interface Prepaid {
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
  voucher: {
    id: number;
    voucher_type: {
      id: number;
      name: string;
    };
  };
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
  prepaid: Prepaid[];
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
