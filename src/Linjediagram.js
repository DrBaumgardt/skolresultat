import React, { useEffect, useState, useCallback } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const Linjediagram = ({
  selectedKommun,
  selectedSkola,
  selectedCategory,
  selectedSubject,
  selectedSubjectName,
  selectedMetric,
  selectedMetricName,
}) => {
  const [chartData, setChartData] = useState([]);
  const [chartCategories, setChartCategories] = useState([]);

  const getAverageNPValue = useCallback(
    (data, kommun, year) => {
      const filteredData = kommun
        ? data.filter((item) => item.kom === kommun)
        : data;

      const validValues = filteredData
        .map((item) => item[`${selectedMetric}_${selectedSubject}_${year}`])
        .filter((value) => value != null);
      const totalValue = validValues.reduce((sum, value) => sum + value, 0);
      const averageValue = totalValue / validValues.length;

      return Number(averageValue.toFixed(1)); // Avrundar till en decimal
    },
    [selectedSubject, selectedMetric]
  );

  useEffect(() => {
    console.log("Use effect triggered with:", {
      selectedKommun,
      selectedSkola,
      selectedSubject,
      selectedMetric,
    });

    setChartData([]);
    setChartCategories([]);
    if (selectedKommun && selectedSkola && selectedSubject) {
      fetch(`/assets/${selectedSubject}_reg.json`)
        .then((response) => response.json())
        .then((data) => {
          const schoolData = data.find(
            (item) =>
              item.kom === selectedKommun && item.skola === selectedSkola
          );

          const skolaNPValues = [];
          const kommunNPValues = [];
          const swedenNPValues = [];
          const categories = [];

          for (let year = 14; year <= 22; year++) {
            const skolaNPValue =
              schoolData[`${selectedMetric}_${selectedSubject}_${year}`];
            const kommunNPValue = getAverageNPValue(data, selectedKommun, year);
            const swedenNPValue = getAverageNPValue(data, null, year);

            categories.push(`20${year}`);
            skolaNPValues.push(skolaNPValue ?? null);
            kommunNPValues.push(kommunNPValue);
            swedenNPValues.push(swedenNPValue);
          }

          setChartData([
            { name: selectedSkola, data: skolaNPValues },
            { name: `${selectedKommun} genomsnitt`, data: kommunNPValues },
            { name: "Sverige genomsnitt", data: swedenNPValues },
          ]);
          setChartCategories(categories);
        })
        .catch((error) => {
          console.error("Error loading file:", error);
        });
    }
  }, [
    selectedKommun,
    selectedSkola,
    selectedCategory,
    selectedSubject,
    selectedMetric,
    getAverageNPValue,
  ]);

  const chartOptions = {
    title: {
      text: `Genomsnittlig ${selectedMetricName.toLowerCase()} för NP i ${selectedSubjectName.toLowerCase()} för ${selectedSkola}, ${selectedKommun}, 2014-2022`,
      align: "left",
    },
    subtitle: {
      text: "Källa: Skolverket",
      align: "left",
    },
    yAxis: {
      title: {
        text: `Genomsnittlig ${selectedMetricName.toLowerCase()}`,
      },
    },
    xAxis: {
      categories: chartCategories,
      accessibility: {
        rangeDescription: "Range: 2014 to 2022",
      },
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
        lineWidth: 2,
        connectNulls: true, // Connects lines even if data points are missing
      },
    },
    series: chartData,
  };

  return (
    <div className="chart-container">
      <div className="description-container">
        <h2>{selectedMetricName} över tid</h2>
        <p>
          Diagrammet visar {selectedMetricName.toLowerCase()} för den valda
          skolan över tid. För jämförelse visas även det genomsnittlig{" "}
          {selectedMetricName.toLowerCase()}
          för alla skolor i den valda kommunen, samt genomsnittlig{" "}
          {selectedMetricName.toLowerCase()}
          för skolor i hela Sverige under samma tidsperiod. Notera att
          eventuella tomma punkter i diagrammet för den valda skolan indikerar
          år då data saknas.
        </p>
      </div>
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        key={`${selectedSkola}-${selectedKommun}-${selectedCategory}-${selectedSubject}-${selectedMetric}`}
      />
    </div>
  );
};

export default Linjediagram;
