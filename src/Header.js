import React, { useEffect, useState } from "react";

const Header = ({
  selectedKommun,
  setSelectedKommun,
  selectedSkola,
  setSelectedSkola,
  selectedCategory,
  setSelectedCategory,
  selectedSubject,
  setSelectedSubject
}) => {
  const [kommuner, setKommuner] = useState([]);
  const [skolor, setSkolor] = useState([]);
  const [jsonData, setJsonData] = useState([]);

  // Load JSON data from the provided file
  useEffect(() => {
    fetch("/assets/m17_xx.json")
      .then((response) => response.json())
      .then((data) => {
        setJsonData(data);
        const uniqueKommuner = new Set(data.map((item) => item.kom));
        setKommuner(Array.from(uniqueKommuner).sort());
      })
      .catch((error) => {
        console.error("Error loading file:", error);
      });
  }, []);

  useEffect(() => {
    if (selectedKommun) {
      const skolorArray = jsonData
        .filter((item) => item.kom === selectedKommun && item.m17_22 != null)
        .map((item) => item.skola)
        .sort();
      setSkolor(skolorArray);
      if (skolorArray.length > 0) {
        setSelectedSkola(skolorArray[0]);
      }
    }
  }, [selectedKommun, setSelectedSkola, jsonData]);

  const handleKommunChange = (e) => {
    setSelectedKommun(e.target.value);
  };

  const handleSkolaChange = (e) => {
    setSelectedSkola(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  return (
    <div className="header-container">
      <div className="title-container">
        <h1>Skolresultat</h1>
      </div>

      <div className="selection-container">
        <h2>Välj kommun och skola!</h2>

        <select value={selectedKommun} onChange={handleKommunChange}>
          {kommuner.map((kommun) => (
            <option key={kommun} value={kommun}>
              {kommun}
            </option>
          ))}
        </select>

        <select value={selectedSkola} onChange={handleSkolaChange}>
          {skolor.map((skola) => (
            <option key={skola} value={skola}>
              {skola}
            </option>
          ))}
        </select>

        <select value={selectedCategory} onChange={handleCategoryChange}>
          <option value="Meritvärden">Meritvärden</option>
          <option value="Betyg">Betyg</option>
          <option value="NP">NP</option>
        </select>

        {selectedCategory === "NP" && (
          <select value={selectedSubject} onChange={handleSubjectChange}>
            <option key="Matematik" value="ma">
              Matematik
            </option>
            <option key="Engelska" value="en">
              Engelska
            </option>
            <option key="Svenska" value="sv">
              Svenska
            </option>
            <option key="Svenska som andraspråk" value="sva">
              Svenska som andraspråk
            </option>
            <option key="Biologi" value="bi">
              Biologi
            </option>
            <option key="Fysik" value="fy">
              Fysik
            </option>
            <option key="Kemi" value="ke">
              Kemi
            </option>
            <option key="Geografi" value="ge">
              Geografi
            </option>
            <option key="Historia" value="hi">
              Historia
            </option>
            <option key="Religionskunskap" value="re">
              Religionskunskap
            </option>
            <option key="Samhällskunskap" value="sh">
              Samhällskunskap
            </option>
          </select>
        )}
      </div>
    </div>
  );
};

export default Header;
