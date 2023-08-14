import React, { useEffect, useState, useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { sampleCorrelation as correlation } from 'simple-statistics';

const Korrelation = ({ selectedKommun, selectedSkola, selectedSubject, selectedMetric, selectedMetricName }) => {
    const [chartData, setChartData] = useState([]);
    const [selectedYearIndex, setSelectedYearIndex] = useState(0);
    const [availableYears, setAvailableYears] = useState([]);
    const variables = useMemo(() => ['fgu', 'asb', 'ani', 'ap', 'n9'], []);

    const variableNamesLookup = useMemo(() => ({
        asb: "Andel elever med svensk bakgrund",
        n9: "Antal elever (år 9)",
        ap: "Andel pojkar",
        agu: "Andel elever med föräldrar med som mest gymnasial utbildning",
        ani: "Andel nyinvandrade elever",
        fgu: "Föräldrarnas genomsnittliga utbildningsnivå"
    }), []);

    const handleSliderChange = (e) => {
        const yearSelected = Number(e.target.value);
        const index = availableYears.indexOf(yearSelected);
        if (index !== -1) {
            setSelectedYearIndex(index);
        }
    };

    const getCorrelationStrength = (value) => {
        const absValue = Math.abs(value);
        if (absValue > 0.7) return "Stark";
        if (absValue > 0.5) return "Måttlig";
        if (absValue > 0.3) return "Svag";
        if (absValue > 0.1) return "Mycket svag";
        return "Ingen";
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
        if (selectedKommun && selectedSkola && selectedSubject && availableYears.length > 0) {
            fetch(`/assets/np_${selectedSubject}_reg.json`)
                .then((response) => response.json())
                .then((data) => {
                    const referenceDataRaw = data.map(d => d[`${selectedMetric}_np_${selectedSubject}_${actualYear}`]);

                    // console.log("Reference data:", referenceDataRaw);

                    const coefficients = variables.map(varName => {
                        const variableDataRaw = data.map(d => d[`${varName}_${actualYear}`]);

                        // Filter out rows that don't have values for both the dependent and the independent variable
                        const filteredData = referenceDataRaw.reduce((acc, val, index) => {
                            if (val !== null && !isNaN(val) && variableDataRaw[index] !== null && !isNaN(variableDataRaw[index])) {
                                acc.push({ ref: val, var: variableDataRaw[index] });
                            }
                            return acc;
                        }, []);

                        const referenceData = filteredData.map(d => d.ref);
                        const variableData = filteredData.map(d => d.var);

                        // Log filtered data for reference and the current variable
                        // console.log(`Filtered reference data for ${varName}_${actualYear}:`, referenceData);
                        //console.log(`Filtered variable data for ${varName}_${actualYear}:`, variableData);

                        return correlation(referenceData, variableData);
                    });


                    // console.log("Correlation coefficients:", coefficients);  // Log correlation coefficients

                    setChartData(coefficients.map((coeff, index) => ({
                        name: variableNamesLookup[variables[index]] || variables[index],
                        y: Math.abs(coeff),  // Absolutbeloppet av koefficienten för att visa det som positivt i diagrammet
                        actualValue: coeff,  // Den faktiska koefficienten (kan vara negativ)
                        color: coeff < 0 ? '#D93B48' : '#2E9AFC'
                    })).sort((a, b) => b.y - a.y));



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
        variableNamesLookup,
        variables
    ]);

    const chartOptions = {
        chart: {
            type: "column",
        },
        title: {
            text: `Korrelationskoefficient mellan ${selectedMetricName.toLowerCase()} och utvalda variabler för ${selectedSkola}, ${2000 + actualYear}`,
            align: "left"
        },
        subtitle: {
            text: "Källa: Skolverket",
            align: "left"
        },
        xAxis: {
            type: "category"
        },
        yAxis: {
            title: {
                text: "Korrelationskoefficient"
            },
            min: 0,
            max: 1
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.actualValue:.2f}</b></td></tr>',  // Visar den faktiska koefficienten avrundad till hundradelar
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        legend: {
            enabled: false,
            align: "left",
            verticalAlign: "top"
        },
        series: [
            {
                name: "Korrelation",
                data: chartData,
                dataLabels: {
                    enabled: true,
                    align: 'center',
                    color: '#000000',
                    crop: false,
                    overflow: 'none',  // to ensure the label is displayed fully
                    y: -2,  // position the label a bit above the column
                    formatter: function () {
                        return getCorrelationStrength(this.y);
                    }
                }
            }
        ]
    };

    return (
        <div className="chart-container">
            <div className="description-container">
                <h2>Korrelation mellan {selectedMetricName.toLowerCase()} och utvalda variabler</h2>
                <p>
                    Diagrammet visar korrelationskoefficienten mellan {selectedMetricName.toLowerCase()} och utvalda variabler för det valda året. Använd skjutreglaget under diagrammet för att byta år.
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

export default Korrelation;
