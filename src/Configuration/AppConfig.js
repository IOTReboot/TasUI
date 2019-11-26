class AppConfig {


    constructor() {
        this.appConfig = "appConfig" in localStorage ? JSON.parse(localStorage.getItem('appConfig')) : {};
        this.appSessionConfig = "appSessionConfig" in sessionStorage ? JSON.parse(localStorage.getItem('appConfigSession')) : {};
    }

    saveSessionConfig() {
        sessionStorage.setItem('appSessionConfig', JSON.stringify(this.appSessionConfig));
    }

    saveAppConfig() {
        localStorage.setItem('appConfig', JSON.stringify(this.appConfig));
    }

    putSessionConfig(key, value) {
        this.appSessionConfig[key] = value
        this.saveSessionConfig()
    }

    putAppConfig(key, value) {
        this.appConfig[key] = value
        this.saveAppConfig()
    }

    getSessionConfig(key) {
        return this.appSessionConfig[key]
    }

    getAppConfig(key) {
        return this.appConfig[key]
    }
}

export default AppConfig