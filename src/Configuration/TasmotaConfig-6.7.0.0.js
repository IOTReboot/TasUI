const TasmotaConfig_06070000 = {
    setOptionsStatusMaps : [{
        structName: "SysBitfield",
        setOptionStart: 0,
        bitSize: 1,
        items : [
            {
                name: 'save_state',
                description: 'Save power state and use after restart',
            } , { 
                name: 'button_restrict',
                description: 'Control button multipress',
            } , { 
                name: 'ex_value_units',
                description: 'Add units to JSON messages',
            } , { 
                name: 'mqtt_enabled',
                description: 'Control MQTT',
            } , { 
                name: 'mqtt_response',
                description: 'Switch between MQTT Result or Command',
            } , { 
                name: 'mqtt_power_retain',
                description: '',
            } , { 
                name: 'mqtt_button_retain',
                description: '',
            } , { 
                name: 'mqtt_switch_retain',
                description: '',
            } , { 
                name: 'temperature_conversion',
                description: 'Switch between Celsius or Fahreheit',
            } , { 
                name: 'mqtt_sensor_retain',
                description: 'CMDN_SENSORRETAIN',
            } , { 
                name: 'mqtt_offline',
                description: 'Control MQTT LWT message format',
            } , { 
                name: 'button_swap',
                description: 'Swap button single and double press functionality',
            } , { 
                name: 'stop_flash_rotate',
                description: 'Switch between dynamic or fixed slot flash save location',
            } , { 
                name: 'button_single',
                description: 'Support only single press to speed up button press recognition',
            } , { 
                name: 'interlock',
                description: '',
            } , { 
                name: 'pwm_control',
                description: 'Switch between commands PWM or COLOR/DIMMER/CT/CHANNEL',
            } , { 
                name: 'ws_clock_reverse',
                description: 'Set addressable LED Clock scheme parameter',
            } , { 
                name: 'decimal_text',
                description: 'Switch between decimal or hexadecimal output',
            } , { 
                name: 'light_signal',
                description: 'Pair light signal with CO2 sensor',
            } , { 
                name: 'hass_discovery',
                description: 'Control Home Assistant Automatic discovery',
            } , { 
                name: 'not_power_linked',
                description: 'Control power in relation fo Dimmer/Color/CT changes',
            } , { 
                name: 'no_power_on_check',
                description: 'Show voltage even if powered off',
            } , { 
                name: 'mqtt_serial',
                description: '',
            } , { 
                name: 'mqtt_serial_raw',
                description: '',
            } , { 
                name: 'pressure_conversion',
                description: 'Switch between hPa or mmHg pressure unit',
            } , { 
                name: 'knx_enabled',
                description: '',
            } , { 
                name: 'device_index_enable',
                description: 'Switch between POWER or POWER1',
            } , { 
                name: 'knx_enable_enhancement',
                description: '',
            } , { 
                name: 'rf_receive_decimal',
                description: 'RF Receive data format',
            } , { 
                name: 'ir_receive_decimal',
                description: 'IR Receive data format',
            } , { 
                name: 'hass_light',
                description: 'Enforce HASS Autodiscovery as light',
            } , { 
                name: 'global_state',
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
                name: 'timers_enable',
                description: '',
            } , {
                name: 'user_esp8285_enable',
                description: 'Enable ESP8285 User GPIOs',
            } , {
                name: 'time_append_timezone',
                description: 'Append timezone to JSON time',
            } , {
                name: 'gui_hostname_ip',
                description: 'Show hostname and IP address in GUI main menu',
            } , {
                name: 'tuya_apply_o20',
                description: 'Apple SetOption20 settings to Tuya device',
            } , {
                name: 'mdns_enabled',
                description: 'Control mDNS Service',
            } , {
                name: 'use_wifi_scan',
                description: 'Scan wifi network at restart for configured APs',
            } , {
                name: 'use_wifi_rescan',
                description: 'Scan wifi network every 44 minutes for configured APs',
            } , {
                name: 'receive_raw',
                description: 'Add IR Raw data to JSON message',
            } , {
                name: 'hass_tele_on_power',
                description: 'Send tele/%topic%/STATE in addition to stat/%topic%/RESULT',
            } , {
                name: 'sleep_normal',
                description: 'Enable normal sleep instead of dynamic sleep',
            } , {
                name: 'button_switch_force_local',
                description: 'Force local operation when button/switch topic is set',
            } , {
                name: 'no_hold_retain',
                description: 'Don\'t use retain flag on HOLD messages',
            } , {
                name: 'no_power_feedback',
                description: 'Don\'t scan relay power state at restart',
            } , {
                name: 'use_underscore',
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