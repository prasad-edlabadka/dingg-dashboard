import { render } from "@testing-library/react";
import Consumption from "../../src/main/tile/Consumption";
import callAPI, { formatDate } from "../../src/main/tile/Utility";
import { groupBy } from "lodash";

jest.mock("../../utils/helpers", () => ({
  groupBy: jest.fn(),
}));

describe("Consumption component tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock setLoading and setConsumptionData functions
  const setLoading = jest.fn();
  const setConsumptionData = jest.fn();

  test("should call API with correct URL", () => {
    render(<Consumption />);
    const currentDate = new Date();
    const expectedURL = `API_BASE_URL/vendor/report/sales?start_date=${formatDate(
      currentDate
    )}&report_type=product_consumption_log&locations=null&app_type=web`;
    expect(callAPI).toHaveBeenCalledWith(expectedURL, expect.any(Function));
  });

  test("should set consumption data and loading state correctly", () => {
    const mockData = {
      data: [
        { Category: "Category1", "Sub Category": "SubCategory1" },
        { Category: "Category2", "Sub Category": "SubCategory2" },
      ],
    };
    const mockGroupedData = {
      "Category1 - SubCategory1": [
        { Category: "Category1", "Sub Category": "SubCategory1" },
      ],
      "Category2 - SubCategory2": [
        { Category: "Category2", "Sub Category": "SubCategory2" },
      ],
    };
    jest.mock("../../utils/api", () => ({
      callAPI: jest.fn().mockImplementationOnce((url, callback) => {
        callback(mockData);
      }),
    }));

    render(<Consumption />);

    // Expectations
    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setConsumptionData).toHaveBeenCalledWith(mockGroupedData);
    expect(setLoading).toHaveBeenCalledWith(false);
  });
});