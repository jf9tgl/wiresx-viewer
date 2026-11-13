import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import {
    normalizeCity,
    countryCodeFor,
    cityKeys,
} from "../src/utils/cityCoordinates";

const require = createRequire(import.meta.url);
const cities = require("all-the-cities") as City[];

const SOURCE_URL =
    "https://www.yaesu.com/jp/wires-x/id/active_node.php";
const WAYBACK_URL =
    "https://web.archive.org/web/20991231235959id_/" + SOURCE_URL;

interface City {
    name: string;
    country: string;
    adminCode: string;
    population: number;
    loc: { coordinates: [number, number] };
    muni?: string;
}

interface Node {
    city: string;
    state: string;
    country: string;
    lat: string;
    lon: string;
}

interface CityCoordinate {
    lat: number;
    lon: number;
}

function parseNodes(html: string): Node[] {
    const nodes: Node[] = [];
    const regex =
        /\{id:"[^"]*",\s*dtmf_id:"[^"]*",\s*call_sign:"[^"]*",\s*ana_dig:"[^"]*",\s*city:"([^"]*)",\s*state:"([^"]*)",\s*country:"([^"]*)",\s*freq:"[^"]*",\s*sql:"[^"]*",\s*lat:"([^"]*)",\s*lon:"([^"]*)",\s*comment:"[^"]*"\s*\}/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        nodes.push({
            city: match[1],
            state: match[2],
            country: match[3],
            lat: match[4],
            lon: match[5],
        });
    }
    return nodes;
}

async function fetchNodes(): Promise<Node[]> {
    for (const url of [SOURCE_URL, WAYBACK_URL]) {
        try {
            const response = await fetch(url, {
                signal: AbortSignal.timeout(30000),
            });
            if (!response.ok) {
                console.error(`取得失敗: ${url} (${response.status})`);
                continue;
            }
            const nodes = parseNodes(await response.text());
            if (nodes.length > 0) return nodes;
            console.error(`ノードデータが空です: ${url}`);
        } catch (error) {
            console.error(`取得エラー: ${url}`, error);
        }
    }
    throw new Error("Unable to fetch node data from YAESU or Wayback");
}

function stateMatches(state: string, adminCode: string): boolean {
    const stateCodes: Record<string, string> = {
        Alabama: "AL",
        Alaska: "AK",
        Arizona: "AZ",
        Arkansas: "AR",
        California: "CA",
        Colorado: "CO",
        Connecticut: "CT",
        Florida: "FL",
        Georgia: "GA",
        Hawaii: "HI",
        Idaho: "ID",
        Illinois: "IL",
        Indiana: "IN",
        Iowa: "IA",
        Kansas: "KS",
        Kentucky: "KY",
        Louisiana: "LA",
        Maine: "ME",
        Maryland: "MD",
        Massachusetts: "MA",
        Michigan: "MI",
        Minnesota: "MN",
        Mississippi: "MS",
        Missouri: "MO",
        Montana: "MT",
        Nebraska: "NE",
        Nevada: "NV",
        "New Jersey": "NJ",
        "New Mexico": "NM",
        "New York": "NY",
        "North Carolina": "NC",
        "North Dakota": "ND",
        Ohio: "OH",
        Oklahoma: "OK",
        Oregon: "OR",
        Pennsylvania: "PA",
        "Rhode Island": "RI",
        "South Carolina": "SC",
        "South Dakota": "SD",
        Tennessee: "TN",
        Texas: "TX",
        Utah: "UT",
        Vermont: "VT",
        Virginia: "VA",
        Washington: "WA",
        "West Virginia": "WV",
        Wisconsin: "WI",
        Wyoming: "WY",
    };
    return stateCodes[state] === adminCode;
}

function rounded(value: number): number {
    return Math.round(value * 100) / 100;
}

const nodes = (await fetchNodes()).filter((node) => !node.lat && !node.lon);
const output: Record<string, CityCoordinate> = {};
const countryStats = new Map<
    string,
    { matched: number; unmatched: number; ambiguous: number }
>();
const unmatched = new Map<string, number>();

for (const node of nodes) {
    const stats = countryStats.get(node.country) ?? {
        matched: 0,
        unmatched: 0,
        ambiguous: 0,
    };
    const countryCode = countryCodeFor(node.country);
    if (!countryCode) {
        stats.unmatched++;
        countryStats.set(node.country, stats);
        unmatched.set(`${node.city}\t${node.country}`, (unmatched.get(`${node.city}\t${node.country}`) ?? 0) + 1);
        continue;
    }

    const candidates = cities.filter(
        (city) =>
            city.country === countryCode &&
            cityKeys(node.city).some((key) => cityKeys(city.name).includes(key))
    );
    const stateCandidates = candidates.filter((city) =>
        stateMatches(node.state, city.adminCode)
    );
    const selectedCandidates =
        stateCandidates.length > 0 ? stateCandidates : candidates;
    const selected = [...selectedCandidates].sort(
        (a, b) => b.population - a.population
    )[0];

    if (!selected) {
        stats.unmatched++;
        unmatched.set(`${node.city}\t${node.country}`, (unmatched.get(`${node.city}\t${node.country}`) ?? 0) + 1);
    } else {
        stats.matched++;
        if (selectedCandidates.length > 1) {
            stats.ambiguous++;
            console.log(
                `曖昧一致: ${node.city}, ${node.country} -> ${selected.name} (${selected.adminCode}, ${selected.population})`
            );
        }
        for (const key of cityKeys(node.city)) {
            output[`${countryCode}:${key}:${normalizeCity(node.state, false)}`] = {
                lat: rounded(selected.loc.coordinates[1]),
                lon: rounded(selected.loc.coordinates[0]),
            };
        }
    }
    countryStats.set(node.country, stats);
}

await mkdir("src/data", { recursive: true });
await writeFile(
    "src/data/city-coords.json",
    JSON.stringify(output, null, 2) + "\n"
);

console.log("\n一致率:");
for (const [country, stats] of [...countryStats.entries()].sort()) {
    console.log(
        `${country}: 一致 ${stats.matched}, 未一致 ${stats.unmatched}, 曖昧一致 ${stats.ambiguous}`
    );
}
console.log("\n未一致 上位20件:");
for (const [key, count] of [...unmatched.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)) {
    const [city, country] = key.split("\t");
    console.log(`${count}\t${city}\t${country}`);
}
console.log(`\n生成件数: ${Object.keys(output).length}`);
