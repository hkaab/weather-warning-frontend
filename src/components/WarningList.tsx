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
function WarningList({ stateCode,warningIds,warningsMap, onSelectWarning }: WarningListProps) { 
    // Use useMemo to sort the warningIds based on their issuedAt date.
    // This memoization prevents unnecessary re-sorting on every render
    // unless warningIds or warningsMap change.
    const sortedWarningIds = useMemo(() => {
        // Create a shallow copy of warningIds to avoid mutating the prop directly.
        const idsToSort = [...warningIds];

        // Sort the warning IDs based on the 'issuedAt' property from the warningsMap.
        idsToSort.sort((idA, idB) => {
        const warningA = warningsMap.get(idA);
        const warningB = warningsMap.get(idB);

        // Default to a very old date or 0 if issuedAt is not valid or missing
        // to ensure invalid dates are pushed to the end or handled predictably.
        const dateA = (warningA && isValidDateString(warningA.issuedAt))
            ? new Date(warningA.issuedAt).getTime()
            : 0; // Use 0 (epoch) for invalid/missing dates

        const dateB = (warningB && isValidDateString(warningB.issuedAt))
            ? new Date(warningB.issuedAt).getTime()
            : 0; // Use 0 (epoch) for invalid/missing dates

        // Sort in descending order (latest date first).
        // For ascending, it would be dateA - dateB.
        return dateB - dateA;
        });

        return idsToSort;
    }, [warningIds, warningsMap]); // Dependencies for useMemo

    if (!warningIds || warningIds.length === 0) {
        return <p className="no-warnings-message">No warnings found for this state, or select a state.</p>;
    }

    return (
        <div className="warning-list-container">
            <h2>Current Flood Warning IDs ({warningIds.length}) for {stateCode}</h2> {/* Using warningIds.length */}
            <ul className="warning-list">
                {sortedWarningIds.map((id: string) => ( // Iterate over the IDs
                    <li key={id} className="warning-item" onClick={warningsMap.get(id)?.description?() => onSelectWarning(id): undefined}>
                        <h3>Warning ID: {id}</h3> {/* Displaying the ID */}
                        <p className="warning-detail-issued">
                            {warningsMap.get(id)
                                ? `Issued:${isValidDateString(warningsMap.get(id)!.issuedAt)? new Date(warningsMap.get(id)!.issuedAt).toLocaleString(): '-'}`
                                : 'loading...'}
                        </p>
                        <p className="warning-detail-headline">
                            {warningsMap.get(id)?.headline}
                        </p> 
                        <p className="view-details-prompt">
                            {warningsMap.get(id)?.description?'(Click to view details)':''}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default WarningList;