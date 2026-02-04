export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    if (!address) return null;

    try {
        // Using OpenStreetMap Nominatim API (Free, requires User-Agent)
        const query = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'AppMontadores/1.0 (contact@marcosincoluz.com)' // Required by Nominatim policy
            }
        });

        if (!response.ok) {
            console.error('Geocoding error:', response.statusText);
            return null;
        }

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding exception:', error);
        return null;
    }
}
