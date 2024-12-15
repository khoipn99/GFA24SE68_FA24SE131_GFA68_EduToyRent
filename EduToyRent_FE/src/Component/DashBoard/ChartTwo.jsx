import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import apiUser from "../../service/ApiUser";
import apiTransaction from "../../service/ApiTransaction";

import Cookies from "js-cookie";

const options = {
  colors: ["#3C50E0", "#80CAEE"],
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "bar",
    height: 335,
    stacked: true,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  responsive: [
    {
      breakpoint: 1536,
      options: {
        plotOptions: {
          bar: {
            borderRadius: 0,
            columnWidth: "25%",
          },
        },
      },
    },
  ],
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 0,
      columnWidth: "25%",
      borderRadiusApplication: "end",
      borderRadiusWhenStacked: "last",
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: [
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bẩy",
      "Chủ nhật",
    ],
  },
  legend: {
    position: "top",
    horizontalAlign: "left",
    fontFamily: "Satoshi",
    fontWeight: 500,
    fontSize: "14px",
    markers: {
      radius: 99,
    },
  },
  fill: {
    opacity: 1,
  },
};

const ChartTwo = () => {
  const [listTotalProfit, setListTotalProfit] = useState([]);
  const [listTransactions, setListTransactions] = useState([]);
  const [customerInfo, setCustomerInfo] = useState([]);

  const [state, setState] = useState({
    series: [
      {
        name: "Doanh thu",
        data: [44, 55, 41, 67, 22, 43, 65],
      },
      {
        name: "Lợi nhuận",
        data: [13, 23, 20, 8, 13, 27, 15],
      },
    ],
  });

  const handleReset = () => {
    setState((prevState) => ({
      ...prevState,
    }));
  };

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
            const revenueData = getDailyProfitForCurrentWeek(response.data);
            console.log(revenueData[6].totalRevenue);
            setListTotalProfit(revenueData);
            setState({
              series: [
                {
                  name: "Doanh thu",
                  data: [
                    revenueData[0].totalRevenue,
                    revenueData[1].totalRevenue,
                    revenueData[2].totalRevenue,
                    revenueData[3].totalRevenue,
                    revenueData[4].totalRevenue,
                    revenueData[5].totalRevenue,
                    revenueData[6].totalRevenue,
                  ],
                },
                {
                  name: "Lợi nhuận",
                  data: [
                    revenueData[0].totalProfit,
                    revenueData[1].totalProfit,
                    revenueData[2].totalProfit,
                    revenueData[3].totalProfit,
                    revenueData[4].totalProfit,
                    revenueData[5].totalProfit,
                    revenueData[6].totalProfit,
                  ],
                },
              ],
            });
          });
      } catch (error) {
        console.error("Error parsing userDataCookie:", error);
      }

      handleReset();
    } else {
      console.warn("Cookie 'userDataReal' is missing or undefined.");
    }
  }, []);

  const getDailyProfitForCurrentWeek = (transactions) => {
    const currentDate = new Date();

    // Lấy ngày bắt đầu tuần (Thứ Hai) và ngày kết thúc tuần (Chủ Nhật)
    const getStartOfWeek = (date) => {
      const dayOfWeek = date.getDay(); // 0 (Chủ nhật) -> 6 (Thứ bảy)
      const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Chuyển Chủ nhật thành cuối tuần
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() + diff);
      startOfWeek.setHours(0, 0, 0, 0);
      return startOfWeek;
    };

    const startOfWeek = getStartOfWeek(currentDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Tạo danh sách các ngày trong tuần hiện tại
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    // Tính lợi nhuận từng ngày
    const dailyProfit = daysOfWeek.map((day) => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      // Lọc các giao dịch trong ngày đó
      const filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= dayStart && transactionDate <= dayEnd;
      });

      // Tính tổng lợi nhuận trong ngày đó
      const totalRevenue = filteredTransactions.reduce(
        (total, transaction) => total + transaction.order.totalPrice,
        0
      );
      const totalProfit = filteredTransactions.reduce(
        (total, transaction) => total + transaction.platformFee,
        0
      );

      return {
        day: day.toLocaleDateString("default", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        totalRevenue: totalRevenue,
        totalProfit: totalProfit,
      };
    });

    return dailyProfit;
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Doanh thu tuần này
          </h4>
        </div>
        <div>
          <div className="relative z-20 inline-block">
            <select
              name="#"
              id="#"
              className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none"
            >
              <option value="" className="dark:bg-boxdark">
                Tuần này
              </option>
            </select>
            <span className="absolute top-1/2 right-3 z-10 -translate-y-1/2">
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.47072 1.08816C0.47072 1.02932 0.500141 0.955772 0.54427 0.911642C0.647241 0.808672 0.809051 0.808672 0.912022 0.896932L4.85431 4.60386C4.92785 4.67741 5.06025 4.67741 5.14851 4.60386L9.09079 0.896932C9.19376 0.793962 9.35557 0.808672 9.45854 0.911642C9.56151 1.01461 9.5468 1.17642 9.44383 1.27939L5.50155 4.98632C5.22206 5.23639 4.78076 5.23639 4.51598 4.98632L0.558981 1.27939C0.50014 1.22055 0.47072 1.16171 0.47072 1.08816Z"
                  fill="#637381"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div>
        <div id="chartTwo" className="-ml-5 -mb-9">
          <ReactApexChart
            options={options}
            series={state.series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartTwo;
