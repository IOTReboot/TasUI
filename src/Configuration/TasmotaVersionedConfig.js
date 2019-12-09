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

import TasmotaConfig_06070000 from './TasmotaConfig-6.7.0.0'

const TasmotaVersionedConfig = {
    TasmotaConfig_06070000: TasmotaConfig_06070000,
}

function getConfigurationForVersion(version) {
    if (version <= 0x06070000) {
        return TasmotaVersionedConfig.TasmotaConfig_06070000
    } else {

        let versions = Object.keys(TasmotaVersionedConfig)
        let closestVersion = 0xFFFFFFFF
        let maximumVersion = -1

        for (let i = 0; i < versions.length; i++) {
            let availableVersion = parseInt(versions[i].replace('TasmotaConfig_', ''), 16)

            if (availableVersion > maximumVersion) {
                maximumVersion = availableVersion
            }

            if (availableVersion === version) {
                closestVersion = availableVersion;
                break
            } else if (availableVersion > version) {
                if (closestVersion > availableVersion) {
                    closestVersion = availableVersion;
                }
            }
        }

        if (closestVersion === 0xFFFFFFFF) {
            closestVersion = maximumVersion
        }


        return TasmotaVersionedConfig['TasmotaConfig_' + ('0000000' + closestVersion.toString(16).toUpperCase()).substr(-8)]
    }
}

export default getConfigurationForVersion