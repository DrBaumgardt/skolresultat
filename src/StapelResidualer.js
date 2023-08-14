import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const StapelResidualer = ({ selectedKommun, selectedSkola, selectedSubject, selectedSubjectName, selectedMetric, selectedMetricName }) => {
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
                            item[`${selectedMetric}_np_${selectedSubject}_${actualYear}`] != null &&
                            item[`mo_${selectedMetric}_np_${selectedSubject}_${actualYear}`] != null
                    );

                    const residuals = kommunData.map((skola) => {
                        const actualValue = skola[`${selectedMetric}_np_${selectedSubject}_${actualYear}`];
                        const predictedValue = skola[`mo_${selectedMetric}_np_${selectedSubject}_${actualYear}`];
                        const residual = actualValue - predictedValue;
                        return {
                            name: skola.skola,
                            y: residual ?? null,
                            color: skola.skola === selectedSkola ? "#D93B48" : "#2CAFFE"
                        };
                    });

                    let filteredResiduals;
                    if (selectedMetric === 'bp') {
                        filteredResiduals = residuals.filter(item => Math.abs(item.y) < 3);
                    } else if (selectedMetric === 'ag') {
                        filteredResiduals = residuals.filter(item => {
                            const skolaActualValue = item[`${selectedMetric}_np_${selectedSubject}_${actualYear}`];
                            return (item.y !== 100) && (Math.abs(item.y) < 30) && (skolaActualValue !== 100);
                        });
                    }

                    setChartData(
                        filteredResiduals.sort((a, b) => b.y - a.y)
                            .map((item, index) => ({ ...item, id: `id_${index}` }))
                    );
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
        selectedMetric
    ]);



    const chartHeight =
        chartData.length < 4 ? "200px" : chartData.length < 10 ? "300px" : "500px";

    const chartOptions = {
        chart: {
            type: "column",
            height: chartHeight
        },
        title: {
            text: `Residualer (faktisk - predikterad ${selectedMetricName.toLowerCase()}) för NP i ${selectedSubjectName.toLowerCase()}, skolor i ${selectedKommun}, 2014-2022`,
            align: "left"
        },
        subtitle: {
            text: "Källa: Skolverket",
            align: "left"
        },
        xAxis: {
            type: "category",
            labels: {
                enabled: false // Dölj etiketterna på x-axeln
            }
        },
        yAxis: {
            title: {
                text: ""
            }
        },
        legend: {
            enabled: false,
            align: "left",
            verticalAlign: "top"
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,  // Aktiverar etiketterna
                    format: '{y:.1f}',  // Formaterar etiketterna till en tiondel
                    color: '#333'  // Färg på textetiketten
                }
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        series: [
            {
                name: "Betygspoäng",
                data: chartData
            }
        ]
    };


    return (
        <div className="chart-container">
            <div className="description-container">
                <h2>{selectedMetricName} för skolor i vald kommun</h2>
                <p>
                    Diagrammet visar genomsnittlig {selectedMetricName.toLowerCase()} för alla skolor i den
                    valda kommunen som har ett inrapporterat värde under ett specifikt år.
                    Använd skjutreglaget under diagrammet för att byta år. Den skola du valt är
                    markerad i rött.
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

export default StapelResidualer;