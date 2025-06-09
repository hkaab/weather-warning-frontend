// src/App.tsx
import React, { useState, useEffect } from 'react';
import StateSelect from './components/StateSelect';
import GoogleMapAustralia from './components/GoogleMapAustralia';
import WarningList from './components/WarningList';
import WarningDetailModal from './components/WarningDetailModal';
import { getWarningsByState, getWarningDetails } from './api';
import './App.css';
import { ParsedWarningDetail } from './types/api'; // Using ParsedWarningDetail for modal content

function App() {
    // State for overall warning list (only IDs)
    const [selectedState, setSelectedState] = useState<string>('');
    const [warningIds, setWarningIds] = useState<string[]>([]); // Stores only warning IDs
    const [loadingWarnings, setLoadingWarnings] = useState<boolean>(false); // Loading state for fetching IDs
    const [warningsError, setWarningsError] = useState<string | null>(null); // Error for fetching IDs

    // State for selected warning details (for the modal)
    const [selectedWarningId, setSelectedWarningId] = useState<string | null>(null);
    const [warningDetails, setWarningDetails] = useState<ParsedWarningDetail | null>(null); // Stores parsed details for modal
    const [loadingDetails, setLoadingDetails] = useState<boolean>(false); // Loading state for modal details
    const [detailsError, setDetailsError] = useState<string | null>(null); // Error for modal details

    // Effect to fetch WARNING IDs when selectedState changes
    useEffect(() => {
        if (selectedState) {
            setLoadingWarnings(true);
            setWarningsError(null);
            setWarningIds([]); // Clear previous IDs
            setSelectedWarningId(null); // Clear selected warning for modal
            setWarningDetails(null); // Clear modal details

            getWarningsByState(selectedState)
                .then((ids: string[]) => {
                    setWarningIds(ids); // Set the array of IDs
                })
                .catch((error: any) => {
                    setWarningsError(error.message);
                })
                .finally(() => {
                    setLoadingWarnings(false); // Stop loading regardless of success/failure
                });
        } else {
            // If no state is selected, clear everything related to warnings
            setWarningIds([]);
            setWarningsError(null);
            setLoadingWarnings(false);
        }
    }, [selectedState]);

    // Effect to fetch warning details when selectedWarningId changes (for modal)
    // This is the "on-demand" fetching part.
    useEffect(() => {
        if (selectedWarningId) {
            setLoadingDetails(true);
            setDetailsError(null);
            setWarningDetails(null); // Clear previous details

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

    // Handlers for user interactions
    const handleSelectState = (stateCode: string) => {
        setSelectedState(stateCode);
    };

    const handleSelectWarning = (warningId: string) => {
        setSelectedWarningId(warningId); // This triggers the useEffect for modal details
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

                {/* Loading and Error messages for the main warning list */}
                {loadingWarnings && <p className="loading-message">Fetching warning IDs...</p>}
                {warningsError && <p className="error-message">Error: {warningsError}</p>}

                {/* Display WarningList only if not loading and no errors */}
                {!loadingWarnings && !warningsError && (
                    <WarningList
                        warningIds={warningIds} // Pass just the IDs to WarningList
                        onSelectWarning={handleSelectWarning}
                    />
                )}

                {/* Modal for Warning Details */}
                {/* Render modal only if a warning ID is selected and either loading, error, or details are available */}
                {selectedWarningId && (loadingDetails || detailsError || warningDetails) && (
                    <WarningDetailModal
                        warningDetails={warningDetails} // Pass parsed details to modal
                        onClose={handleCloseModal}
                    />
                )}
                {/* Specific loading/error messages for the modal */}
                {selectedWarningId && loadingDetails && <p className="loading-message modal-loading">Loading details...</p>}
                {selectedWarningId && detailsError && <p className="error-message modal-error">Error fetching details: {detailsError}</p>}
            </main>
        </div>
    );
}

export default App;