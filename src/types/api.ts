// src/types/api.ts
export interface WarningSummary {
    id: string;
    headline: string;
    description: string; // Assuming description is part of the summary for list display
    issuedAt: string; // ISO 8601 string
}

export interface WarningDetail extends WarningSummary {
    // Add any further fields that are ONLY in the detail view if they exist
    // e.g., 'geospatialData'?: any;
    // 'impacts'?: string[];
}

// The raw structure received from /warning/<ID>
export interface RawWarningApiResponse {
    productType: string;
    service: string;
    issueTimeUtc: string; // The timestamp
    expiryTime: string; // The time when the warning expires
    text: string; // The full human-readable warning content, including headline and description
}

// What our frontend component will actually use after parsing/transformation
export interface ParsedWarningDetail {
    id: string; // Comes from the URL parameter
    headline: string; // Derived by parsing 'text' field
    description: string; // Derived by parsing 'text' field
    issuedAt: string; // Mapped from 'issueTimeUtc'
    fullText: string; // The complete raw text content (useful for debugging or full display)
    // Optional: Include other raw properties if you want them in the parsed object
    // productType?: string;
    // service?: string;
    // expiryTime?: string;
}

export interface AustralianState {
    code: string;
    name: string;
}

// Used internally by api.ts for the list endpoint (if it returns an object)
export interface ApiResponseWarningsObject {
    [warningId: string]: any;
}