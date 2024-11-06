import { Observable } from '@nativescript/core'

export class MainViewModel extends Observable {
    private _counter: number
    private _message: string

    constructor() {
        super()
        this._counter = 42
        this._message = 'Clique no botão para começar!'
        this.notifyPropertyChange('message', this._message)
    }

    onTap() {
        this._counter--
        this._message = `Você clicou! Contador: ${this._counter}`
        this.notifyPropertyChange('message', this._message)
    }

    get message(): string {
        return this._message
    }
}