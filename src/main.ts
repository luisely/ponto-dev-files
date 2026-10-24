import 'toastify-js/src/toastify.css'
import { appController } from './controllers/AppController'
import './index.css'
import { debugLog } from './config/debug'

// bootstrap the application
debugLog('🚀 [main.ts] Inicializando aplicação...')
appController.init()
