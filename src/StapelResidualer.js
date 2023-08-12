import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from 'highcharts/highcharts-more';
import DumbbellModule from 'highcharts/modules/dumbbell';
import LollipopModule from 'highcharts/modules/lollipop';

HighchartsMore(Highcharts);
DumbbellModule(Highcharts);
LollipopModule(Highcharts);


const StapelResidualer = ({ selectedKommun, selectedSkola, selectedSubject, selectedSubjectName }) => {
    const [chartData, setChartData] = useState([]);
    const [selectedYearIndex, setSelectedYearIndex] = useState(0);
    const [availableYears, setAvailableYears] = useState([]);
    const [startYear, setStartYear] = useState(0);

    useEffect(() => {
        setStartYear(2022 - availableYears.length + 1);
    }, [availableYears]);

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
                                key.startsWith(`bp_np_${selectedSubject}_`) &&
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
    }, [selectedKommun, selectedSkola, selectedSubject]);

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
                            item[`bp_np_${selectedSubject}_${actualYear}`] != null &&
                            item[`mo_bp_np_${selectedSubject}_${actualYear}`] != null
                    );

                    const residuals = kommunData.map((skola) => {
                        const actualValue = skola[`bp_np_${selectedSubject}_${actualYear}`];
                        const predictedValue = skola[`mo_bp_np_${selectedSubject}_${actualYear}`];
                        const residual = actualValue - predictedValue;
                        return {
                            name: skola.skola,
                            y: residual ?? null,
                            color: skola.skola === selectedSkola ? "#D93B48" : "#2CAFFE"
                        };
                    });

                    // Filtrera bort skolor med en residual på 3 eller mer
                    const filteredResiduals = residuals.filter(item => Math.abs(item.y) < 3);

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
        actualYear
    ]);



    const chartHeight =
        chartData.length < 4 ? "200px" : chartData.length < 10 ? "300px" : "500px";


    const colors = chartData.map(item => item.color);

    const chartOptions = {
        chart: {
            type: 'lollipop',
            inverted: true,
            height: chartHeight
        },
        title: {
            text: `Residualer (Faktiska - Predikterade betygspoäng) för NP i ${selectedSubjectName} för skolor i ${selectedKommun}, ${2000 + actualYear}`
        },
        subtitle: {
            text: "Källa: Skolverket",
            align: "left"
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: ""
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            lollipop: {
                colors: colors,
                dataLabels: {
                    enabled: true
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
        series: [{
            name: "Residual",
            data: chartData.map(item => ({
                name: item.name,
                y: item.y,
                color: item.color
            })),
            marker: {
                radius: 5
            },
            connectorWidth: 3,
            dataLabels: {
                enabled: true,
                formatter: function() {
                    return this.y.toFixed(1);  // Formaterar värdet till en tiondel
                }
            }
        }]
        
    };
    

    return (
        <div className="chart-container">
            <div className="description-container">
                <h2>Betygspoäng för skolor i vald kommun</h2>
                <p>
                    Diagrammet visar genomsnittliga betygspoäng för alla skolor i den
                    valda kommunen som har ett inrapporterat värde under ett specifikt år.
                    Använd skjutreglaget under diagrammet för att byta år och se hur
                    betygspoängen för skolorna har förändrats. Den skola du valt är
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