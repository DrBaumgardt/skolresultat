import React, { useState } from "react";
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
      />
      <Linjediagram
        selectedKommun={selectedKommun}
        selectedSkola={selectedSkola}
        selectedSubject={selectedSubject}
      />
      <Stapeldiagram
        selectedKommun={selectedKommun}
        selectedSkola={selectedSkola}
        selectedSubject={selectedSubject}
      />
      <PredBP
        selectedKommun={selectedKommun}
        selectedSkola={selectedSkola}
        selectedSubject={selectedSubject}
      />
      <Footer />
    </div>
  );
}
