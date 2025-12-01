export function analogOrDigital(anaordig: string): string {
    if (anaordig.toLowerCase().includes("analog")) {
        return "Analog";
    } else if (anaordig.toLowerCase().includes("digital")) {
        return "Digital";
    } else {
        return "Unknown";
    }
}

export function isThisAnalog(anaordig: string): boolean {
    return anaordig.toLowerCase().includes("analog");
}

export function isThisDigital(anaordig: string): boolean {
    return anaordig.toLowerCase().includes("digital");
}
