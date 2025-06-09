// src/components/GoogleMapAustralia.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { getWarningsByState } from '../api';

interface GoogleMapAustraliaProps {
    selectedState: string;
    onSelectState: (stateCode: string) => void;
}

const libraries: ("geometry")[] = ['geometry'];

const mapContainerStyle = {
    width: '100%',
    height: '500px',
};

// Define state marker data directly (approximate centers)
const AUSTRALIAN_STATE_MARKERS = [
    { code: 'ACT', name: 'ACT', position: { lat: -35.2809, lng: 149.1300 } }, // Canberra
    { code: 'NSW', name: 'New South Wales', position: { lat: -31.8402, lng: 145.6980 } },
    { code: 'NT', name: 'Northern Territory', position: { lat: -19.4914, lng: 132.5510 } },
    { code: 'QLD', name: 'Queensland', position: { lat: -20.9176, lng: 142.7027 } },
    { code: 'SA', name: 'South Australia', position: { lat: -30.0000, lng: 136.2000 } },
    { code: 'TAS', name: 'Tasmania', position: { lat: -41.6401, lng: 146.3159 } },
    { code: 'VIC', name: 'Victoria', position: { lat: -36.5986, lng: 144.6953 } },
    { code: 'WA', name: 'Western Australia', position: { lat: -25.0000, lng: 121.6000 } },
];

