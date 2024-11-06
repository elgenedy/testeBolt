import { Observable } from '@nativescript/core'
import { Geolocation, getCurrentLocation, Location } from '@nativescript/geolocation'
import { LocalNotifications } from '@nativescript/local-notifications'
import { SavedLocation } from '../models/location.model'
import { ApplicationSettings } from '@nativescript/core'

export class LocationService extends Observable {
    private static instance: LocationService
    private locations: SavedLocation[] = []
    private readonly LOCATIONS_KEY = 'saved_locations'
    private watchId: number

    private constructor() {
        super()
        this.loadLocations()
        this.startLocationWatch()
    }

    static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService()
        }
        return LocationService.instance
    }

    private loadLocations() {
        const savedLocations = ApplicationSettings.getString(this.LOCATIONS_KEY)
        if (savedLocations) {
            this.locations = JSON.parse(savedLocations)
        }
    }

    private saveLocations() {
        ApplicationSettings.setString(this.LOCATIONS_KEY, JSON.stringify(this.locations))
        this.notifyPropertyChange('locations', this.locations)
    }

    async addLocation(name: string): Promise<void> {
        try {
            const location = await getCurrentLocation({
                desiredAccuracy: 3,
                maximumAge: 5000,
                timeout: 20000
            })

            const newLocation: SavedLocation = {
                id: Date.now().toString(),
                name,
                latitude: location.latitude,
                longitude: location.longitude,
                radius: 50
            }

            this.locations.push(newLocation)
            this.saveLocations()
        } catch (error) {
            console.error('Erro ao obter localização:', error)
            throw error
        }
    }

    updateLocation(location: SavedLocation) {
        const index = this.locations.findIndex(l => l.id === location.id)
        if (index !== -1) {
            this.locations[index] = location
            this.saveLocations()
        }
    }

    removeLocation(id: string) {
        this.locations = this.locations.filter(l => l.id !== id)
        this.saveLocations()
    }

    getLocations(): SavedLocation[] {
        return [...this.locations]
    }

    private startLocationWatch() {
        this.watchId = Geolocation.watchLocation(
            location => this.checkProximity(location),
            error => console.error('Erro no monitoramento:', error),
            {
                desiredAccuracy: 3,
                updateDistance: 10,
                minimumUpdateTime: 1000
            }
        )
    }

    private checkProximity(currentLocation: Location) {
        const now = new Date()
        this.locations.forEach(savedLocation => {
            const distance = this.calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                savedLocation.latitude,
                savedLocation.longitude
            )

            const lastNotification = savedLocation.lastNotification 
                ? new Date(savedLocation.lastNotification) 
                : null

            const tenMinutesAgo = new Date(now.getTime() - 10 * 60000)

            if (distance <= savedLocation.radius && 
                (!lastNotification || lastNotification < tenMinutesAgo)) {
                
                this.sendNotification(savedLocation)
                savedLocation.lastNotification = now
                this.saveLocations()
            }
        })
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371000 // Raio da Terra em metros
        const φ1 = lat1 * Math.PI/180
        const φ2 = lat2 * Math.PI/180
        const Δφ = (lat2-lat1) * Math.PI/180
        const Δλ = (lon2-lon1) * Math.PI/180

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

        return R * c // em metros
    }

    private sendNotification(location: SavedLocation) {
        LocalNotifications.schedule([{
            id: parseInt(location.id),
            title: 'Localização Detectada',
            body: `Você está próximo a: ${location.name}`,
            icon: 'res://location',
            sound: true
        }])
    }

    stopLocationWatch() {
        if (this.watchId) {
            Geolocation.clearWatch(this.watchId)
        }
    }
}