import { getFieldsValues, inputDate, inputTime } from '../conts'
import { credentials } from '../credentials'
import pointsController from './PointsController'
import uiController from './UIController'

class AppController {
	init() {
		// UI init
		uiController.initDatepicker()
		uiController.setDefaultTime()
		uiController.setNameAndDigitsInputs()

		const { name, digits } = credentials.get()
		if (name && digits) {
			// load existing data
			pointsController.initForCredentials(name, digits)
		} else {
			// bind form focusout to attempt fetching points when user fills fields
			uiController.bindFormFocusOut(() => {
				const { name, digits } = getFieldsValues()
				if (name && digits) {
					pointsController.initForCredentials(name, digits)
				}
			})
		}

		// register button
		uiController.bindRegister(async (e?: Event) => {
			e?.preventDefault()
			const name = (document.getElementById('name') as HTMLInputElement).value.trim().toLowerCase()
			const digits = (document.getElementById('digits') as HTMLInputElement).value.trim()
			const date = inputDate.value
			const time = inputTime.value

			if (!name || !digits || digits.length !== 3 || Number.isNaN(Number(digits))) {
				uiController.showInfo('Preencha todos os campos corretamente.')
				return
			}

			uiController.isLoading(true)
			await pointsController.registerPoint(name, digits, date, time)

			uiController.isLoading(false)
			credentials.save(name, digits)
		})

		// delete handler (uses modal wrapper in UIController)
		uiController.bindTableDelete((record) => {
			uiController.showDeleteModal(record, async () => {
				await pointsController.deleteRecord(record)
			})
		})
	}
}

export const appController = new AppController()

export default appController
