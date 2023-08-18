import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const LinjeHappygrades = ({
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
      Promise.all([
        fetch(`/assets/np_${selectedSubject}_reg.json`).then((res) =>
          res.json()
        ),
        fetch(`/assets/${selectedSubject}.json`).then((res) => res.json()),
      ])
        .then(([npSchools, maSchools]) => {
          const differences = [];
          const kommunDifferences = [];
          const sverigeDifferences = [];
          const categories = [];

          for (let year = 14; year <= 22; year++) {
            const schoolDataNP = npSchools.find(
              (item) =>
                item.kom === selectedKommun && item.skola === selectedSkola
            );
            const schoolDataMA = maSchools.find(
              (item) => item.skola === selectedSkola
            );

            const npValue =
              schoolDataNP[`${selectedMetric}_np_${selectedSubject}_${year}`];
            const maValue =
              schoolDataMA[`${selectedMetric}_${selectedSubject}_${year}`];
            const diffValue =
              npValue != null && maValue != null ? maValue - npValue : null;

            // Calculate the average difference for the kommun
            const kommunNPs = npSchools.filter(
              (item) => item.kom === selectedKommun
            );
            const kommunDifferencesForYear = kommunNPs
              .map((school) => {
                const maSchool = maSchools.find(
                  (item) => item.skola === school.skola
                );
                const npVal =
                  school[`${selectedMetric}_np_${selectedSubject}_${year}`];
                const maVal =
                  maSchool[`${selectedMetric}_${selectedSubject}_${year}`];
                if (npVal != null && npVal !== 0) {
                  return maVal - npVal;
                }
                return null;
              })
              .filter((val) => val !== null);

            const kommunAverageDifference =
              kommunDifferencesForYear.reduce((acc, curr) => acc + curr, 0) /
              kommunDifferencesForYear.length;

            // Calculate the average difference for Sverige
            const sverigeDifferencesForYear = npSchools
              .map((school) => {
                const maSchool = maSchools.find(
                  (item) => item.skola === school.skola
                );
                const npVal =
                  school[`${selectedMetric}_np_${selectedSubject}_${year}`];
                const maVal =
                  maSchool[`${selectedMetric}_${selectedSubject}_${year}`];
                if (npVal != null && npVal !== 0) {
                  return maVal - npVal;
                }
                return null;
              })
              .filter((val) => val !== null);

            const sverigeAverageDifference =
              sverigeDifferencesForYear.reduce((acc, curr) => acc + curr, 0) /
              sverigeDifferencesForYear.length;

            categories.push(`20${year}`);
            differences.push(diffValue);
            kommunDifferences.push(kommunAverageDifference);
            sverigeDifferences.push(sverigeAverageDifference);
          }

          setChartData([
            { name: `${selectedSkola}`, data: differences },
            { name: `${selectedKommun} genomsnitt`, data: kommunDifferences },
            { name: `Sverige genomsnitt`, data: sverigeDifferences },
          ]);
          setChartCategories(categories);
        })
        .catch((error) => {
          console.error("Error loading files:", error);
        });
    }
  }, [selectedKommun, selectedSkola, selectedSubject, selectedMetric]);

  const chartOptions = {
    title: {
      text: `Differensen mellan ${selectedMetricName.toLowerCase()} i ${selectedSubjectName.toLowerCase()} och ${selectedMetricName.toLowerCase()} på NP, ${selectedSkola}, 2014-2022`,
      align: "left",
    },
    subtitle: {
      text: "Källa: Skolverket",
      align: "left",
    },
    yAxis: {
      title: {
        text: "Skillnad mellan ämnesbetyg och NP-resultat",
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
    },
    legend: {
      enabled: true,
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
        connectNulls: true,
      },
    },
    series: chartData.map((seriesData) => ({
      ...seriesData,
      tooltip: {
        pointFormatter: function () {
          if (selectedMetric === "bp") {
            return `<span style="color:${this.color}">\u25CF</span> ${
              this.series.name
            }: <b>${this.y.toFixed(1)}</b><br/>`;
          } else if (selectedMetric === "ag") {
            return `<span style="color:${this.color}">\u25CF</span> ${
              this.series.name
            }: <b>${Math.round(this.y)} pe</b><br/>`;
          }
        },
      },
      dataLabels: {
        enabled: false,
        formatter: function () {
          if (selectedMetric === "bp") {
            return this.y.toFixed(1);
          } else if (selectedMetric === "ag") {
            return `${Math.round(this.y)} pe`;
          }
        },
      },
    })),
  };

  return (
    <div className="chart-container">
      <div className="description-container">
        <h2>Skillnad mellan ämnesbetyg och NP-resultat</h2>
        <p>
          Diagrammet visar differensen mellan {selectedMetricName.toLowerCase()}{" "}
          i ämnet {selectedSubjectName.toLowerCase()} och{" "}
          {selectedMetricName.toLowerCase()} på NP. Ett <b>positivt</b> värde
          betyder att skolan senare sätter ett högre betyg än provbetyget på NP.
          Som jämförelse visas genomsnittet för kommunen och hela Sverige. Vid
          betygsättning ska resultatet på NP särskilt beaktas och ett högre
          värde kan alltså betyda att skolan bidrar till betygsinflation.
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

export default LinjeHappygrades;
