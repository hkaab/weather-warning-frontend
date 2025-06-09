// src/App.tsx
import React, { useState, useEffect } from 'react';
import StateSelect from './components/StateSelect';
import GoogleMapAustralia from './components/GoogleMapAustralia';
import WarningList from './components/WarningList';
import WarningDetailModal from './components/WarningDetailModal';
import { getWarningsByState, getWarningDetails } from './api';
import { getStateFromCoordinates } from './utils/locationUtils'; // NEW IMPORT
import './App.css';
import { ParsedWarningDetail } from './types/api';

function App() {
    // State for overall warning list (only IDs)
    const [selectedState, setSelectedState] = useState<string>('');
    const [warningIds, setWarningIds] = useState<string[]>([]);
    const [loadingWarnings, setLoadingWarnings] = useState<boolean>(false);
    const [warningsError, setWarningsError] = useState<string | null>(null);

    // State for selected warning details (for the modal)
    const [selectedWarningId, setSelectedWarningId] = useState<string | null>(null);
    const [warningDetails, setWarningDetails] = useState<ParsedWarningDetail | null>(null);
    const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);

    // NEW: Effect to get user's initial location on component mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log("Geolocation successful:", latitude, longitude);
                    const stateCode = getStateFromCoordinates(latitude, longitude);
                    if (stateCode) {
                        setSelectedState(stateCode);
                        console.log("Initial state set based on location:", stateCode);
                    } else {
                        console.log("Could not determine state from location. Please select manually.");
                    }
                },
                (error) => {
                    console.warn("Geolocation failed:", error.message);
                    // Common errors: User denied, position unavailable, timeout
                    // No action needed other than logging, user can select manually
                },
                {
                    enableHighAccuracy: false, // Low accuracy is usually fine for state detection
                    timeout: 5000,             // Wait 5 seconds for location
                    maximumAge: 0              // Don't use cached location
                }
            );
        } else {
            console.warn("Geolocation is not supported by this browser.");
        }
    }, []); // Empty dependency array means this runs only once on mount

    // Effect to fetch WARNING IDs when selectedState changes (unchanged)
    useEffect(() => {
        if (selectedState) {
            setLoadingWarnings(true);
            setWarningsError(null);
            setWarningIds([]);
            setSelectedWarningId(null);
            setWarningDetails(null);

            getWarningsByState(selectedState)
                .then((ids: string[]) => {
                    setWarningIds(ids);
                })
                .catch((error: any) => {
                    setWarningsError(error.message);
                })
                .finally(() => {
                    setLoadingWarnings(false);
                });
        } else {
            setWarningIds([]);
            setWarningsError(null);
            setLoadingWarnings(false);
        }
    }, [selectedState]);

    // Effect to fetch warning details when selectedWarningId changes (for modal) (unchanged)
    useEffect(() => {
        if (selectedWarningId) {
            setLoadingDetails(true);
            setDetailsError(null);
            setWarningDetails(null);

            getWarningDetails(selectedWarningId)
                .then((data: ParsedWarningDetail) => {
                    setWarningDetails(data);
                })
                .catch((error: any) => {
                    setDetailsError(error.message);
                })
                .finally(() => {
                    setLoadingDetails(false);
                });
        }
    }, [selectedWarningId]);

    // Handlers for user interactions (unchanged)
    const handleSelectState = (stateCode: string) => {
        setSelectedState(stateCode);
    };

    const handleSelectWarning = (warningId: string) => {
        setSelectedWarningId(warningId);
    };

    const handleCloseModal = () => {
        setSelectedWarningId(null);
        setWarningDetails(null);
        setDetailsError(null);
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Australian Flood Warnings</h1>
            </header>

            <main className="App-main">
                <StateSelect
                    selectedState={selectedState}
                    onSelectState={handleSelectState}
                />

                <GoogleMapAustralia
                    selectedState={selectedState}
                    onSelectState={handleSelectState}
                />

                {loadingWarnings && <p className="loading-message">Fetching warning IDs...</p>}
                {warningsError && <p className="error-message">Error: {warningsError}</p>}

                {!loadingWarnings && !warningsError && (
                    <WarningList
                        warningIds={warningIds}
                        onSelectWarning={handleSelectWarning}
                    />
                )}

                {selectedWarningId && (loadingDetails || detailsError || warningDetails) && (
                    <WarningDetailModal
                        warningDetails={warningDetails}
                        onClose={handleCloseModal}
                    />
                )}
                {selectedWarningId && loadingDetails && <p className="loading-message modal-loading">Loading details...</p>}
                {selectedWarningId && detailsError && <p className="error-message modal-error">Error fetching details: {detailsError}</p>}
            </main>
        </div>
    );
}

export default App;