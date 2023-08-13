// Hej! eeeeeeeeeeeeeeeeeeeeerrr111update?22
import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
require('highcharts/modules/exporting')(Highcharts);

const PredBP = ({ selectedKommun, selectedSkola, selectedSubject, selectedSubjectName, selectedMetric }) => {
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
                key.startsWith(`mo_${selectedMetric}_np_${selectedSubject}_`) &&
                skolaData[key] != null &&
                skolaData[`${selectedMetric}_np_${selectedSubject}_${key.split("_").pop()}`] !=
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
  }, [selectedKommun, selectedSkola, selectedSubject, selectedMetric]);

  const actualYear = availableYears[selectedYearIndex] || null;

  useEffect(() => {
    if (selectedSubject && actualYear) {
      fetch(`/assets/np_${selectedSubject}_reg.json`)
        .then((response) => response.json())
        .then((data) => {
          const otherSchoolsData = [];
          const selectedSchoolData = [];
          const sameKommunSchoolsData = [];
  
          let maxX = -Infinity;
          let minX = Infinity;
  
          data.forEach((school) => {
            const xValue = school[`mo_${selectedMetric}_np_${selectedSubject}_${actualYear}`];
            const yValue = school[`${selectedMetric}_np_${selectedSubject}_${actualYear}`];
            const schoolName = school.skola;
            const schoolCity = school.kom;

            if (xValue !== null && !isNaN(xValue)) {
              maxX = Math.max(maxX, xValue);
              minX = Math.min(minX, xValue);

              const pointData = { x: xValue, y: yValue, name: schoolName, city: schoolCity };

              if (school.skola === selectedSkola && yValue !== null && !isNaN(yValue)) {
                selectedSchoolData.push(pointData);
              } else if (school.kom === selectedKommun && yValue !== null && !isNaN(yValue)) {
                sameKommunSchoolsData.push(pointData);
              } else if (yValue !== null && !isNaN(yValue)) {
                otherSchoolsData.push(pointData);
              }
            }
          });

          setChartData([
            {
              name: "Övriga skolor",
              data: otherSchoolsData,
              marker: {
                radius: 2,
                symbol: 'circle',
                fillColor: '#CDCDCD'
              },
              turboThreshold: 0
            },
            {
              name: "Skolor i vald kommun",
              data: sameKommunSchoolsData,
              marker: {
                radius: 4,
                symbol: 'circle',
                fillColor: '#2E9AFC'
              },
              turboThreshold: 0
            },
            {
              name: "Vald Skola",
              data: selectedSchoolData,
              marker: {
                radius: 5,
                symbol: 'circle',
                fillColor: '#D93B48',
                turboThreshold: 0
              }
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
  }, [selectedSubject, actualYear, selectedSkola, selectedKommun, selectedMetric]);

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
      text: `Predikterade mot faktiska ${selectedMetric === 'bp' ? 'betygspoäng' : 'andel godkända'} för NP i ${selectedSubjectName} för ${selectedSkola}, ${2000 + actualYear || "Loading..."}`,
      align: "left",
  },
    xAxis: {
      title: {
        text: "Predikterade betygspoäng",
      },
    },
    yAxis: {
      title: {
        text: "Faktiska betygspoäng",
      },
    },
    tooltip: {
      pointFormatter: function () {
        return `<b>Skola:</b> ${this.name} (${this.city})<br><b>Predikterad ${selectedMetric === 'bp' ? 'betygspoäng' : 'andel godkända'}:</b> ${this.x.toFixed(1)}<br><b>Faktisk ${selectedMetric === 'bp' ? 'betygspoäng' : 'andel godkända'}:</b> ${this.y.toFixed(1)}${selectedMetric === 'bp' ? '' : ' %'}`;
      }
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
