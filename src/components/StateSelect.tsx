// src/components/StateSelect.tsx
import React from 'react';
import { AustralianState } from '../types/api';

interface StateSelectProps {
    selectedState: string;
    onSelectState: (stateCode: string) => void;
}

const australianStates: AustralianState[] = [
    { code: 'ACT', name: 'Australian Capital Territory' },
    { code: 'NSW', name: 'New South Wales' },
    { code: 'NT', name: 'Northern Territory' },
    { code: 'QLD', name: 'Queensland' },
    { code: 'SA', name: 'South Australia' },
    { code: 'TAS', name: 'Tasmania' },
    { code: 'VIC', name: 'Victoria' },
    { code: 'WA', name: 'Western Australia' },
];

function StateSelect({ selectedState, onSelectState }: StateSelectProps) {
    return (
        <div className="state-select-container">
            <label htmlFor="state-select">Select an Australian State:</label>
            <select
                id="state-select"
                value={selectedState}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSelectState(e.target.value)}
                className="state-dropdown"
            >
                <option value="">-- Please choose a state --</option>
                {australianStates.map((state) => (
                    <option key={state.code} value={state.code}>
                        {state.name} ({state.code})
                    </option>
                ))}
            </select>
        </div>
    );
}

export default StateSelect;