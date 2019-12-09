/*

  Copyright (C) 2019  Shantur Rathore
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/
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