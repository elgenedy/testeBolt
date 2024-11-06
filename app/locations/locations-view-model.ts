import { Observable } from '@nativescript/core'
import { LocationService } from '../services/location.service'
import { SavedLocation } from '../models/location.model'
import { prompt } from '@nativescript/core/ui/dialogs'

export class LocationsViewModel extends Observable {
    private locationService: LocationService
    private _locations: SavedLocation[] = []
    private _isLoading = false

    constructor() {
        super()
        this.locationService = LocationService.getInstance()
        this.loadLocations()
    }

    get locations(): SavedLocation[] {
        return this._locations
    }

    get isLoading(): boolean {
        return this._isLoading
    }

    set isLoading(value: boolean) {
        if (this._isLoading !== value) {
            this._isLoading = value
            this.notifyPropertyChange('isLoading', value)
        }
    }

    async onAddLocation() {
        try {
            const result = await prompt({
                title: 'Novo Local',
                message: 'Digite um nome para este local:',
                okButtonText: 'Salvar',
                cancelButtonText: 'Cancelar',
                inputType: 'text'
            })

            if (result.result && result.text) {
                this.isLoading = true
                await this.locationService.addLocation(result.text)
                this.loadLocations()
            }
        } catch (error) {
            console.error('Erro ao adicionar localização:', error)
            // Aqui você pode adicionar um alerta de erro
        } finally {
            this.isLoading = false
        }
    }

    loadLocations() {
        this._locations = this.locationService.getLocations()
        this.notifyPropertyChange('locations', this._locations)
    }
}