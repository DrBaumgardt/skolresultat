// Hej! eeeeeeeeeeeeeeeeeeeeerrr
import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const PredBP = ({ selectedKommun, selectedSkola, selectedSubject }) => {
  const [chartData, setChartData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);

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
                key.startsWith(`mo_bp_np_${selectedSubject}_`) &&
                skolaData[key] != null &&
                skolaData[`bp_np_${selectedSubject}_${key.split("_").pop()}`] !=
                  null
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
  }, [selectedKommun, selectedSkola, selectedSubject]);

  const actualYear = availableYears[selectedYearIndex] || null;

  useEffect(() => {
    if (selectedSubject && actualYear) {
      fetch(`/assets/np_${selectedSubject}_reg.json`)
        .then((response) => response.json())
        .then((data) => {
          const otherSchoolsData = [];
          const selectedSchoolData = [];

          let maxX = -Infinity;
          let minX = Infinity;

          data.forEach((school) => {
            const xValue = school[`mo_bp_np_${selectedSubject}_${actualYear}`];
            const yValue = school[`bp_np_${selectedSubject}_${actualYear}`];

            if (xValue !== null && !isNaN(xValue)) {
              maxX = Math.max(maxX, xValue);
              minX = Math.min(minX, xValue);

              if (
                school.skola === selectedSkola &&
                yValue !== null &&
                !isNaN(yValue)
              ) {
                selectedSchoolData.push([xValue, yValue]);
              } else if (yValue !== null && !isNaN(yValue)) {
                otherSchoolsData.push([xValue, yValue]);
              }
            }
          });

          setChartData([
            {
              name: "Övriga Skolor",
              data: otherSchoolsData,
            },
            {
              name: "Vald Skola",
              data: selectedSchoolData,
              color: "red",
            },
            {
              name: "Regressionslinje",
              type: "line",
              data: [
                [minX, minX],
                [maxX, maxX],
              ],
              color: "#777777",
              dashStyle: "dash",
              lineWidth: 3,
              marker: { enabled: false },
            },
          ]);
        })
        .catch((error) => {
          console.error("Error loading file:", error);
        });
    }
  }, [selectedSubject, actualYear]);

  const handleSliderChange = (e) => {
    const yearSelected = Number(e.target.value);
    const index = availableYears.indexOf(yearSelected);
    if (index !== -1) {
      setSelectedYearIndex(index);
    }
  };

  const chartOptions = {
    chart: {
      type: "scatter",
      height: "600px",
    },
    title: {
      text: `Predikterade vs Faktiska betygspoäng för ${selectedSkola} i ${selectedSubject}, ${
        actualYear || "Loading..."
      }`,
    },
    subtitle: {
      text: "Källa: Skolverket",
      align: "left",
    },
    xAxis: {
      title: {
        text: "Predikterade Betygspoäng",
      },
    },
    yAxis: {
      title: {
        text: "Faktiska Betygspoäng",
      },
    },
    legend: {
      enabled: true,
    },
    series: chartData,
  };

  return (
    <div className="chart-container">
      <div className="description-container">
        <h2>Predikterade vs Faktiska betygspoäng för {selectedSkola}</h2>
        <p>
          Diagrammet visar skolans predikterade betygspoäng på x-axeln och
          skolans faktiska betygspoäng på y-axeln för det valda året. Använd
          skjutreglaget under diagrammet för att byta år.
        </p>
      </div>
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        key={selectedSkola}
      />
      <div className="slider-container">
        <strong>
          Valt år: {actualYear ? 2000 + actualYear : "Loading..."}
        </strong>
        <br />
        {availableYears.length > 1 && (
          <input
            className="slider-width"
            type="range"
            min={availableYears[0]}
            max={availableYears[availableYears.length - 1]}
            value={actualYear}
            onChange={handleSliderChange}
          />
        )}
      </div>
    </div>
  );
};

export default PredBP;
