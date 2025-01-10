const responseMap = [
  {
    payload: {},
    urlKind: "salesReport",
    reportType: "by_type",
  },
];
export const getStubbedResponse = (param: string) => {
  const url = new URL(param);
  if (url === null) return {};
  console.log("Trying to find response for url ", url);
  const urlKind = url.pathname.includes("/report/sales") ? "salesReport" : "";
  const reportType = url.searchParams.get("report_type");
  const response = responseMap.find((v) => v.urlKind === urlKind && v.reportType === reportType)?.payload;
  console.log("Found response as ", response);
  return response;
};