// --- Helper function to generate custom SVG marker icon (CLOUD SHAPE) ---
const createMarkerIcon = (count: number | null, isSelected: boolean, isLoaded: boolean): google.maps.Icon | google.maps.Symbol | undefined => {
    // Return undefined if Google Maps API is not yet loaded, as it needs google.maps.Size/Point
    if (!isLoaded || !window.google || !window.google.maps || !window.google.maps.Size || !window.google.maps.Point) {
        return undefined;
    }

    const markerSize = 60; // Larger size for the cloud icon
    const viewBoxWidth = 100; // Original SVG viewBox width
    const viewBoxHeight = 60; // Original SVG viewBox height

    const displayCount = (count === null) ? '?' : count.toString(); // Display '?' if count is null
    const fontSize = displayCount.length === 1 ? 26 : (displayCount.length === 2 ? 22 : 18); // Adjust font size for larger numbers
    const color = isSelected ? '#0056b3' : '#6A5ACD'; // Dark blue if selected, Slate Blue otherwise
    const textColor = 'white';
    const strokeColor = isSelected ? '#ffd700' : '#483D8B'; // Gold stroke if selected, Dark Slate Blue otherwise
    const strokeWidth = 2;

    // SVG path for a simple cloud shape (derived from a public domain source, simplified)
    const cloudPath = "M74.453,30.342c-2.336-7.818-9.421-13.435-17.765-13.435c-4.471,0-8.679,1.521-12.029,4.195c-1.396-5.83-6.602-10.155-12.825-10.155c-7.391,0-13.385,6.136-13.385,13.708c0,0.528,0.046,1.042,0.134,1.543c-6.225,2.158-10.638,8.232-10.638,15.228c0,9.088,7.702,16.467,17.202,16.467h37.457c9.501,0,17.202-7.379,17.202-16.467C90.355,38.283,83.037,31.428,74.453,30.342z";

    // Adjust text position relative to the 100x60 viewBox center
    const textX = viewBoxWidth / 2 - 5;
    const textY = viewBoxHeight / 2 + 10; // Roughly center vertically for a cloud

    const svgContent = `
        <svg width="${markerSize}" height="${markerSize}" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" xmlns="http://www.w3.org/2000/svg">
            <path d="${cloudPath}" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
            <text x="${textX}" y="${textY}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${textColor}" text-anchor="middle" alignment-baseline="middle">
                ${displayCount}
            </text>
        </svg>
    `;

    // Encode the SVG content as a Data URI
    return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgContent)}`,
        scaledSize: new window.google.maps.Size(markerSize, markerSize), // Scale the icon to desired markerSize
        anchor: new window.google.maps.Point(markerSize / 2, markerSize / 2), // Center the marker on its coordinates
    };
};


function GoogleMapAustralia({ selectedState, onSelectState }: GoogleMapAustraliaProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [activeMarker, setActiveMarker] = useState<string | null>(null);
    const [warningsCount, setWarningsCount] = useState<{ [key: string]: number | null }>(() => {
        const initialCounts: { [key: string]: number | null } = {};
        AUSTRALIAN_STATE_MARKERS.forEach(marker => {
            initialCounts[marker.code] = null; // Initialize all counts to null
        });
        return initialCounts;
    });

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_Maps_API_KEY || '',
        libraries,
    });

    // Effect to fetch warning counts for all states when map is loaded
    useEffect(() => {
        if (isLoaded) {
            AUSTRALIAN_STATE_MARKERS.forEach(async (markerData) => {
                try {
                    const ids = await getWarningsByState(markerData.code);
                    setWarningsCount(prevCounts => ({
                        ...prevCounts,
                        [markerData.code]: ids.length
                    }));
                } catch (error) {
                    console.error(`Error fetching count for ${markerData.code}:`, error);
                    setWarningsCount(prevCounts => ({
                        ...prevCounts,
                        [markerData.code]: 0
                    }));
                }
            });
        }
    }, [isLoaded]);


    const onLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const handleMarkerClick = useCallback((stateCode: string) => {
        console.log('Marker clicked for state:', stateCode);
        onSelectState(stateCode);
        setActiveMarker(stateCode);
    }, [onSelectState]);

    const handleInfoWindowClose = useCallback(() => {
        setActiveMarker(null);
    }, []);

    const center: google.maps.LatLngLiteral = useMemo(() => ({
        lat: -25.2744,
        lng: 133.7751,
    }), []);

    const defaultZoom = 4;

    const mapOptions = useMemo(() => {
        if (!isLoaded || !window.google || !window.google.maps) {
            return {};
        }
        return {
            mapTypeId: window.google.maps.MapTypeId.TERRAIN,
            disableDefaultUI: true, // Simplified UI
            zoomControl: true,
            center: center,
            zoom: defaultZoom,
        };
    }, [isLoaded, center, defaultZoom]);


    if (loadError) {
        return <div className="map-error-message">Error loading Google Maps. Please check your API key and network connection.</div>;
    }

    if (!isLoaded) {
        return <div className="map-loading-message">Loading Google Maps...</div>;
    }

    return (
        <div className="google-map-container">
            <h3>Click a state to view warnings:</h3>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapOptions.center}
                zoom={mapOptions.zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
            >
                {AUSTRALIAN_STATE_MARKERS.map((markerData) => {
                    const count = warningsCount[markerData.code];
                    const isSelected = markerData.code === selectedState;
                    const markerIcon = createMarkerIcon(count, isSelected, isLoaded); 

                    if (!markerIcon) {
                        return null; // Don't render marker if icon creation fails (e.g., API not ready)
                    }

                    return (
                        <MarkerF
                            key={markerData.code}
                            position={markerData.position}
                            onClick={() => handleMarkerClick(markerData.code)}
                            icon={markerIcon} // Use the custom icon
                        >
                            {activeMarker === markerData.code && (
                                <InfoWindowF onCloseClick={handleInfoWindowClose}>
                                    <div style={{ padding: '10px' }}>
                                        <h4>{markerData.name} ({markerData.code})</h4>
                                        <p>Warnings: {count === null ? '...' : count}</p>
                                        <p style={{ marginTop: '5px', fontSize: '0.9em', color: '#0056b3' }}>Click to view details</p>
                                    </div>
                                </InfoWindowF>
                            )}
                        </MarkerF>
                    );
                })}
            </GoogleMap>
        </div>
    );
}

export default GoogleMapAustralia;