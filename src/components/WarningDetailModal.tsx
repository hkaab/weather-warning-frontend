// src/components/WarningDetailModal.tsx
import React from 'react';
import { WarningDetail } from '../types/api';

interface WarningDetailModalProps {
    warningDetails: WarningDetail | null;
    onClose: () => void;
}

function WarningDetailModal({ warningDetails, onClose }: WarningDetailModalProps) {
    if (!warningDetails) {
        return null; // Don't render if no details are provided
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-button" onClick={onClose}>×</button>
                <h2>Warning Details: {warningDetails.id}</h2>
                <h3 className="warning-detail-headline">{warningDetails.headline}</h3>
                <p className="warning-detail-issued">Issued: {new Date(warningDetails.issuedAt).toLocaleString()}</p>
                <div className="warning-detail-description">
                    <h4>Description:</h4>
                    <p>{warningDetails.description}</p>
                </div>
            </div>
        </div>
    );
}

export default WarningDetailModal;