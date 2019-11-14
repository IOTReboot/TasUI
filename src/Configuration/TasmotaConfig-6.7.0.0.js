const TasmotaConfig_06070000 = {
    setOptionsStatusMaps : [{
        structName: "SysBitfield",
        setOptionStart: 0,
        bitSize: 1,
        items : [
            {
                name: 'Save State',
                description: 'Save power state and use after restart',
            } , { 
                name: 'Button Restrict',
                description: 'Control button multipress',
            } , { 
                name: 'Ex Value Units',
                description: 'Add units to JSON messages',
            } , { 
                name: 'MQTT Enabled',
                description: 'Control MQTT',
            } , { 
                name: 'MQTT Response',
                description: 'Switch between MQTT Result or Command',
            } , { 
                name: 'MQTT Power Retain',
                description: '',
            } , { 
                name: 'MQTT Button Retain',
                description: '',
            } , { 
                name: 'MQTT Switch Retain',
                description: '',
            } , { 
                name: 'MQTT Temperature Conversion',
                description: 'Switch between Celsius or Fahreheit',
            } , { 
                name: 'MQTT Sensor Retain',
                description: 'CMDN_SENSORRETAIN',
            } , { 
                name: 'MQTT Offline',
                description: 'Control MQTT LWT message format',
            } , { 
                name: 'Button Swap',
                description: 'Swap button single and double press functionality',
            } , { 
                name: 'Stop Flash Rotate',
                description: 'Switch between dynamic or fixed slot flash save location',
            } , { 
                name: 'Button Single',
                description: 'Support only single press to speed up button press recognition',
            } , { 
                name: 'Interlock',
                description: '',
            } , { 
                name: 'PWM Control',
                description: 'Switch between commands PWM or COLOR/DIMMER/CT/CHANNEL',
            } , { 
                name: 'Clockwise / CounterClockwise',
                description: 'Set addressable LED Clock scheme parameter',
            } , { 
                name: 'Deicmal Text',
                description: 'Switch between decimal or hexadecimal output',
            } , { 
                name: 'Light Signal',
                description: 'Pair light signal with CO2 sensor',
            } , { 
                name: 'HASS Discovery',
                description: 'Control Home Assistant Automatic discovery',
            } , { 
                name: 'Not Power Linked',
                description: 'Control power in relation fo Dimmer/Color/CT changes',
            } , { 
                name: 'No poweron check',
                description: 'Show voltage even if powered off',
            } , { 
                name: 'MQTT Serial',
                description: '',
            } , { 
                name: 'MQTT Serial Raw',
                description: '',
            } , { 
                name: 'Pressure Conversion',
                description: 'Switch between hPa or mmHg pressure unit',
            } , { 
                name: 'KNX Enabled',
                description: '',
            } , { 
                name: 'Device Index Enable',
                description: 'Switch between POWER or POWER1',
            } , { 
                name: 'KNX Enable Enhancement',
                description: '',
            } , { 
                name: 'RF Receive Decimal',
                description: 'RF Receive data format',
            } , { 
                name: 'IR Receive Decimal',
                description: 'IR Receive data format',
            } , { 
                name: 'HASS Light',
                description: 'Enforce HASS Autodiscovery as light',
            } , { 
                name: 'Global State',
                description: 'Control link led blinking',
            }
        ]
    }, {
        structName: "SysBitfield2",
        setOptionStart: 32,
        bitSize: 1,
        items: [],
    }, {
        structName: "SysBitfield3",
        setOptionStart: 50,
        bitSize: 1,
        items: [
            {
                name: 'Timers Enable',
                description: '',
            } , {
                name: 'User ESP8285 Enable',
                description: 'Enable ESP8285 User GPIOs',
            } , {
                name: 'Time Append Timezone',
                description: 'Append timezone to JSON time',
            } , {
                name: 'GUI Hostname IP',
                description: 'Show hostname and IP address in GUI main menu',
            } , {
                name: 'Tuya Apply o20',
                description: 'Apple SetOption20 settings to Tuya device',
            } , {
                name: 'MDNS Enable',
                description: 'Control mDNS Service',
            } , {
                name: 'Use Wifi Scan',
                description: 'Scan wifi network at restart for configured APs',
            } , {
                name: 'Use wifi rescan',
                description: 'Scan wifi network every 44 minutes for configured APs',
            } , {
                name: 'Receive raw',
                description: 'Add IR Raw data to JSON message',
            } , {
                name: 'HASS Tele on Power',
                description: 'Send tele/%topic%/STATE in addition to stat/%topic%/RESULT',
            } , {
                name: 'Sleep Normal',
                description: 'Enable normal sleep instead of dynamic sleep',
            } , {
                name: 'Button switch force local',
                description: 'Force local operation when button/switch topic is set',
            } , {
                name: 'No Hold Retain',
                description: 'Don\'t use retain flag on HOLD messages',
            } , {
                name: 'No power feedback',
                description: 'Don\'t scan relay power state at restart',
            } , {
                name: 'Use underscore',
                description: 'Enable "_" instead of "=" as sensor index separator',
            } , {
                name: 'fast_power_cycle_disable',
                description: 'Disable fast power cycle detection for device reset',
            } , {
                name: 'tuya_serial_mqtt_publish',
                description: 'Enable TuyaReceived messages over Mqtt',
            } , {
                name: 'buzzer_enable',
                description: 'Enable buzzer when available',
            } , {
                name: 'pwm_multi_channels',
                description: 'Enable multi-channels PWM instead of Color PWM',
            } , {
                name: 'ex_tuya_dimmer_min_limit',
                description: '',
            } , {
                name: 'energy_weekend',
                description: '',
            } , {
                name: 'dds2382_model',
                description: 'Select different Modbus registers for Active Energy',
            } , {
                name: 'hardware_energy_total',
                description: 'Enable / Disable hardware energy total counter as reference',
            } , {
                name: 'cors_enabled',
                description: 'Enable HTTP CORS',
            } , {
                name: 'ds18x20_internal_pullup',
                description: 'Enable internal pullip for single DS18x20 sensor',
            } , {
                name: 'grouptopic_mode',
                description: 'GroupTopic replaces %topic% (0) or fixed topic cmnd/grouptopic(1)',
            } , {
                name: 'spare26',
                description: '',
            } , {
                name: 'spare27',
                description: '',
            } , {
                name: 'spare28',
                description: '',
            } , {
                name: 'spare29',
                description: '',
            } , {
                name: 'shutter_mode',
                description: 'Enable shutter support',
            } , {
                name: 'pcf8574_ports_inverted',
                description: 'Invert all ports on PCF8574 devices',
            } 
        ]
    }, {
        structName: "SysBitfield4",
        setOptionStart: 82,
        bitSize: 1,
        items: [
        {
            name: 'spare00',
            description: '',
        } , {
            name: 'spare01',
            description: '',
        } , {
            name: 'spare02',
            description: '',
        } , {
            name: 'spare03',
            description: '',
        } , {
            name: 'spare04',
            description: '',
        } , {
            name: 'spare05',
            description: '',
        } , {
            name: 'spare06',
            description: '',
        } , {
            name: 'spare07',
            description: '',
        } , {
            name: 'spare08',
            description: '',
        } , {
            name: 'spare09',
            description: '',
        } , {
            name: 'spare10',
            description: '',
        } , {
            name: 'spare11',
            description: '',
        } , {
            name: 'spare12',
            description: '',
        } , {
            name: 'spare13',
            description: '',
        } , {
            name: 'spare14',
            description: '',
        } , {
            name: 'spare15',
            description: '',
        } , {
            name: 'spare16',
            description: '',
        } , {
            name: 'spare17',
            description: '',
        } , {
            name: 'spare18',
            description: '',
        } , {
            name: 'spare19',
            description: '',
        } , {
            name: 'spare20',
            description: '',
        } , {
            name: 'spare21',
            description: '',
        } , {
            name: 'spare22',
            description: '',
        } , {
            name: 'spare23',
            description: '',
        } , {
            name: 'spare24',
            description: '',
        } , {
            name: 'spare25',
            description: '',
        } , {
            name: 'spare26',
            description: '',
        } , {
            name: 'spare27',
            description: '',
        } , {
            name: 'spare28',
            description: '',
        } , {
            name: 'spare29',
            description: '',
        } , {
            name: 'spare30',
            description: '',
        } , {
            name: 'spare31',
            description: '',
        }
        ]
    }]
}

export default TasmotaConfig_06070000