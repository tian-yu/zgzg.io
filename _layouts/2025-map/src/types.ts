export interface Story {
    id: string;
    name: string;
    items: string[];
}

export interface MapItem {
    id: string;
    name: string;
    description?: string;
    description_file?: string;
    type: string;
    coordinates: [number, number];
}

export interface Row {
    id: string;
    name: string;
    items: string[];
}