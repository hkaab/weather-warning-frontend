// src/components/WarningList.tsx
import React from 'react';
// No longer importing WarningSummary here directly for the list, as it receives string[]
// import { WarningSummary } from '../types/api'; // Removed as it's not directly used for the prop type anymore

interface WarningListProps {
    warningIds: string[]; // FIX: Prop name changed from 'warnings' to 'warningIds'
    onSelectWarning: (warningId: string) => void;
}

function WarningList({ warningIds, onSelectWarning }: WarningListProps) { // FIX: Destructure 'warningIds' here
    if (!warningIds || warningIds.length === 0) {
        return <p className="no-warnings-message">No warnings found for this state, or select a state.</p>;
    }

    return (
        <div className="warning-list-container">
            <h2>Current Flood Warning IDs ({warningIds.length})</h2> {/* Using warningIds.length */}
            <p className="list-instruction">Click an ID to view details:</p>
            <ul className="warning-list">
                {warningIds.map((id: string) => ( // Iterate over the IDs
                    <li key={id} className="warning-item" onClick={() => onSelectWarning(id)}>
                        <h3>Warning ID: {id}</h3> {/* Displaying the ID */}
                        <p className="view-details-prompt">(Click to view details)</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default WarningList;