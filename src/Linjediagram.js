import React, { useEffect, useState, useCallback } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const Linjediagram = ({ selectedKommun, selectedSkola, selectedSubject }) => {
  const [chartData, setChartData] = useState([]);
  const [chartCategories, setChartCategories] = useState([]);

  const getAverageNPValue = useCallback(
    (data, kommun, year) => {
      const filteredData = kommun
        ? data.filter((item) => item.kom === kommun)
        : data;

      const validValues = filteredData
        .map((item) => item[`bp_np_${selectedSubject}_${year}`])
        .filter((value) => value != null);
      const totalValue = validValues.reduce((sum, value) => sum + value, 0);
      const averageValue = totalValue / validValues.length;

      return Number(averageValue.toFixed(1)); // Avrundar till en decimal
    },
    [selectedSubject]
  );

  useEffect(() => {
    if (selectedKommun && selectedSkola && selectedSubject) {
      fetch(`/assets/np_${selectedSubject}_reg.json`)
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
            const skolaNPValue = schoolData[`bp_np_${selectedSubject}_${year}`];
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
            { name: "Sverige genomsnitt", data: swedenNPValues }
          ]);
          setChartCategories(categories);
        })
        .catch((error) => {
          console.error("Error loading file:", error);
        });
    }
  }, [selectedKommun, selectedSkola, selectedSubject, getAverageNPValue]);

  const chartOptions = {
    title: {
      text: `Genomsnittliga betygspoäng för nationella prov i ${selectedSubject} för ${selectedSkola}, ${selectedKommun}, under 2014-2022`,
      align: "left"
    },
    subtitle: {
      text: "Källa: Skolverket",
      align: "left"
    },
    yAxis: {
      title: {
        text: "Genomsnittliga betygspoäng"
      }
    },
    xAxis: {
      categories: chartCategories,
      accessibility: {
        rangeDescription: "Range: 2014 to 2022"
      }
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle"
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false
        },
        connectNulls: true // Connects lines even if data points are missing
      }
    },
    series: chartData
  };

  return (
    <div className="chart-container">
      <div className="description-container">
        <h2>Genomsnittliga betygspoäng över tid</h2>
        <p>
          Diagrammet visar det genomsnittliga betygspoänget för den valda skolan
          över tid. För jämförelse visas även det genomsnittliga betygspoänget
          för alla skolor i den valda kommunen, samt det genomsnittliga
          betygspoänget för skolor i hela Sverige under samma tidsperiod. Notera
          att eventuella tomma punkter i diagrammet för den valda skolan
          indikerar år då data saknas.
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

export default Linjediagram;
