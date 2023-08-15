import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import Highcharts from "highcharts";

Highcharts.setOptions({
  title: {
    style: {
      fontFamily: "Roboto",
      color: "#666666",
      fontSize: "18px",
      fontWeight: "bold",
    },
  },
  subtitle: {
    style: {
      fontFamily: "Verdana",
      fontSize: "12px",
    },
  },
});

Highcharts.setOptions({
  responsive: {
    rules: [
      {
        condition: {
          maxWidth: 500,
        },
        chartOptions: {
          legend: {
            layout: "horizontal",
            align: "center",
            verticalAlign: "bottom",
          },
        },
      },
    ],
  },
});

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
