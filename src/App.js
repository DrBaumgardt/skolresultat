import React, { useState, useEffect } from "react";
import Header from "./Header";
import Linjediagram from "./Linjediagram";
import Stapeldiagram from "./Stapeldiagram";
import Korrelation from "./Korrelation";
import Resultatochvariabler from "./Resultatochvariabler";
import PredBP from "./PredBP";
import LinjeResidualer from "./LinjeResidualer";
import StapelResidualer from "./StapelResidualer";
import LinjeHappygrades from "./LinjeHappygrades";
import StapelHappygrades from "./StapelHappygrades";
import Footer from "./Footer";
import "./styles.css";

export default function App() {
  const [selectedKommun, setSelectedKommun] = useState("Linköping");
  const [selectedSkola, setSelectedSkola] = useState("Nya Munken");
  const [selectedCategory, setSelectedCategory] = useState("NP");
  const [selectedSubject, setSelectedSubject] = useState("ma");
  const [selectedSubjectName, setSelectedSubjectName] = useState("Matematik");
  const [selectedMetric, setSelectedMetric] = useState("bp");
  const [selectedMetricName, setSelectedMetricName] = useState("Betygspoäng");

  useEffect(() => {
    const initialSubjectName = document.querySelector(
      `option[value="${selectedSubject}"]`
    )?.textContent;
    if (initialSubjectName) {
      setSelectedSubjectName(initialSubjectName);
    }
  }, [selectedSubject]);

  return (
    <div className="App">
      <Header
        selectedKommun={selectedKommun}
        setSelectedKommun={setSelectedKommun}
        selectedSkola={selectedSkola}
        setSelectedSkola={setSelectedSkola}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedSubjectName={selectedSubjectName}
        setSelectedSubjectName={setSelectedSubjectName}
        selectedMetric={selectedMetric}
        setSelectedMetric={setSelectedMetric}
        selectedMetricName={selectedMetricName}
        setSelectedMetricName={setSelectedMetricName}
      />

      <div className="content-container">
        <div className="h1-container">
          <h1>Resultat</h1>
        </div>

        <Linjediagram
          selectedKommun={selectedKommun}
          selectedSkola={selectedSkola}
          selectedSubject={selectedSubject}
          selectedSubjectName={selectedSubjectName}
          selectedMetric={selectedMetric}
          selectedMetricName={selectedMetricName}
        />
        <Stapeldiagram
          selectedKommun={selectedKommun}
          selectedSkola={selectedSkola}
          selectedSubject={selectedSubject}
          selectedSubjectName={selectedSubjectName}
          selectedMetric={selectedMetric}
          selectedMetricName={selectedMetricName}
        />
        <div className="h1-container">
          <h1>Korrelationsanalys</h1>
        </div>
        <Korrelation
          selectedKommun={selectedKommun}
          selectedSkola={selectedSkola}
          selectedSubject={selectedSubject}
          selectedSubjectName={selectedSubjectName}
          selectedMetric={selectedMetric}
          selectedMetricName={selectedMetricName}
        />
        <Resultatochvariabler
          selectedKommun={selectedKommun}
          selectedSkola={selectedSkola}
          selectedSubject={selectedSubject}
          selectedSubjectName={selectedSubjectName}
          selectedMetric={selectedMetric}
          selectedMetricName={selectedMetricName}
        />
        <div className="h1-container">
          <h1>Regressionsanalys</h1>
        </div>
        <PredBP
          selectedKommun={selectedKommun}
          selectedSkola={selectedSkola}
          selectedSubject={selectedSubject}
          selectedSubjectName={selectedSubjectName}
          selectedMetric={selectedMetric}
          selectedMetricName={selectedMetricName}
        />
        <LinjeResidualer
          selectedKommun={selectedKommun}
          selectedSkola={selectedSkola}
          selectedSubject={selectedSubject}
          selectedSubjectName={selectedSubjectName}
          selectedMetric={selectedMetric}
          selectedMetricName={selectedMetricName}
        />
        <StapelResidualer
          selectedKommun={selectedKommun}
          selectedSkola={selectedSkola}
          selectedSubject={selectedSubject}
          selectedSubjectName={selectedSubjectName}
          selectedMetric={selectedMetric}
          selectedMetricName={selectedMetricName}
        />
        <div className="h1-container">
          <h1>Betygsinflation</h1>
        </div>
        <LinjeHappygrades
          selectedKommun={selectedKommun}
          selectedSkola={selectedSkola}
          selectedSubject={selectedSubject}
          selectedSubjectName={selectedSubjectName}
          selectedMetric={selectedMetric}
          selectedMetricName={selectedMetricName}
        />
        <StapelHappygrades
          selectedKommun={selectedKommun}
          selectedSkola={selectedSkola}
          selectedSubject={selectedSubject}
          selectedSubjectName={selectedSubjectName}
          selectedMetric={selectedMetric}
          selectedMetricName={selectedMetricName}
        />
      </div>
      <Footer />
    </div>
  );
}
