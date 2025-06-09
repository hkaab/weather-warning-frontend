// src/utils/locationUtils.ts

interface StateBounds {
    code: string;
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
}

// Approximate bounding box coordinates for Australian states
// These are rough estimates and may not be perfectly accurate, especially near borders.
const AUSTRALIAN_STATE_BOUNDS: StateBounds[] = [
    { code: 'NSW', minLat: -37.5, maxLat: -28.0, minLng: 140.9, maxLng: 154.0 },
    { code: 'VIC', minLat: -39.2, maxLat: -34.0, minLng: 140.9, maxLng: 150.0 },
    { code: 'QLD', minLat: -29.0, maxLat: -9.0, minLng: 138.0, maxLng: 154.0 },
    { code: 'SA',  minLat: -38.0, maxLat: -26.0, minLng: 129.0, maxLng: 141.0 },
    { code: 'WA',  minLat: -35.2, maxLat: -13.0, minLng: 113.0, maxLng: 129.0 },
    { code: 'TAS', minLat: -44.0, maxLat: -39.0, minLng: 143.5, maxLng: 148.5 },
    { code: 'NT',  minLat: -26.0, maxLat: -10.0, minLng: 129.0, maxLng: 138.0 },
    { code: 'ACT', minLat: -35.5, maxLat: -35.1, minLng: 148.8, maxLng: 149.2 } // ACT is tiny, within NSW, might be difficult to isolate
];

/**
 * Determines the Australian state code from given latitude and longitude coordinates.
 * Uses approximate bounding boxes.
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns The state code (e.g., 'NSW') or null if not found.
 */
export function getStateFromCoordinates(lat: number, lng: number): string | null {
    // Prioritize smaller regions like ACT first if they overlap with larger ones
    const sortedBounds = [...AUSTRALIAN_STATE_BOUNDS].sort((a, b) => {
        const areaA = (a.maxLat - a.minLat) * (a.maxLng - a.minLng);
        const areaB = (b.maxLat - b.minLat) * (b.maxLng - b.minLng);
        return areaA - areaB; // Sort by smallest area first
    });

    for (const state of sortedBounds) {
        if (lat >= state.minLat && lat <= state.maxLat &&
            lng >= state.minLng && lng <= state.maxLng) {
            return state.code;
        }
    }
    return null;
}