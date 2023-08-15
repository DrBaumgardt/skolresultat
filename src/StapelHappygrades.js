import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const StapelHappygrades = ({
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
      Promise.all([
        fetch(`/assets/np_${selectedSubject}_reg.json`).then((response) =>
          response.json()
        ),
        fetch(`/assets/${selectedSubject}.json`).then((response) =>
          response.json()
        ),
      ])
        .then(([npData, maData]) => {
          const kommunData = npData.filter(
            (item) =>
              item.kom === selectedKommun &&
              item[`${selectedMetric}_np_${selectedSubject}_${actualYear}`] !=
                null
          );

          const residuals = kommunData.map((skola) => {
            const actualValue =
              skola[`${selectedMetric}_np_${selectedSubject}_${actualYear}`];
            const maSkolaData = maData.find(
              (item) => item.skola === skola.skola
            );
            const predictedValue = maSkolaData
              ? maSkolaData[
                  `${selectedMetric}_${selectedSubject}_${actualYear}`
                ]
              : null;
            const residual =
              actualValue && predictedValue
                ? predictedValue - actualValue
                : null;
            return {
              name: skola.skola,
              y: residual ?? null,
              color: skola.skola === selectedSkola ? "#D93B48" : "#2CAFFE",
            };
          });

          let filteredResiduals;
          if (selectedMetric === "bp") {
            filteredResiduals = residuals.filter(
              (item) => Math.abs(item.y) < 3
            );
          } else if (selectedMetric === "ag") {
            filteredResiduals = residuals.filter((item) => {
              const skolaActualValue =
                item[`${selectedMetric}_np_${selectedSubject}_${actualYear}`];
              return (
                item.y !== 100 &&
                Math.abs(item.y) < 30 &&
                skolaActualValue !== 100
              );
            });
          }

          setChartData(
            filteredResiduals
              .sort((a, b) => b.y - a.y)
              .map((item, index) => ({ ...item, id: `id_${index}` }))
          );
        })
        .catch((error) => {
          console.error("Error loading files:", error);
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
      type: "column",
      height: chartHeight,
    },
    title: {
      text: `Differens mellan ${selectedMetricName.toLowerCase()} i ${selectedSubjectName.toLowerCase()} och ${selectedMetricName.toLowerCase()} på NP, ${selectedKommun}, 2014-2022`,
      align: "left",
    },
    subtitle: {
      text: "Källa: Magnus Baumgardt",
      align: "left",
    },
    xAxis: {
      type: "category",
      labels: {
        enabled: false, // Dölj etiketterna på x-axeln
      },
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
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true, // Aktiverar etiketterna
          format: "{y:.1f}", // Formaterar etiketterna till en tiondel
          color: "#333", // Färg på textetiketten
        },
      },
    },
    tooltip: {
      pointFormatter: function () {
        return `<span style="color:${this.color}">\u25CF</span> ${
          this.series.name
        }: <b>${this.y.toFixed(1)}</b><br/>`;
      },
    },
    series: [
      {
        name: `Avvikelse ${selectedMetricName.toLowerCase()}`,
        data: chartData,
      },
    ],
  };

  return (
    <div className="chart-container">
      <div className="description-container">
        <h2>
          Skillnad mellan ämnesbetyg och NP-resultat för skolor i{" "}
          {selectedKommun}
        </h2>
        <p>
          Diagrammet visar differensen mellan {selectedMetricName.toLowerCase()}{" "}
          i ämnet {selectedSubjectName.toLowerCase()} och{" "}
          {selectedMetricName.toLowerCase()} på NP, för alla skolor i{" "}
          {selectedKommun} som har ett inrapporterat värde det valda året. Vald
          skola är markerad med röd färg.
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

export default StapelHappygrades;
