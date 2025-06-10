// src/components/WarningList.tsx
import React from 'react';
import { ParsedWarningDetail } from '../types/api';

// Define the props for the WarningList component
interface WarningListProps {
    stateCode: string;
    warningIds: string[];
    warningsMap: Map<string, ParsedWarningDetail>;
    onSelectWarning: (warningId: string) => void;
}
function WarningList({ stateCode,warningIds,warningsMap, onSelectWarning }: WarningListProps) { 
    if (!warningIds || warningIds.length === 0) {
        return <p className="no-warnings-message">No warnings found for this state, or select a state.</p>;
    }

    return (
        <div className="warning-list-container">
            <h2>Current Flood Warning IDs ({warningIds.length}) for {stateCode}</h2> {/* Using warningIds.length */}
            <ul className="warning-list">
                {warningIds.map((id: string) => ( // Iterate over the IDs
                    <li key={id} className="warning-item" onClick={() => onSelectWarning(id)}>
                        <h3>Warning ID: {id}</h3> {/* Displaying the ID */}
                        <p className="warning-detail-issued">
                            Issued: {warningsMap.get(id)
                                ? new Date(warningsMap.get(id)!.issuedAt).toLocaleString()
                                : 'loading...'}
                        </p>
                        <p className="warning-detail-headline">
                            {warningsMap.get(id)?.headline}
                        </p> 
                        {warningsMap.get(id)?.description && (
                          <p className="view-details-prompt">(Click to view details)</p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default WarningList;