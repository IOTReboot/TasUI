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