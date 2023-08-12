import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const ResultatOchVariabler = ({ selectedKommun, selectedSkola, selectedSubject }) => {
    const [chartData, setChartData] = useState({
        betygspoäng: [],
        föräldrarnasUtbildning: [],
        andelSvenskBakgrund: []
    });
    const [availableYears, setAvailableYears] = useState([]);
    const [selectedVariable, setSelectedVariable] = useState('asb');
    const variableOptions = {
        fgu: "Föräldrarnas genomsnittliga utbildningsnivå",
        asb: "Andel elever med svensk bakgrund",
        ani: "Andel nyinvandrade elever",
        ap: "Andel pojkar",
        n9: "Antal elever (år 9)",
        // agu: "Andel elever med föräldrar med som mest gymnasial utbildning",
    };
    const [skolaData, setSkolaData] = useState(null);

    useEffect(() => {
        if (selectedKommun && selectedSkola && selectedSubject) {
            fetch(`/assets/np_${selectedSubject}_reg.json`)
                .then(response => response.json())
                .then(data => {
                    const foundData = data.find(
                        item => item.kom === selectedKommun && item.skola === selectedSkola
                    );
                    setSkolaData(foundData);
                })
                .catch(error => {
                    console.error("Error loading file:", error);
                });
        }
    }, [selectedKommun, selectedSkola, selectedSubject]);

    useEffect(() => {
        if (skolaData) {
            const yearsWithData = Object.keys(skolaData)
                .filter(key =>
                    key.startsWith(`bp_np_${selectedSubject}_`) &&
                    !key.includes("_f_") &&
                    !key.includes("_p_") &&
                    skolaData[key] != null
                )
                .map(key => parseInt(key.split("_").pop(), 10))
                .sort();

            const betygspoäng = yearsWithData.map(year => skolaData[`bp_np_${selectedSubject}_${year}`]);
            const föräldrarnasUtbildning = yearsWithData.map(year => skolaData[`fgu_${year}`]);
            const andelSvenskBakgrund = yearsWithData.map(year => skolaData[`asb_${year}`]);

            setChartData({
                betygspoäng,
                föräldrarnasUtbildning,
                andelSvenskBakgrund
            });
            setAvailableYears(yearsWithData);
        }
    }, [skolaData, selectedSubject]);

    const selectedVariableData = skolaData ? availableYears.map(year => skolaData[`${selectedVariable}_${year}`]) : [];

    const getYAxisBounds = (variable) => {
        switch (variable) {
            case 'fgu':
                return { min: 1, max: 3 };
            case 'agu':
            case 'ap':
            case 'ani':
            case 'asb':
                return { min: 0, max: 100 };
            case 'n9':
            default:
                return { min: null, max: null };
        }
    };

    const { min: yAxisMin, max: yAxisMax } = getYAxisBounds(selectedVariable);

    const getTooltipSuffix = (variable) => {
        switch (variable) {
            case 'fgu':
                return '';
            case 'n9':
                return ' elever';
            default:
                return ' %';
        }
    };

    const chartOptions = {
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: `Resultat och variabler för ${selectedSkola} i ämnet ${selectedSubject}`,
            align: 'left'
        },
        xAxis: [{
            categories: availableYears.map(year => `20${year}`),
            crosshair: true
        }],
        yAxis: [{
            title: {
                text: 'Betygspoäng'
            }
        }, {
            title: {
                text: variableOptions[selectedVariable],
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            min: yAxisMin,
            max: yAxisMax,
            opposite: true
        }],
        series: [
            {
                name: 'Betygspoäng',
                type: 'column',
                data: chartData.betygspoäng,
                tooltip: {
                    valueSuffix: ' poäng'
                }
            },
            {
                name: variableOptions[selectedVariable],
                type: 'line',
                lineWidth: 2.5,
                color: '#D93B48',
                yAxis: 1,
                data: selectedVariableData,
                marker: {
                    enabled: true
                },
                tooltip: {
                    valueSuffix: getTooltipSuffix(selectedVariable)
                }
            }
        ]
    };

    return (
        <div className="chart-container">

            <div className="description-container">
                <h2>Betygspoäng jämfört med värdet på utvalda variabler för {selectedSkola}</h2>
                <p>
                    Diagrammet visar skolans betygspoäng tillsammans med värdena på utvalda variabler. Använd rullgardinsmenyn ovanför diagrammet för att byta variabel.
                </p>
            </div>

            <select value={selectedVariable} onChange={(e) => setSelectedVariable(e.target.value)}>
                {Object.keys(variableOptions).map(key => (
                    <option value={key} key={key}>{variableOptions[key]}</option>
                ))}
            </select>
<p></p>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />

        </div>
    );
};

export default ResultatOchVariabler;
