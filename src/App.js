import React, { useState, useEffect } from "react";
import Header from "./Header";
import Linjediagram from "./Linjediagram";
import Stapeldiagram from "./Stapeldiagram";
import PredBP from "./PredBP";
import Footer from "./Footer";
import "./styles.css";

export default function App() {
  const [selectedKommun, setSelectedKommun] = useState("Linköping");
  const [selectedSkola, setSelectedSkola] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("NP");
  const [selectedSubject, setSelectedSubject] = useState("ma");
  const [selectedSubjectName, setSelectedSubjectName] = useState("");

  useEffect(() => {
    const initialSubjectName = document.querySelector(`option[value="${selectedSubject}"]`)?.textContent;
    if (initialSubjectName) {
        setSelectedSubjectName(initialSubjectName);
    }
  }, []);

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
      />
      <Linjediagram
        selectedKommun={selectedKommun}
        selectedSkola={selectedSkola}
        selectedSubject={selectedSubject}
        selectedSubjectName={selectedSubjectName}
      />
      <Stapeldiagram
        selectedKommun={selectedKommun}
        selectedSkola={selectedSkola}
        selectedSubject={selectedSubject}
        selectedSubjectName={selectedSubjectName}
      />
      <PredBP
        selectedKommun={selectedKommun}
        selectedSkola={selectedSkola}
        selectedSubject={selectedSubject}
        selectedSubjectName={selectedSubjectName}
      />
      <Footer />
    </div>
  );
}
