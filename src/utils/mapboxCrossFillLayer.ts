import { Map as MapboxMap, GeoJSONSource } from "mapbox-gl";
import * as turf from "@turf/turf";
import {
    Feature,
    FeatureCollection,
    Polygon,
    MultiPolygon,
    GeoJsonProperties
} from "geojson";

type PolygonFeature = Feature<Polygon | MultiPolygon, GeoJsonProperties>;

type Config = {
    polygonSourceId: string;           // ❗ required
    polygonLayerId?: string;           // optional, used for visibility sync

    crossLayerId?: string;
    crossSourceId?: string;

    filterFn?: (feature: PolygonFeature) => boolean; // no default

    spacing?: number;
    units?: turf.Units;

    color?: string;
    size?: number;
    rotate?: number;

    visible?: boolean;
};

type CrossLayerController = {
    id: string;
    sourceId: string;
    update: () => void;
    setVisibility: (visible: boolean) => void;
    remove: () => void;
};

export function mapboxCrossFillLayer(
    map: MapboxMap,
    config: Config
): CrossLayerController {
    if (!map) throw new Error("Map instance is required");
    if (!config.polygonSourceId) {
        throw new Error("polygonSourceId is required");
    }

    const {
        polygonSourceId,
        polygonLayerId,

        crossLayerId = `cross-layer-${Date.now()}`,
        crossSourceId = `cross-source-${Date.now()}`,

        filterFn,

        spacing = 500,
        units = "meters",

        color = "#ff0000",
        size = 0.8,
        rotate = 45,

        visible = true
    } = config;

    // Create cross source
    if (!map.getSource(crossSourceId)) {
        map.addSource(crossSourceId, {
            type: "geojson",
            data: turf.featureCollection([])
        });
    }

    const ensureLayerOrder = ( map: mapboxgl.Map,
                               crossLayerId: string,
                               polygonLayerId?: string) =>
    {
        if (!map.getLayer(crossLayerId)) return;

        // If polygon layer exists → place cross layer right above it
        if (polygonLayerId && map.getLayer(polygonLayerId)) {
            map.moveLayer(crossLayerId); // move to top first

            // then move it just above polygon layer
            const layers = map.getStyle().layers;
            if (!layers) return;

            const polygonIndex = layers.findIndex(l => l.id === polygonLayerId);

            if (polygonIndex !== -1 && polygonIndex < layers.length - 1) {
                const nextLayer = layers[polygonIndex + 1];
                if (nextLayer && nextLayer.id !== crossLayerId) {
                    map.moveLayer(crossLayerId, nextLayer.id);
                }
            }
        } else {
            // fallback → always on top
            map.moveLayer(crossLayerId);
        }
    }

    // Add cross layer
    if (!map.getLayer(crossLayerId)) {
        map.addLayer({
            id: crossLayerId,
            type: "symbol",
            source: crossSourceId,
            layout: {
                "icon-image": "marker-15",
                "icon-size": size,
                "icon-rotate": rotate,
                "icon-allow-overlap": true,
                "icon-ignore-placement": true,
                visibility: visible ? "visible" : "none"
            },
            paint: {
                "icon-color": color
            }
        });
        ensureLayerOrder(map, crossLayerId, polygonLayerId);
    }



    // Generate crosses
    const regenerate = () => {
        const source = map.getSource(polygonSourceId) as GeoJSONSource | undefined;
        if (!source) return;

        const rawData: any =
            (source as any)._data || (source as any)._options?.data;

        if (!rawData || !rawData.features) return;

        let features: PolygonFeature[] = rawData.features;

        if (filterFn) {
            features = features.filter(filterFn);
        }

        const allPoints: turf.helpers.Feature<turf.helpers.Point>[] = [];

        features.forEach((feature) => {
            const type = feature.geometry?.type;
            if (type !== "Polygon" && type !== "MultiPolygon") return;

            const bbox = turf.bbox(feature);
            const grid = turf.pointGrid(bbox, spacing, { units });

            const inside = turf.pointsWithinPolygon(grid, feature);

            allPoints.push(...inside.features);
        });

        const result: FeatureCollection = turf.featureCollection(allPoints);

        const crossSource = map.getSource(
            crossSourceId
        ) as GeoJSONSource | undefined;

        crossSource?.setData(result);

        ensureLayerOrder(map, crossLayerId, polygonLayerId);
    };

    // Sync visibility with polygon layer
    const syncVisibility = () => {
        if (!polygonLayerId || !map.getLayer(polygonLayerId)) return;

        const visibility = map.getLayoutProperty(
            polygonLayerId,
            "visibility"
        ) as string;

        const targetVisibility =
            visibility === "none" ? "none" : visible ? "visible" : "none";

        if (map.getLayer(crossLayerId)) {
            map.setLayoutProperty(crossLayerId, "visibility", targetVisibility);
        }
    };

    //  Initial run
    const init = () => {
        regenerate();
        syncVisibility();
    };

    if (map.isStyleLoaded()) {
        init();
    } else {
        map.once("load", init);
    }

    // Update on move
    map.on("moveend", regenerate);

    //  Listen for style/visibility changes
    map.on("idle", syncVisibility);

    return {
        id: crossLayerId,
        sourceId: crossSourceId,

        update: () => {
            regenerate();
            syncVisibility();
        },

        setVisibility: (show: boolean) => {
            if (map.getLayer(crossLayerId)) {
                map.setLayoutProperty(
                    crossLayerId,
                    "visibility",
                    show ? "visible" : "none"
                );
            }
        },

        remove: () => {
            if (map.getLayer(crossLayerId)) {
                map.removeLayer(crossLayerId);
            }
            if (map.getSource(crossSourceId)) {
                map.removeSource(crossSourceId);
            }

            map.off("moveend", regenerate);
            map.off("idle", syncVisibility);
        }
    };
}