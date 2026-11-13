import cityCoordinates from "@/data/city-coords.json";

export interface ApproxCoordinate {
    lat: number;
    lon: number;
}

const countryCodes: Record<string, string> = {
    Argentina: "AR",
    Australia: "AU",
    Austria: "AT",
    Canada: "CA",
    Colombia: "CO",
    Curacao: "CW",
    Denmark: "DK",
    Finland: "FI",
    France: "FR",
    Germany: "DE",
    Greece: "GR",
    Hungary: "HU",
    India: "IN",
    Italy: "IT",
    Japan: "JP",
    Malaysia: "MY",
    Mexico: "MX",
    Netherlands: "NL",
    "New Zealand": "NZ",
    Norway: "NO",
    Panama: "PA",
    Philippines: "PH",
    Poland: "PL",
    Portugal: "PT",
    Romania: "RO",
    Russia: "RU",
    Serbia: "RS",
    Slovenia: "SI",
    Spain: "ES",
    Sweden: "SE",
    Switzerland: "CH",
    "Trinidad and Tobago": "TT",
    UK: "GB",
    USA: "US",
};

export function countryCodeFor(country: string): string | undefined {
    return countryCodes[country];
}

export function normalizeCity(value: string, removeSuffix = true): string {
    let normalized = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z]/g, "");

    if (removeSuffix) {
        for (const suffix of [
            "city",
            "shi",
            "ku",
            "machi",
            "cho",
            "mura",
            "gun",
        ]) {
            if (
                normalized.endsWith(suffix) &&
                normalized.length > suffix.length
            ) {
                normalized = normalized.slice(0, -suffix.length);
                break;
            }
        }
    }

    return normalized.replace(/oh|ou|oo/g, "o").replace(/uu/g, "u");
}

export function cityKeys(value: string): string[] {
    return [...new Set([normalizeCity(value), normalizeCity(value, false)])];
}

export function findApproxCoordinate(
    city: string,
    country: string,
    state: string
): ApproxCoordinate | undefined {
    const countryCode = countryCodes[country];
    if (!countryCode) return undefined;

    const stateKey = normalizeCity(state, false);
    for (const cityKey of cityKeys(city)) {
        const coordinate =
            cityCoordinates[`${countryCode}:${cityKey}:${stateKey}` as keyof typeof cityCoordinates];
        if (coordinate) return coordinate;
    }
    return undefined;
}
