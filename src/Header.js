import React, { useEffect, useState } from "react";

const Header = ({
  selectedKommun,
  setSelectedKommun,
  selectedSkola,
  setSelectedSkola,
  selectedCategory,
  setSelectedCategory,
  selectedSubject,
  setSelectedSubject,
  selectedSubjectName,
  setSelectedSubjectName,
  selectedMetric,
  setSelectedMetric,
  selectedMetricName,
  setSelectedMetricName
}) => {
  const [kommuner, setKommuner] = useState([]);
  const [skolor, setSkolor] = useState([]);
  const [jsonData, setJsonData] = useState([]);

  useEffect(() => {
    fetch("/assets/m17_xx.json")
      .then((response) => response.json())
      .then((data) => {
        setJsonData(data);
        const uniqueKommuner = new Set(data.map((item) => item.kom));
        const sortedKommuner = Array.from(uniqueKommuner).sort();

        setKommuner(sortedKommuner);

        // Sätt selectedKommun till första kommunen i listan om den inte redan är satt
        if (!selectedKommun && sortedKommuner.length > 0) {
          setSelectedKommun(sortedKommuner[0]);
        }
      })
      .catch((error) => {
        console.error("Error loading file:", error);
      });
  }, [selectedKommun, setSelectedKommun]);

  useEffect(() => {
    if (selectedKommun && jsonData.length > 0) {
      const skolorArray = jsonData
        .filter((item) => item.kom === selectedKommun && item.m17_22 != null)
        .map((item) => item.skola)
        .sort();
      setSkolor(skolorArray);
      if (skolorArray.length > 0) {
        setSelectedSkola(skolorArray[0]);
      }
    }
  }, [selectedKommun, jsonData, setSelectedSkola]);

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
    setSelectedSubjectName(e.target.options[e.target.selectedIndex].text);
  };

  const handleMetricChange = (e) => {
    setSelectedMetric(e.target.value);
    setSelectedMetricName(e.target.options[e.target.selectedIndex].text);
  };

  return (
    <div className="header-container">

      <div className="logo-container">
        <h1>skolresultat</h1>
      </div>

      <div className="selection-container">

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
          <>
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
            <select value={selectedMetric} onChange={handleMetricChange}>
              <option key="Betygspoäng" value="bp">
                Betygspoäng
              </option>
              <option key="Andel godkända" value="ag">
                Andel godkända
              </option>
            </select>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
