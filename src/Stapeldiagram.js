import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const Stapeldiagram = ({
  selectedKommun,
  selectedSkola,
  selectedSubject,
  selectedSubjectName,
  selectedMetric,
  selectedMetricName,
}) => {
  const [chartData, setChartData] = useState([]);
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const [availableYears, setAvailableYears] = useState([]);

  const handleSliderChange = (e) => {
    const yearSelected = Number(e.target.value);
    const index = availableYears.indexOf(yearSelected);
    if (index !== -1) {
      setSelectedYearIndex(index);
    }
  };

  const actualYear = availableYears[selectedYearIndex];

  useEffect(() => {
    if (selectedKommun && selectedSkola && selectedSubject) {
      fetch(`/assets/np_${selectedSubject}_reg.json`)
        .then((response) => response.json())
        .then((data) => {
          const skolaData = data.find(
            (item) =>
              item.kom === selectedKommun && item.skola === selectedSkola
          );

          const yearsWithData = Object.keys(skolaData)
            .filter(
              (key) =>
                key.startsWith(`${selectedMetric}_np_${selectedSubject}_`) &&
                skolaData[key] != null
            )
            .map((key) => parseInt(key.split("_").pop(), 10))
            .sort();

          setAvailableYears(yearsWithData);
          setSelectedYearIndex(yearsWithData.length - 1);
        })
        .catch((error) => {
          console.error("Error loading file:", error);
        });
    }
  }, [selectedKommun, selectedSkola, selectedSubject, selectedMetric]);

  useEffect(() => {
    if (
      selectedKommun &&
      selectedSkola &&
      selectedSubject &&
      availableYears.length > 0
    ) {
      fetch(`/assets/np_${selectedSubject}_reg.json`)
        .then((response) => response.json())
        .then((data) => {
          const kommunData = data.filter(
            (item) =>
              item.kom === selectedKommun &&
              item[`${selectedMetric}_np_${selectedSubject}_${actualYear}`] !=
                null
          );

          const betygValues = kommunData
            .map((skola) => ({
              name: skola.skola,
              y:
                skola[
                  `${selectedMetric}_np_${selectedSubject}_${actualYear}`
                ] ?? null,
              color: skola.skola === selectedSkola ? "#D93B48" : "#2CAFFE",
            }))
            .sort((a, b) => b.y - a.y)
            .map((item, index) => ({ ...item, id: `id_${index}` })); // Assign new id based on sorted order

          setChartData(betygValues);
        })
        .catch((error) => {
          console.error("Error loading file:", error);
        });
    }
  }, [
    selectedKommun,
    selectedSkola,
    selectedSubject,
    selectedYearIndex,
    availableYears,
    actualYear,
    selectedMetric,
  ]);

  const chartHeight =
    chartData.length < 4 ? "200px" : chartData.length < 10 ? "300px" : "500px";

  const chartOptions = {
    chart: {
      type: "bar",
      height: chartHeight,
    },
    title: {
      text: `${selectedMetricName} för NP i ${selectedSubjectName.toLowerCase()} för skolor i ${selectedKommun}, ${
        2000 + actualYear
      }`,
      align: "left",
    },
    subtitle: {
      text: "Källa: Skolverket",
      align: "left",
    },
    xAxis: {
      type: "category",
    },
    yAxis: {
      title: {
        text: "",
      },
    },
    legend: {
      enabled: false,
      align: "left",
      verticalAlign: "top",
    },
    series: [
      {
        name: selectedMetric === "bp" ? "Betygspoäng" : "Andel godkända",
        data: chartData,
        tooltip: {
          pointFormatter: function () {
            let value;
            let suffix;

            if (selectedMetric === "ag") {
              value = Math.round(this.y);
              suffix = " %";
            } else if (selectedMetric === "bp") {
              value = this.y.toFixed(1);
              suffix = "";
            }

            return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${value}${suffix}</b><br/>`;
          },
        },
      },
    ],
  };

  return (
    <div className="chart-container">
      <div className="description-container">
        <h2>{selectedMetricName} för skolor i vald kommun</h2>
        <p>
          Diagrammet visar {selectedMetricName.toLowerCase()} för alla skolor i{" "}
          {selectedKommun} som har ett inrapporterat värde under ett specifikt
          år. Använd skjutreglaget under diagrammet för att byta år. Vald skola
          är markerad med röd färg.
        </p>
      </div>
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      <div className="slider-container">
        <strong>
          Valt år: {actualYear ? 2000 + actualYear : "Loading..."}
        </strong>
        <br />
        {availableYears.length > 1 && (
          <input
            className="slider-width"
            type="range"
            min={availableYears[0]} // the earliest year
            max={availableYears[availableYears.length - 1]} // the latest year
            value={actualYear}
            onChange={handleSliderChange}
          />
        )}
      </div>
    </div>
  );
};

export default Stapeldiagram;
