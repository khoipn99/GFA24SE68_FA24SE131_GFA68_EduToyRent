import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import apiUser from "../../service/ApiUser";
import apiTransaction from "../../service/ApiTransaction";

import Cookies from "js-cookie";

// Chart options configuration
const options = {
  legend: {
    show: false,
    position: "top",
    horizontalAlign: "left",
  },
  colors: ["#3C50E0", "#80CAEE"],
  chart: {
    fontFamily: "Satoshi, sans-serif",
    height: 335,
    type: "area",
    dropShadow: {
      enabled: true,
      color: "#623CEA14",
      top: 10,
      blur: 4,
      left: 0,
      opacity: 0.1,
    },
    toolbar: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: {
          height: 300,
        },
      },
    },
    {
      breakpoint: 1366,
      options: {
        chart: {
          height: 350,
        },
      },
    },
  ],
  stroke: {
    width: [2, 2],
    curve: "straight",
  },
  grid: {
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 4,
    colors: "#fff",
    strokeColors: ["#3056D3", "#80CAEE"],
    strokeWidth: 3,
  },
  xaxis: {
    type: "category",
    categories: [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    title: {
      style: {
        fontSize: "0px",
      },
    },
  },
};

const ChartOne = () => {
  const [listTotalProfit, setListTotalProfit] = useState([]);
  const [listTransactions, setListTransactions] = useState([]);
  const [customerInfo, setCustomerInfo] = useState([]);

  const [state, setState] = useState({
    series: [
      {
        name: "Product One",
        data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 45],
      },
      {
        name: "Product Two",
        data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 51],
      },
    ],
  });

  useEffect(() => {
    const userDataCookie = Cookies.get("userDataReal");
    if (userDataCookie) {
      var parsedUserData;
      try {
        parsedUserData = JSON.parse(userDataCookie);
        setCustomerInfo(parsedUserData);
        console.log("Parsed user data:", parsedUserData);

        apiTransaction
          .get("?pageIndex=1&pageSize=1000", {
            headers: {
              Authorization: `Bearer ${Cookies.get("userToken")}`,
            },
          })
          .then((response) => {
            setListTransactions(response.data);
            console.log(response.data);
            // Gọi hàm và in kết quả
            const revenueData = getLast12MonthsRevenue(response.data);
            console.log(revenueData);
            setListTotalProfit(revenueData);
            setState({
              series: [
                {
                  name: "Doanh thu",
                  data: [
                    revenueData[11].totalRevenue,
                    revenueData[10].totalRevenue,
                    revenueData[9].totalRevenue,
                    revenueData[8].totalRevenue,
                    revenueData[7].totalRevenue,
                    revenueData[6].totalRevenue,
                    revenueData[5].totalRevenue,
                    revenueData[4].totalRevenue,
                    revenueData[3].totalRevenue,
                    revenueData[2].totalRevenue,
                    revenueData[1].totalRevenue,
                    revenueData[0].totalRevenue,
                  ],
                },
                {
                  name: "Lợi nhuận",
                  data: [
                    revenueData[11].totalProfit,
                    revenueData[10].totalProfit,
                    revenueData[9].totalProfit,
                    revenueData[8].totalProfit,
                    revenueData[7].totalProfit,
                    revenueData[6].totalProfit,
                    revenueData[5].totalProfit,
                    revenueData[4].totalProfit,
                    revenueData[3].totalProfit,
                    revenueData[2].totalProfit,
                    revenueData[1].totalProfit,
                    revenueData[0].totalProfit,
                  ],
                },
              ],
            });
          });
      } catch (error) {
        console.error("Error parsing userDataCookie:", error);
      }
    } else {
      console.warn("Cookie 'userDataReal' is missing or undefined.");
    }
  }, []);

  const getLast12MonthsRevenue = (transactions) => {
    const currentDate = new Date();
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(currentDate);
      month.setMonth(currentDate.getMonth() - i);
      return month;
    });

    // Tạo một object doanh thu cho từng tháng
    const revenuePerMonth = last12Months.map((month) => {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      // Lọc các giao dịch trong tháng đó
      const filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      // Tính tổng doanh thu của tháng đó
      const totalRevenue = filteredTransactions.reduce(
        (total, transaction) => total + transaction.order.totalPrice,
        0
      );

      const totalProfit = filteredTransactions.reduce(
        (total, transaction) => total + transaction.platformFee,
        0
      );

      return {
        month: month.toLocaleString("default", {
          month: "long",
          year: "numeric",
        }), // Tên tháng (Ví dụ: December 2024)
        totalRevenue: totalRevenue,
        totalProfit: totalProfit,
      };
    });

    return revenuePerMonth;
  };

  // Functionality to simulate reset logic
  const handleTimeFrameChange = (timeFrame) => {
    switch (timeFrame) {
      case "Day":
        setState({
          series: [
            {
              name: "Product One",
              data: [10, 5, 8, 12, 7, 8, 15, 9, 20, 10, 15, 22],
            },
            {
              name: "Product Two",
              data: [15, 12, 18, 10, 20, 15, 25, 18, 22, 18, 20, 30],
            },
          ],
        });
        break;

      case "Week":
        setState({
          series: [
            {
              name: "Product One",
              data: [25, 20, 22, 27, 23, 20, 35, 25, 44, 22, 30, 40],
            },
            {
              name: "Product Two",
              data: [30, 25, 28, 30, 33, 29, 40, 36, 38, 40, 35, 50],
            },
          ],
        });
        break;

      case "Month":
        setState({
          series: [
            {
              name: "Product One",
              data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 45],
            },
            {
              name: "Product Two",
              data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 51],
            },
          ],
        });
        break;

      default:
        setState({
          series: [
            {
              name: "Product One",
              data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 45],
            },
            {
              name: "Product Two",
              data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 51],
            },
          ],
        });
    }
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-6 w-6 items-center justify-center rounded-full border border-primary">
              <span
                className="block h-4 w-4 rounded-full"
                style={{ backgroundColor: "#6c5ce7" }}
              ></span>
            </span>

            <div className="w-100px" style={{ whiteSpace: "nowrap" }}>
              <p className="font-semibold text-primary">Tổng doanh thu</p>
              <p className="text-sm font-medium">1/2024 - 12/2024</p>
            </div>
          </div>

          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-6 w-6 items-center justify-center rounded-full border border-primary">
              <span
                className="block h-4 w-4 rounded-full"
                style={{ backgroundColor: "#87CEEB" }}
              ></span>
            </span>

            <div className="w-100px" style={{ whiteSpace: "nowrap" }}>
              <p className="font-semibold text-secondary">Tổng lợi nhuận</p>
              <p className="text-sm font-medium">1/2024 - 12/2024</p>
            </div>
          </div>
        </div>
        <div className="flex w-full max-w-45 justify-end">
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            <button className="rounded py-1 px-3 text-xs font-medium text-black hover:bg-white dark:text-white dark:hover:bg-boxdark">
              Tháng
            </button>
          </div>
        </div>
      </div>

      <ReactApexChart
        options={options}
        series={state.series}
        type="area"
        height={350}
      />
    </div>
  );
};

export default ChartOne;
