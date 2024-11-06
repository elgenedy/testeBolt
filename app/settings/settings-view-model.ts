import { Observable } from '@nativescript/core'
import { LocationService } from '../services/location.service'
import { SavedLocation } from '../models/location.model'
import { prompt, confirm } from '@nativescript/core/ui/dialogs'

export class SettingsViewModel extends Observable {
    private locationService: LocationService
    private _locations: SavedLocation[] = []

    constructor() {
        super()
        this.locationService = LocationService.getInstance()
        this.loadLocations()
    }

    get locations(): SavedLocation[] {
        return this._locations
    }

    loadLocations() {
        this._locations = this.locationService.getLocations()
        this.notifyPropertyChange('locations', this._locations)
    }

    async onLocationTap(args: any) {
        const location = this._locations[args.index]
        const result = await prompt({
            title: 'Editar Local',
            message: 'Nome do local:',
            okButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            defaultText: location.name,
            inputType: 'text'
        })

        if (result.result) {
            const radiusResult = await prompt({
                title: 'Raio de Detecção',
                message: 'Digite o raio em metros:',
                okButtonText: 'Salvar',
                cancelButtonText: 'Cancelar',
                defaultText: location.radius.toString(),
                inputType: 'number'
            })

            if (radiusResult.result) {
                const updatedLocation = {
                    ...location,
                    name: result.text,
                    radius: parseInt(radiusResult.text, 10)
                }
                this.locationService.updateLocation(updatedLocation)
                this.loadLocations()
            }
        }
    }

    async onDeleteLocation(args: any) {
        const location = this._locations[args.object.bindingContext.index]
        const result = await confirm({
            title: 'Confirmar Exclusão',
            message: `Deseja excluir o local "${location.name}"?`,
            okButtonText: 'Sim',
            cancelButtonText: 'Não'
        })

        if (result) {
            this.locationService.removeLocation(location.id)
            this.loadLocations()
        }
    }
}