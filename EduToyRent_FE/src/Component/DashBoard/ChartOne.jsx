import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

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
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
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
    min: 0,
    max: 100,
  },
};

// Main Component
const ChartOne = () => {
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
              <p className="font-semibold text-primary">Total Revenue</p>
              <p className="text-sm font-medium">12.04.2022 - 12.05.2022</p>
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
              <p className="font-semibold text-secondary">Total Sales</p>
              <p className="text-sm font-medium">12.04.2022 - 12.05.2022</p>
            </div>
          </div>
        </div>
        <div className="flex w-full max-w-45 justify-end">
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            <button
              className="rounded py-1 px-3 text-xs font-medium text-black hover:bg-white dark:text-white dark:hover:bg-boxdark"
              onClick={() => handleTimeFrameChange("Day")}
            >
              Day
            </button>
            <button
              className="rounded py-1 px-3 text-xs font-medium text-black hover:bg-white dark:text-white dark:hover:bg-boxdark"
              onClick={() => handleTimeFrameChange("Week")}
            >
              Week
            </button>
            <button
              className="rounded py-1 px-3 text-xs font-medium text-black hover:bg-white dark:text-white dark:hover:bg-boxdark"
              onClick={() => handleTimeFrameChange("Month")}
            >
              Month
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
