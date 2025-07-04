import React, {useEffect, useState} from 'react';
import { SecondaryNavbar } from '@/components/energy-portfolio/SecondaryNavbar';
import { NotesSection } from '@/components/energy-portfolio/NotesSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import Swal from "sweetalert2";
import PowerBIReport, { energyportfolio } from '@/components/energy-portfolio/PowerBIReport';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

const FuturesPage = () => {
  const PATH = "http://localhost:8081"; // Percorso base per le API

  const [activeTab, setActiveTab] = useState('futures');
  const [confidenceLevel, setConfidenceLevel] = useState([80]);
  const [seasonality, setSeasonality] = useState([50]);

  // Alert states
  const [futuresType, setFuturesType] = useState('All');
  const [activeAlert, setActiveAlert] = useState(false);

  // General alert states
  const [minimumLevel, setMinimumLevel] = useState('');
  const [maximumLevel, setMaximumLevel] = useState('');
  const [checkModality, setCheckModality] = useState(false);
  const [minimumLevelError, setMinimumLevelError] = useState(false);
  const [maximumLevelError, setMaximumLevelError] = useState(false);
  const [rangeError, setRangeError] = useState(false);

  const [futuresYearly, setFuturesYearly] = useState("Yearly");
  const [futuresQuarterly, setFuturesQuarterly] = useState("Quarterly");
  const [futuresMonthly, setFuturesMonthly] = useState("Monthly");
  // Yearly alert states
  const [minimumLevelYearly, setMinimumLevelYearly] = useState('');
  const [maximumLevelYearly, setMaximumLevelYearly] = useState('');
  const [checkModalityYearly, setCheckModalityYearly] = useState(false);
  const [minimumLevelYearlyError, setMinimumLevelYearlyError] = useState(false);
  const [maximumLevelYearlyError, setMaximumLevelYearlyError] = useState(false);
  const [rangeYearlyError, setRangeYearlyError] = useState(false);

  // Quarterly alert states
  const [minimumLevelQuarterly, setMinimumLevelQuarterly] = useState('');
  const [maximumLevelQuarterly, setMaximumLevelQuarterly] = useState('');
  const [checkModalityQuarterly, setCheckModalityQuarterly] = useState(false);
  const [minimumLevelQuarterlyError, setMinimumLevelQuarterlyError] = useState(false);
  const [maximumLevelQuarterlyError, setMaximumLevelQuarterlyError] = useState(false);
  const [rangeQuarterlyError, setRangeQuarterlyError] = useState(false);

  // Monthly alert states
  const [minimumLevelMonthly, setMinimumLevelMonthly] = useState('');
  const [maximumLevelMonthly, setMaximumLevelMonthly] = useState('');
  const [checkModalityMonthly, setCheckModalityMonthly] = useState(false);
  const [minimumLevelMonthlyError, setMinimumLevelMonthlyError] = useState(false);
  const [maximumLevelMonthlyError, setMaximumLevelMonthlyError] = useState(false);
  const [rangeMonthlyError, setRangeMonthlyError] = useState(false);

  const [deleteAlert, setDeleteAlert] = useState({active: false, message: ""});

  const futureTabs = [
    {id: 'futures', label: 'Futures'},
    {id: 'futuresAnalysis', label: 'Futures Analysis'},
    {id: 'pastEnergyData', label: 'Past Energy Data'},
    {id: 'alerts', label: 'Alert Email'},
  ];

  // Map tabs to PowerBI report IDs
  const getReportIdForTab = (tabId) => {
    switch (tabId) {
      case 'futures':
        return energyportfolio.reports.futures.reportId;
      case 'futuresAnalysis':
        return energyportfolio.reports.futuresAnalysis.reportId;
      case 'pastEnergyData':
        return energyportfolio.reports.pastEnergyData.reportId;
      default:
        return null;
    }
  };
  // Alert validation functions
  const getLimit = (type = 'general') => {
    const limits = {
      general: 10000,
      yearly: 50000,
      quarterly: 12500,
      monthly: 4200
    };
    return limits[type] || limits.general;
  };

  const checkRangeError = (min, max, setError) => {
    const minVal = parseFloat(min);
    const maxVal = parseFloat(max);
    if (!isNaN(minVal) && !isNaN(maxVal) && minVal > maxVal) {
      setError(true);
    } else {
      setError(false);
    }
  };

  const handleMinimumLevelBlur = (value, setValue, setError, maxValue, setRangeError, type = 'general') => {
    const limit = getLimit(type);
    const numValue = parseFloat(value);

    if (isNaN(numValue) || numValue < 0 || numValue > limit) {
      setError(true);
    } else {
      setError(false);
      setValue(numValue.toString());
    }

    if (maxValue !== '') {
      checkRangeError(value, maxValue, setRangeError);
    }
  };

  const handleMaximumLevelBlur = (value, setValue, setError, minValue, setRangeError, type = 'general') => {
    const limit = getLimit(type);
    const numValue = parseFloat(value);

    if (isNaN(numValue) || numValue < 0 || numValue > limit) {
      setError(true);
    } else {
      setError(false);
      setValue(numValue.toString());
    }

    if (minValue !== '') {
      checkRangeError(minValue, value, setRangeError);
    }
  };

  const renderChart = () => {
    // For PowerBI tabs, show the PowerBI report
    if (activeTab === 'futures' || activeTab === 'futuresAnalysis' || activeTab === 'pastEnergyData') {
      const reportId = getReportIdForTab(activeTab);
      if (reportId) {
        return (
            <PowerBIReport
                reportId={reportId}
                className="w-full h-[800px]"
            />
        );
      }
    }
  };

  const fetchAlertData = async () => {
    try {
      const response = await fetch(`${PATH}/email/checkAlertField`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Errore: ${errorText}`);
        return;
      }

      const data = await response.json();
      // Assicuriamoci che `alertData` sia effettivamente un array prima di iterarlo
      if (!data.alerts || !Array.isArray(data.alerts)) {
        console.log("Errore: alertData non è un array valido", data);
        return;
      }

      const check = [false, false, false]; // [Yearly, Quarterly, Monthly]
      let minimumLevelYearly, maximumLevelYearly, checkModalityYearly;
      let minimumLevelQuarterly, maximumLevelQuarterly, checkModalityQuarterly;
      let minimumLevelMonthly, maximumLevelMonthly, checkModalityMonthly;
      let minimumLevel, maximumLevel, checkModality;

      data.alerts.forEach((alertFutures) => {

        if (!alertFutures) {
          return;
        }

        const tableName = alertFutures.futuresType;
        const normalizedFuturesType = tableName.replace("Alert", "");

        switch (normalizedFuturesType) {
          case "Yearly":
            minimumLevelYearly = alertFutures.minPriceValue || "";
            maximumLevelYearly = alertFutures.maxPriceValue || "";
            checkModalityYearly = !!alertFutures.checkModality;
            check[0] = true;  // Imposta Yearly a true
            break;
          case "Quarterly":
            minimumLevelQuarterly = alertFutures.minPriceValue || "";
            maximumLevelQuarterly = alertFutures.maxPriceValue || "";
            checkModalityQuarterly = !!alertFutures.checkModality;
            check[1] = true;  // Imposta Quarterly a true
            break;
          case "Monthly":
            minimumLevelMonthly = alertFutures.minPriceValue || "";
            maximumLevelMonthly = alertFutures.maxPriceValue || "";
            checkModalityMonthly = !!alertFutures.checkModality;
            check[2] = true;  // Imposta Monthly a true
            break;
          case "General":
            minimumLevel = alertFutures.minPriceValue || "";
            maximumLevel = alertFutures.maxPriceValue || "";
            checkModality = !!alertFutures.checkModality;
            break;
          default:
            console.warn(`Tipo di alert non riconosciuto: ${normalizedFuturesType}`);
        }
      });

      if (check.every(value => value === true)) {
        setFuturesType("All");
        setMinimumLevelYearly(minimumLevelYearly);
        setMaximumLevelYearly(maximumLevelYearly);
        setCheckModalityYearly(checkModalityYearly);
        setMinimumLevelQuarterly(minimumLevelQuarterly);
        setMaximumLevelQuarterly(maximumLevelQuarterly);
        setCheckModalityQuarterly(checkModalityQuarterly);
        setMinimumLevelMonthly(minimumLevelMonthly);
        setMaximumLevelMonthly(maximumLevelMonthly);
        setCheckModalityMonthly(checkModalityMonthly);
      } else if (check[0]) {
        setFuturesType("Yearly");
        setMinimumLevel(minimumLevelYearly);
        setMaximumLevel(maximumLevelYearly);
        setCheckModality(checkModalityYearly);
      } else if (check[1]) {
        setFuturesType("Quarterly");
        setMinimumLevel(minimumLevelQuarterly);
        setMaximumLevel(maximumLevelQuarterly);
        setCheckModality(checkModalityQuarterly);
      } else if (check[2]) {
        setFuturesType("Monthly");
        setMinimumLevel(minimumLevelMonthly);
        setMaximumLevel(maximumLevelMonthly);
        setCheckModality(checkModalityMonthly);
      } else {
        setFuturesType("General");
        setMinimumLevel(minimumLevel);
        setMaximumLevel(maximumLevel);
        setCheckModality(checkModality);
      }

      setActiveAlert(data.checkEmail || false);

    } catch (error) {
      console.log("Errore durante il recupero dei dati degli alert:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'alerts') {
      fetchAlertData();
    }
  }, [activeTab]);

  const fetchCheckAlert = async () => {
    try {
      const response = await fetch(`${PATH}/email/checkAlert`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({futuresType: futuresType}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Errore: ${errorText}`);
        Swal.fire({
          icon: "error",
          title: "Errore!",
          text: "Errore durante il recupero dei dati degli alert.",
        });
        return;
      }

      const data = await response.text(); // Il backend restituisce TEXT_PLAIN

      if (data == "Nessun alert attivo") {
        // Se tutto è corretto, invia direttamente l'email
        sendEmail();
      } else {
        // Valida solo i campi relativi al tipo di futures selezionato
        let isValid = true;

        if (futuresType === "All") {
          if (!(String(minimumLevelYearly).trim()) || !(String(maximumLevelYearly).trim())) {
            isValid = false;
          } else if (!(String(minimumLevelQuarterly).trim()) || !(String(maximumLevelQuarterly).trim())) {
            isValid = false;
          } else if (!(String(minimumLevelMonthly).trim()) || !(String(maximumLevelMonthly).trim())) {
            isValid = false;
          }
        } else {
          if (!(String(minimumLevel).trim()) || !(String(maximumLevel).trim())) {
            isValid = false;
          }
        }

        if (!isValid) {
          Swal.fire({
            icon: "warning",
            title: "Attention!",
            text: "Please fill in all required fields before proceeding.",
            confirmButtonText: "OK",
          });
          return; // Interrompe l'esecuzione
        }

        Swal.fire({
          icon: "warning",
          title: "Attention!",
          text: "To proceed you must delete the previous alert.",
          showCancelButton: true,
          confirmButtonText: "Go on",
          cancelButtonText: "Cancel",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            // L'utente ha premuto "Continua"
            setDeleteAlert({active: true, message: data});
          }
        });
      }
    } catch (error) {
      console.error("Errore durante il recupero dei dati degli alert:", error);
      Swal.fire({
        icon: "error",
        title: "Errore!",
        text: "Si è verificato un errore durante il recupero dei dati degli alert.",
      });
    }
  };

  const sendEmail = async () => {
    // Verifica se ci sono errori nei campi in base al tipo di futures selezionato
    let hasErrors = false;

    switch (futuresType) {
      case "General":
        hasErrors = minimumLevelError || maximumLevelError || rangeError;
        break;
      case "Yearly":
        hasErrors = minimumLevelYearlyError || maximumLevelYearlyError || rangeYearlyError;
        break;
      case "Quarterly":
        hasErrors = minimumLevelQuarterlyError || maximumLevelQuarterlyError || rangeQuarterlyError;
        break;
      case "Monthly":
        hasErrors = minimumLevelMonthlyError || maximumLevelMonthlyError || rangeMonthlyError;
        break;
      case "All":
        hasErrors =
            minimumLevelYearlyError || maximumLevelYearlyError || rangeYearlyError ||
            minimumLevelQuarterlyError || maximumLevelQuarterlyError || rangeQuarterlyError ||
            minimumLevelMonthlyError || maximumLevelMonthlyError || rangeMonthlyError;
        break;
    }

    if (hasErrors) {
      Swal.fire({
        icon: "warning",
        title: "Attention!",
        text: "Please correct any errors in the fields before triggering the alert.",
        confirmButtonText: "OK",
      });
      return;
    }

    // Verifica che tutti i campi obbligatori siano compilati
    let isValid = true;

    if (futuresType === "All") {
      if (
          !(String(minimumLevelYearly).trim()) || !(String(maximumLevelYearly).trim()) ||
          !(String(minimumLevelQuarterly).trim()) || !(String(maximumLevelQuarterly).trim()) ||
          !(String(minimumLevelMonthly).trim()) || !(String(maximumLevelMonthly).trim())
      ) {
        isValid = false;
      }
    } else {
      if (!(String(minimumLevel).trim()) || !(String(maximumLevel).trim())) {
        isValid = false;
      }
    }

    if (!isValid) {
      Swal.fire({
        icon: "warning",
        title: "Attention!",
        text: "Please fill in all required fields before proceeding.",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      let response;
      if (futuresType === "All") {
        const payload = {
          minimumLevelYearly,
          maximumLevelYearly,
          checkModalityYearly,
          minimumLevelQuarterly,
          maximumLevelQuarterly,
          checkModalityQuarterly,
          minimumLevelMonthly,
          maximumLevelMonthly,
          checkModalityMonthly,
          futuresYearly,
          futuresQuarterly,
          futuresMonthly,
          futuresType,
          deleteAlert,
          activeAlert
        };

        console.log("Invio email - Payload per 'All':", payload);

        response = await fetch(`${PATH}/email/send-email`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        const payload = {
          minimumLevel,
          maximumLevel,
          checkModality,
          futuresType,
          deleteAlert,
          activeAlert
        };

        console.log(`Invio email - Payload per '${futuresType}':`, payload);

        response = await fetch(`${PATH}/email/send-email`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Email inviata con successo!",
          confirmButtonText: "OK",
        });
      } else {
        const errorText = await response.text();
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: `Errore: ${errorText}`,
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Errore durante l'invio dell'email:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Si è verificato un errore durante l'invio dell'email.",
        confirmButtonText: "OK",
      });
    }
  };

  useEffect(() => {
    if (deleteAlert.active) {
      sendEmail();
    }
  }, [deleteAlert]);

    const renderAlertSection = () => {
      if (activeTab !== 'alerts') return null;

      return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Email Alert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="futures-type">
                    Futures type
                  </label>
                  <select
                      id="futures-type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={futuresType}
                      onChange={(e) => setFuturesType(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              {futuresType === "General" && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <h3 className="text-lg font-medium">General</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Minimum level</label>
                        <input
                            type="number"
                            placeholder={`Enter minimum level (0 to ${getLimit()})`}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${minimumLevelError ? 'border-red-500' : 'border-gray-300'}`}
                            value={minimumLevel}
                            onChange={(e) => {
                              setMinimumLevel(e.target.value);
                              if (maximumLevel !== '') {
                                checkRangeError(e.target.value, maximumLevel, setRangeError);
                              }
                            }}
                            onBlur={() => handleMinimumLevelBlur(minimumLevel, setMinimumLevel, setMinimumLevelError, maximumLevel, setRangeError)}
                        />
                        {minimumLevelError && (
                            <div className="text-red-500 text-xs mt-1">
                              The value must be between 0 and {getLimit()}!
                            </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Maximum level</label>
                        <input
                            type="number"
                            placeholder={`Enter maximum level (0 to ${getLimit()})`}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${maximumLevelError ? 'border-red-500' : 'border-gray-300'}`}
                            value={maximumLevel}
                            onChange={(e) => {
                              setMaximumLevel(e.target.value);
                              if (minimumLevel !== '') {
                                checkRangeError(minimumLevel, e.target.value, setRangeError);
                              }
                            }}
                            onBlur={() => handleMaximumLevelBlur(maximumLevel, setMaximumLevel, setMaximumLevelError, minimumLevel, setRangeError)}
                        />
                        {maximumLevelError && (
                            <div className="text-red-500 text-xs mt-1">
                              The value must be between 0 and {getLimit()}!
                            </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Modality</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={checkModality ? "Percentage" : "Value"}
                            onChange={(e) => setCheckModality(e.target.value === "Percentage")}
                        >
                          <option value="Value">Value</option>
                          <option value="Percentage">Percentage</option>
                        </select>
                      </div>
                    </div>
                    {rangeError && (
                        <div className="text-red-500 text-sm mt-2">
                          The minimum value cannot be greater than the maximum value!
                        </div>
                    )}
                  </div>
              )}

              {futuresType === "All" && (
                  <>
                    {/* Yearly Section */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center mb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <h3 className="text-lg font-medium">Yearly</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Minimum level</label>
                          <input
                              type="number"
                              placeholder={`Enter minimum level (0 to ${getLimit('yearly')})`}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${minimumLevelYearlyError ? 'border-red-500' : 'border-gray-300'}`}
                              value={minimumLevelYearly}
                              onChange={(e) => {
                                setMinimumLevelYearly(e.target.value);
                                if (maximumLevelYearly !== '') {
                                  checkRangeError(e.target.value, maximumLevelYearly, setRangeYearlyError);
                                }
                              }}
                              onBlur={() => handleMinimumLevelBlur(minimumLevelYearly, setMinimumLevelYearly, setMinimumLevelYearlyError, maximumLevelYearly, setRangeYearlyError, 'yearly')}
                          />
                          {minimumLevelYearlyError && (
                              <div className="text-red-500 text-xs mt-1">
                                The value must be between 0 and {getLimit('yearly')}!
                              </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Maximum level</label>
                          <input
                              type="number"
                              placeholder={`Enter maximum level (0 to ${getLimit('yearly')})`}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${maximumLevelYearlyError ? 'border-red-500' : 'border-gray-300'}`}
                              value={maximumLevelYearly}
                              onChange={(e) => {
                                setMaximumLevelYearly(e.target.value);
                                if (minimumLevelYearly !== '') {
                                  checkRangeError(minimumLevelYearly, e.target.value, setRangeYearlyError);
                                }
                              }}
                              onBlur={() => handleMaximumLevelBlur(maximumLevelYearly, setMaximumLevelYearly, setMaximumLevelYearlyError, minimumLevelYearly, setRangeYearlyError, 'yearly')}
                          />
                          {maximumLevelYearlyError && (
                              <div className="text-red-500 text-xs mt-1">
                                The value must be between 0 and {getLimit('yearly')}!
                              </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Modality</label>
                          <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={checkModalityYearly ? "Percentage" : "Value"}
                              onChange={(e) => setCheckModalityYearly(e.target.value === "Percentage")}
                          >
                            <option value="Value">Value</option>
                            <option value="Percentage">Percentage</option>
                          </select>
                        </div>
                      </div>
                      {rangeYearlyError && (
                          <div className="text-red-500 text-sm mt-2">
                            The minimum value cannot be greater than the maximum value!
                          </div>
                      )}
                    </div>

                    {/* Quarterly Section */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center mb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <h3 className="text-lg font-medium">Quarterly</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Minimum level</label>
                          <input
                              type="number"
                              placeholder={`Enter minimum level (0 to ${getLimit('quarterly')})`}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${minimumLevelQuarterlyError ? 'border-red-500' : 'border-gray-300'}`}
                              value={minimumLevelQuarterly}
                              onChange={(e) => {
                                setMinimumLevelQuarterly(e.target.value);
                                if (maximumLevelQuarterly !== '') {
                                  checkRangeError(e.target.value, maximumLevelQuarterly, setRangeQuarterlyError);
                                }
                              }}
                              onBlur={() => handleMinimumLevelBlur(minimumLevelQuarterly, setMinimumLevelQuarterly, setMinimumLevelQuarterlyError, maximumLevelQuarterly, setRangeQuarterlyError, 'quarterly')}
                          />
                          {minimumLevelQuarterlyError && (
                              <div className="text-red-500 text-xs mt-1">
                                The value must be between 0 and {getLimit('quarterly')}!
                              </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Maximum level</label>
                          <input
                              type="number"
                              placeholder={`Enter maximum level (0 to ${getLimit('quarterly')})`}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${maximumLevelQuarterlyError ? 'border-red-500' : 'border-gray-300'}`}
                              value={maximumLevelQuarterly}
                              onChange={(e) => {
                                setMaximumLevelQuarterly(e.target.value);
                                if (minimumLevelQuarterly !== '') {
                                  checkRangeError(minimumLevelQuarterly, e.target.value, setRangeQuarterlyError);
                                }
                              }}
                              onBlur={() => handleMaximumLevelBlur(maximumLevelQuarterly, setMaximumLevelQuarterly, setMaximumLevelQuarterlyError, minimumLevelQuarterly, setRangeQuarterlyError, 'quarterly')}
                          />
                          {maximumLevelQuarterlyError && (
                              <div className="text-red-500 text-xs mt-1">
                                The value must be between 0 and {getLimit('quarterly')}!
                              </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Modality</label>
                          <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={checkModalityQuarterly ? "Percentage" : "Value"}
                              onChange={(e) => setCheckModalityQuarterly(e.target.value === "Percentage")}
                          >
                            <option value="Value">Value</option>
                            <option value="Percentage">Percentage</option>
                          </select>
                        </div>
                      </div>
                      {rangeQuarterlyError && (
                          <div className="text-red-500 text-sm mt-2">
                            The minimum value cannot be greater than the maximum value!
                          </div>
                      )}
                    </div>

                    {/* Monthly Section */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center mb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <h3 className="text-lg font-medium">Monthly</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Minimum level</label>
                          <input
                              type="number"
                              placeholder={`Enter minimum level (0 to ${getLimit('monthly')})`}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${minimumLevelMonthlyError ? 'border-red-500' : 'border-gray-300'}`}
                              value={minimumLevelMonthly}
                              onChange={(e) => {
                                setMinimumLevelMonthly(e.target.value);
                                if (maximumLevelMonthly !== '') {
                                  checkRangeError(e.target.value, maximumLevelMonthly, setRangeMonthlyError);
                                }
                              }}
                              onBlur={() => handleMinimumLevelBlur(minimumLevelMonthly, setMinimumLevelMonthly, setMinimumLevelMonthlyError, maximumLevelMonthly, setRangeMonthlyError, 'monthly')}
                          />
                          {minimumLevelMonthlyError && (
                              <div className="text-red-500 text-xs mt-1">
                                The value must be between 0 and {getLimit('monthly')}!
                              </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Maximum level</label>
                          <input
                              type="number"
                              placeholder={`Enter maximum level (0 to ${getLimit('monthly')})`}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${maximumLevelMonthlyError ? 'border-red-500' : 'border-gray-300'}`}
                              value={maximumLevelMonthly}
                              onChange={(e) => {
                                setMaximumLevelMonthly(e.target.value);
                                if (minimumLevelMonthly !== '') {
                                  checkRangeError(minimumLevelMonthly, e.target.value, setRangeMonthlyError);
                                }
                              }}
                              onBlur={() => handleMaximumLevelBlur(maximumLevelMonthly, setMaximumLevelMonthly, setMaximumLevelMonthlyError, minimumLevelMonthly, setRangeMonthlyError, 'monthly')}
                          />
                          {maximumLevelMonthlyError && (
                              <div className="text-red-500 text-xs mt-1">
                                The value must be between 0 and {getLimit('monthly')}!
                              </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Modality</label>
                          <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={checkModalityMonthly ? "Percentage" : "Value"}
                              onChange={(e) => setCheckModalityMonthly(e.target.value === "Percentage")}
                          >
                            <option value="Value">Value</option>
                            <option value="Percentage">Percentage</option>
                          </select>
                        </div>
                      </div>
                      {rangeMonthlyError && (
                          <div className="text-red-500 text-sm mt-2">
                            The minimum value cannot be greater than the maximum value!
                          </div>
                      )}
                    </div>
                  </>
              )}

              {futuresType === "Yearly" && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <h3 className="text-lg font-medium">Yearly</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Minimum level</label>
                        <input
                            type="number"
                            placeholder={`Enter minimum level (0 to ${getLimit()})`}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${minimumLevelError ? 'border-red-500' : 'border-gray-300'}`}
                            value={minimumLevel}
                            onChange={(e) => {
                              setMinimumLevel(e.target.value);
                              if (maximumLevel !== '') {
                                checkRangeError(e.target.value, maximumLevel, setRangeError);
                              }
                            }}
                            onBlur={() => handleMinimumLevelBlur(minimumLevel, setMinimumLevel, setMinimumLevelError, maximumLevel, setRangeError)}
                        />
                        {minimumLevelError && (
                            <div className="text-red-500 text-xs mt-1">
                              The value must be between 0 and {getLimit()}!
                            </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Maximum level</label>
                        <input
                            type="number"
                            placeholder={`Enter maximum level (0 to ${getLimit()})`}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${maximumLevelError ? 'border-red-500' : 'border-gray-300'}`}
                            value={maximumLevel}
                            onChange={(e) => {
                              setMaximumLevel(e.target.value);
                              if (minimumLevel !== '') {
                                checkRangeError(minimumLevel, e.target.value, setRangeError);
                              }
                            }}
                            onBlur={() => handleMaximumLevelBlur(maximumLevel, setMaximumLevel, setMaximumLevelError, minimumLevel, setRangeError)}
                        />
                        {maximumLevelError && (
                            <div className="text-red-500 text-xs mt-1">
                              The value must be between 0 and {getLimit()}!
                            </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Modality</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={checkModality ? "Percentage" : "Value"}
                            onChange={(e) => setCheckModality(e.target.value === "Percentage")}
                        >
                          <option value="Value">Value</option>
                          <option value="Percentage">Percentage</option>
                        </select>
                      </div>
                    </div>
                    {rangeError && (
                        <div className="text-red-500 text-sm mt-2">
                          The minimum value cannot be greater than the maximum value!
                        </div>
                    )}
                  </div>
              )}

              {futuresType === "Quarterly" && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <h3 className="text-lg font-medium">Quarterly</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Minimum level</label>
                        <input
                            type="number"
                            placeholder={`Enter minimum level (0 to ${getLimit()})`}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${minimumLevelError ? 'border-red-500' : 'border-gray-300'}`}
                            value={minimumLevel}
                            onChange={(e) => {
                              setMinimumLevel(e.target.value);
                              if (maximumLevel !== '') {
                                checkRangeError(e.target.value, maximumLevel, setRangeError);
                              }
                            }}
                            onBlur={() => handleMinimumLevelBlur(minimumLevel, setMinimumLevel, setMinimumLevelError, maximumLevel, setRangeError)}
                        />
                        {minimumLevelError && (
                            <div className="text-red-500 text-xs mt-1">
                              The value must be between 0 and {getLimit()}!
                            </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Maximum level</label>
                        <input
                            type="number"
                            placeholder={`Enter maximum level (0 to ${getLimit()})`}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${maximumLevelError ? 'border-red-500' : 'border-gray-300'}`}
                            value={maximumLevel}
                            onChange={(e) => {
                              setMaximumLevel(e.target.value);
                              if (minimumLevel !== '') {
                                checkRangeError(minimumLevel, e.target.value, setRangeError);
                              }
                            }}
                            onBlur={() => handleMaximumLevelBlur(maximumLevel, setMaximumLevel, setMaximumLevelError, minimumLevel, setRangeError)}
                        />
                        {maximumLevelError && (
                            <div className="text-red-500 text-xs mt-1">
                              The value must be between 0 and {getLimit()}!
                            </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Modality</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={checkModality ? "Percentage" : "Value"}
                            onChange={(e) => setCheckModality(e.target.value === "Percentage")}
                        >
                          <option value="Value">Value</option>
                          <option value="Percentage">Percentage</option>
                        </select>
                      </div>
                    </div>
                    {rangeError && (
                        <div className="text-red-500 text-sm mt-2">
                          The minimum value cannot be greater than the maximum value!
                        </div>
                    )}
                  </div>
              )}

              {futuresType === "Monthly" && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <h3 className="text-lg font-medium">Monthly</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Minimum level</label>
                        <input
                            type="number"
                            placeholder={`Enter minimum level (0 to ${getLimit()})`}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${minimumLevelError ? 'border-red-500' : 'border-gray-300'}`}
                            value={minimumLevel}
                            onChange={(e) => {
                              setMinimumLevel(e.target.value);
                              if (maximumLevel !== '') {
                                checkRangeError(e.target.value, maximumLevel, setRangeError);
                              }
                            }}
                            onBlur={() => handleMinimumLevelBlur(minimumLevel, setMinimumLevel, setMinimumLevelError, maximumLevel, setRangeError)}
                        />
                        {minimumLevelError && (
                            <div className="text-red-500 text-xs mt-1">
                              The value must be between 0 and {getLimit()}!
                            </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Maximum level</label>
                        <input
                            type="number"
                            placeholder={`Enter maximum level (0 to ${getLimit()})`}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${maximumLevelError ? 'border-red-500' : 'border-gray-300'}`}
                            value={maximumLevel}
                            onChange={(e) => {
                              setMaximumLevel(e.target.value);
                              if (minimumLevel !== '') {
                                checkRangeError(minimumLevel, e.target.value, setRangeError);
                              }
                            }}
                            onBlur={() => handleMaximumLevelBlur(maximumLevel, setMaximumLevel, setMaximumLevelError, minimumLevel, setRangeError)}
                        />
                        {maximumLevelError && (
                            <div className="text-red-500 text-xs mt-1">
                              The value must be between 0 and {getLimit()}!
                            </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Modality</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={checkModality ? "Percentage" : "Value"}
                            onChange={(e) => setCheckModality(e.target.value === "Percentage")}
                        >
                          <option value="Value">Value</option>
                          <option value="Percentage">Percentage</option>
                        </select>
                      </div>
                    </div>
                    {rangeError && (
                        <div className="text-red-500 text-sm mt-2">
                          The minimum value cannot be greater than the maximum value!
                        </div>
                    )}
                  </div>
              )}

              {/* Alert Controls */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={activeAlert}
                        onChange={(e) => setActiveAlert(e.target.checked)}
                    />
                    <div
                        className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer transition-colors ${activeAlert ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div
                          className={`dot absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform ${activeAlert ? 'translate-x-full bg-white' : 'bg-white'}`}></div>
                    </div>
                  </label>
                  <span className="ml-3 text-sm font-medium text-gray-700">Active Alert</span>
                </div>
                <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium"
                    onClick={fetchCheckAlert}
                >
                  Save
                </button>
              </div>
            </CardContent>
          </Card>
      );
    };

    return (
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Previsioni Future</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Analizza le proiezioni future dei tuoi consumi energetici
          </p>

          {/* Secondary Navbar */}
          <SecondaryNavbar
              items={futureTabs}
              activeItemId={activeTab}
              onItemClick={setActiveTab}
          />
          
          {/* Chart Area - Only show if not on alerts tab */}
          {activeTab !== 'alerts' && (
              <Card className="mb-6 p-6">
                {renderChart()}

              </Card>
          )}

          {/* Email Alert Section - Only show on alerts tab */}
          {renderAlertSection()}

          {/* Notes */}
          {activeTab === 'futures' && (
              <NotesSection title="Note sul Controllo">
                <p>
                  Questa sezione mostra il report Power BI relativo ai Futures con una panoramica dei dati.
                  I dati vengono caricati automaticamente all'apertura della pagina.
                </p>
              </NotesSection>
          )}
          {activeTab === 'futuresAnalysis' && (
              <NotesSection title="Note sul Controllo">
                <p>
                  Questa sezione mostra il report Power BI relativo ad un'analisi dei Futures.
                  I dati vengono caricati automaticamente all'apertura della pagina.
                </p>
              </NotesSection>
          )}
          {activeTab === 'pastEnergyData' && (
              <NotesSection title="Note sul Controllo">
                <p>
                  Questa sezione mostra il report Power BI sullo storico del costo dell'energia elettrica.
                  I dati vengono caricati automaticamente all'apertura della pagina.
                </p>
              </NotesSection>
          )}
          {activeTab === 'alerts' && (
              <NotesSection title="Note sul Controllo">
                <p>
                  Questa sezione mostra il report Power BI sui Futures con una panoramica dei dati.
                  I dati vengono caricati automaticamente all'apertura della pagina.
                </p>
              </NotesSection>
          )}
        </div>
    );
  };


  export default FuturesPage;