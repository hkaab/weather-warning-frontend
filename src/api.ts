// src/api.ts
import { ParsedWarningDetail, ApiResponseWarningsObject, RawWarningApiResponse } from './types/api';

const API_BASE_URL: string = "http://flood-warning-api-test.us-east-1.elasticbeanstalk.com";

export async function getWarningsByState(stateCode: string): Promise<string[]> {
    try {
        const response = await fetch(`${API_BASE_URL}?state=${stateCode}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data: string[] | ApiResponseWarningsObject = await response.json();

        if (Array.isArray(data)) {
            return data;
        } else if (typeof data === 'object' && data !== null) {
            return Object.keys(data);
        }
        
        return [];
        
    } catch (error: any) {
        console.error("Error fetching warning IDs by state:", error);
        throw error;
    }
}

/**
 * Fetches detailed information for a specific flood warning and parses its content.
 * @param {string} warningId - The unique ID of the warning (e.g., 'IDQ10090').
 * @returns {Promise<ParsedWarningDetail>} A promise that resolves to the parsed warning object with derived headline and description.
 */
export async function getWarningDetails(warningId: string): Promise<ParsedWarningDetail> {
    try {
        // Note: The API endpoint for detail is /warning/ (singular), not /warnings/
        const response = await fetch(`${API_BASE_URL}/warning/${warningId}`); 
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const rawData: RawWarningApiResponse = await response.json();

        let headline: string = "No Headline Available";
        let description: string = "No description available.";
        
        const lines = rawData.text.split('\n'); // Split the text into lines

        // --- Heuristic Parsing for Headline and Description ---
        // This logic is based on the example response you provided (IDQ10090)
        // Adjust these line indices if your actual warning formats vary.
        if (lines.length > 4 && lines[4].trim().length > 0) {
            headline = lines[4].trim(); // Example: "Updated South East Coast District Forecast"

            // Find the start of the main description content
            let descStartIndex = -1;
            for (let i = 5; i < lines.length; i++) { // Start checking from the line after the potential headline
                const trimmedLine = lines[i].trim();
                // Look for the first non-empty line that doesn't look like a date/time stamp or forecast header
                if (trimmedLine.length > 0 && 
                    !trimmedLine.match(/^\d{1,2}:\d{2}(am|pm)? \w+ on \w+ \d{1,2} \w+ \d{4}/i) && // Not an issued date line
                    !trimmedLine.startsWith("Forecast for") && // Not a forecast header
                    !trimmedLine.startsWith("Fire Danger:") && // Not a Fire Danger line
                    !trimmedLine.startsWith("Sun protection")) // Not a Sun Protection line
                {
                    descStartIndex = i;
                    break;
                }
            }

            if (descStartIndex !== -1) {
                description = lines.slice(descStartIndex).join('\n').trim();
            } else {
                description = lines.slice(5).join('\n').trim(); // Fallback: just take from line 5 onwards
            }

        } else if (lines.length > 0) {
            headline = lines[0].trim(); // Fallback to the very first line as headline
            description = lines.slice(1).join('\n').trim();
        }

        // --- Create the ParsedWarningDetail object ---
        const parsedDetail: ParsedWarningDetail = {
            id: warningId, // ID from the parameter
            headline: headline,
            description: description,
            issuedAt: rawData.issueTimeUtc, // Map issueTimeUtc to issuedAt
            fullText: rawData.text, // Keep the full raw text as well
            // Optionally include other raw properties if you added them to ParsedWarningDetail interface
            // productType: rawData.productType,
            // service: rawData.service,
            // expiryTime: rawData.expiryTime,
        };
        
        return parsedDetail;

    } catch (error: any) {
        console.error(`Error fetching or parsing details for warning ID ${warningId}:`, error);
        throw error;
    }
}