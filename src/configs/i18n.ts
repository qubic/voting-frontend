import i18n from 'i18next'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import { LANGUAGES } from '@/constants/i18n'

const getInitialLanguage = () => {
	const storedLang = localStorage.getItem('lng')

	if (storedLang) return storedLang

	// Get browser language
	const browserLang = navigator.language.split('-')[0] // Extract base language, e.g., 'en' from 'en-US'

	if (browserLang) {
		const foundLang = LANGUAGES.find((lng) => browserLang === lng.id)
		if (foundLang) {
			return browserLang
		}
	}
	// Default to English if the browser language is not supported
	return 'en'
}

i18n.use(HttpBackend)
	.use(initReactI18next)
	.init({
		lng: getInitialLanguage(),
		ns: ['translations'],
		// default namespace (needs no prefix on calling t)
		defaultNS: 'translations',
		fallbackNS: ['translations'],
		fallbackLng: 'en',
		backend: {
			loadPath: '/locales/{{lng}}/{{ns}}.json'
		},
		react: {
			useSuspense: true
		},
		interpolation: {
			escapeValue: false // react already safes from xss
		}
	})

export default i18n
