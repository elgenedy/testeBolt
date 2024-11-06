export interface SavedLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    lastNotification?: Date;
}