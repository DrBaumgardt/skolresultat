import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const LinjeResidualer = ({
  selectedKommun,
  selectedSkola,
  selectedSubject,
  selectedSubjectName,
  selectedMetric,
  selectedMetricName,
}) => {
  const [chartData, setChartData] = useState([]);
  const [chartCategories, setChartCategories] = useState([]);

  useEffect(() => {
    if (selectedKommun && selectedSkola && selectedSubject) {
      fetch(`/assets/np_${selectedSubject}_reg.json`)
        .then((response) => response.json())
        .then((data) => {
          const schoolData = data.find(
            (item) =>
              item.kom === selectedKommun && item.skola === selectedSkola
          );

          const residuals = [];
          const categories = [];

          for (let year = 14; year <= 22; year++) {
            const predValue =
              schoolData[`mo_${selectedMetric}_np_${selectedSubject}_${year}`];
            const actualValue =
              schoolData[`${selectedMetric}_np_${selectedSubject}_${year}`];

            // Kontrollera om båda värdena är definierade innan residualen beräknas
            const residualValue =
              predValue != null && actualValue != null
                ? actualValue - predValue
                : null;

            categories.push(`20${year}`);
            residuals.push(residualValue);
          }

          setChartData([
            { name: `${selectedSkola} Residualer`, data: residuals },
          ]);
          setChartCategories(categories);
        })
        .catch((error) => {
          console.error("Error loading file:", error);
        });
    }
  }, [selectedKommun, selectedSkola, selectedSubject, selectedMetric]);

  const chartOptions = {
    title: {
      text: `Residualer (faktisk - predikterad ${selectedMetricName.toLowerCase()}) för NP i ${selectedSubjectName.toLowerCase()}, ${selectedSkola}, 2014-2022`,
      align: "left",
    },
    subtitle: {
      text: "Källa: Magnus Baumgardt",
      align: "left",
    },
    yAxis: {
      title: {
        text: "Residualer",
      },
      plotLines: [
        {
          color: "#D93B48",
          width: 2,
          value: 0,
          dashStyle: "Dash",
          zIndex: 5,
        },
      ],
    },
    xAxis: {
      categories: chartCategories,
      accessibility: {
        rangeDescription: "Range: 2014 to 2022",
      },
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
        connectNulls: true,
      },
    },
    series: [
      {
        name: `Residual ${selectedMetricName.toLowerCase()}`,
        data: chartData.length > 0 ? chartData[0].data : [],
        lineWidth: 2,
        tooltip: {
          pointFormatter: function () {
            return `<span style="color:${this.color}">\u25CF</span> ${
              this.series.name
            }: <b>${this.y.toFixed(1)}</b><br/>`;
          },
        },
        dataLabels: {
          enabled: true,
          formatter: function () {
            return this.y.toFixed(1);
          },
        },
      },
    ],
  };

  return (
    <div className="chart-container">
      <div className="description-container">
        <h2>Residualer över tid</h2>
        <p>
          Diagrammet visar residualerna (differensen mellan faktisk och
          predikterad betygspoäng) för den valda skolan över tid. Notera att
          eventuella tomma punkter i diagrammet för den valda skolan indikerar
          år då data saknas.
        </p>
      </div>
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        key={`${selectedSkola}-${selectedKommun}-${selectedSubject}`}
      />
    </div>
  );
};

export default LinjeResidualer;
