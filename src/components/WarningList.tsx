// src/components/WarningList.tsx
import React, { useMemo } from 'react';
import { ParsedWarningDetail } from '../types/api';
import { isValidDateString } from '../utils/commonUtils';

// Define the props for the WarningList component
interface WarningListProps {
    stateCode: string;
    warningIds: string[];
    warningsMap: Map<string, ParsedWarningDetail>;
    onSelectWarning: (warningId: string) => void;
}
function WarningList({ stateCode, warningIds, warningsMap, onSelectWarning }: WarningListProps) {
    // Use useMemo to desc sort the warningIds.
    // This memoization prevents unnecessary re-sorting on every render
    // unless warningIds or warningsMap change.
    const sortedWarningIds = useMemo(() => {
        const idsToSort = [...warningIds];
        idsToSort.sort((a, b) => (a > b ? -1 : 1)); // Default sort to ensure consistent order
        return idsToSort;
    }, [warningIds]); // Dependencies for useMemo

    if (!warningIds || warningIds.length === 0) {
        return <p className="no-warnings-message">No warnings found for this state, or select a state.</p>;
    }

    return (
        <div className="warning-list-container">
            <h2>Current Flood Warning IDs ({warningIds.length}) for {stateCode}</h2> {/* Using warningIds.length */}
            <ul className="warning-list">
                {sortedWarningIds.map((id: string) => ( // Iterate over the IDs
                    <li key={id} className="warning-item" onClick={warningsMap.get(id)?.description ? () => onSelectWarning(id) : undefined}>
                        <h3>Warning ID: {id}</h3> {/* Displaying the ID */}
                        <p className="warning-detail-issued">
                            {warningsMap.get(id)
                                ? `Issued:${isValidDateString(warningsMap.get(id)!.issuedAt) ? new Date(warningsMap.get(id)!.issuedAt).toLocaleString() : '-'}`
                                : 'loading...'}
                        </p>
                        <p className="warning-detail-headline">
                            {warningsMap.get(id)?.headline}
                        </p>
                        <p className="view-details-prompt">
                            {warningsMap.get(id)?.description ? '(Click to view details)' : ''}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default WarningList;