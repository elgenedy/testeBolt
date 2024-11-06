import { Application } from '@nativescript/core'
import { LocalNotifications } from '@nativescript/local-notifications'
import { Geolocation, enableLocationRequest } from '@nativescript/geolocation'
import './app.css'

// Inicializar notificações
LocalNotifications.addOnMessageReceivedCallback(notification => {
    console.log('Notificação recebida:', notification)
})

Application.run({ moduleName: 'app-root' })