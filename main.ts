//% weight=100 color=#DC22E1 block="MINTspark Elecfreaks" blockId="MINTspark Elecfreaks" icon="\uf0e7"
namespace mintspark {
    /*
     * NeZha
     */

    //% weight=88
    //% block="Set motor %motor speed to %speed\\%"
    //% group="Motor"
    //% speed.min=-100 speed.max=100
    //% color=#E63022
    export function setMotorSpeed(motor: neZha.MotorList, speed: number): void {
        neZha.setMotorSpeed(motor, speed);
    }

    //% weight=86
    //% block="Stop motor %motor"
    //% color=#E63022
    export function stopMotor(motor: neZha.MotorList): void {
        setMotorSpeed(motor, 0)
    }

    //% weight=85
    //% block="Stop all motor"
    //% color=#E63022
    export function stopAllMotor(): void {
        setMotorSpeed(neZha.MotorList.M1, 0)
        setMotorSpeed(neZha.MotorList.M2, 0)
        setMotorSpeed(neZha.MotorList.M3, 0)
        setMotorSpeed(neZha.MotorList.M4, 0)
    }

    //% weight=84
    //% group="Servo"
    //% block="Set servo %servo angle to %angle°"
    //% color=#a3a3c2
    export function setServoAngel(servo: neZha.ServoList, angel: number): void {
        neZha.setServoAngel(neZha.ServoTypeList._360, servo, angel);
    }

    /*
     * PlanetX Sensors
     */

    //% block="Ultrasonic sensor %Rjpin distance %distance_unit"
    //% group="Sensor"
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    //% distance_unit.fieldEditor="gridpicker"
    //% distance_unit.fieldOptions.columns=2
    //% color=#EA5532
    export function ultrasoundSensor(Rjpin: PlanetX_Basic.DigitalRJPin, distance_unit: PlanetX_Basic.Distance_Unit_List): number {
        return PlanetX_Basic.ultrasoundSensor(Rjpin, distance_unit);
    }
    
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    //% group="Sensor"
    //% color=#EA5532
    //% block="Line-tracking sensor %Rjpin is %state"
    export function trackingSensor(Rjpin: PlanetX_Basic.DigitalRJPin, state: PlanetX_Basic.TrackingStateType): boolean {
        return PlanetX_Basic.trackingSensor(Rjpin, state);
    }

    //% block="Trimpot %Rjpin analog value"
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    //% color=#ffcc66 group="Sensor"
    export function trimpot(Rjpin: PlanetX_Display.AnalogRJPin): number {
        return PlanetX_Basic.trimpot(Rjpin);
    }

    //% block="Soil moisture sensor %Rjpin value(0~100)"
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    //% color=#EA5532 group="Sensor"
    export function soilHumidity(Rjpin: PlanetX_Basic.AnalogRJPin): number {
        return PlanetX_Basic.soilHumidity(Rjpin);
    }

    //% block="Color sensor IIC port color HUE(0~360)"
    //% group="Sensor" color=#00B1ED

    //%export function readColor(): number {
    //%    return PlanetX_Basic.readColor();
    //%}

    //% block="Color sensor IIC port detects %color"
    //% group="Sensor" color=#00B1ED
    //% color.fieldEditor="gridpicker" color.fieldOptions.columns=3
    export function checkColor(color:  PlanetX_Basic.ColorList): boolean {
        return  PlanetX_Basic.checkColor(color);
    }

    //% block="Crash Sensor %Rjpin is pressed"
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    //% group="Sensor" color=#EA5532 
    export function Crash(Rjpin: PlanetX_Display.DigitalRJPin): boolean {
        return PlanetX_Basic.Crash(Rjpin);
    }

    /*
     * PlanetX Output
     */

    //% block="LED %Rjpin toggle to $ledstate || brightness %brightness \\%"
    //% Rjpin.fieldEditor="gridpicker" Rjpin.fieldOptions.columns=2
    //% brightness.min=0 brightness.max=100
    //% ledstate.shadow="toggleOnOff"
    //% group="Output" color=#EA5532 
    //% expandableArgumentMode="toggle"
    export function ledBrightness(Rjpin: PlanetX_Display.DigitalRJPin, ledstate: boolean, brightness: number = 100): void {
        PlanetX_Display.ledBrightness(Rjpin, ledstate, brightness);
    }
     
    const crashSensorEventId = 54119;
    //% block="Crash Sensor %Rjpin pressed"
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    //% group="Sensor" color=#EA5532 
    export function onCrashSensorPressed(Rjpin: PlanetX_Display.DigitalRJPin, handler: () => void) {
        control.onEvent(crashSensorEventId, 0, handler);
        control.inBackground(() => {
            let lastState = PlanetX_Basic.Crash(Rjpin);
            while (true) {
                let isPressed = PlanetX_Basic.Crash(Rjpin);

                if (isPressed && !lastState) {
                    
                    control.raiseEvent(crashSensorEventId, 0);
                }
                lastState = isPressed;
                basic.pause(200);
            }
        })
    }

    const colorSensorEventId = 54120;
    //% block="Color sensor detects %color"
    //% group="Sensor" color=#00B1ED
    //% color.fieldEditor="gridpicker" color.fieldOptions.columns=3
    export function onColorSensorDetectsColor(color: PlanetX_Basic.ColorList, handler: () => void) {
        control.onEvent(colorSensorEventId, 0, handler);
        control.inBackground(() => {
            let lastIsMatch = PlanetX_Basic.checkColor(color);
            while (true) {
                let isMatch = PlanetX_Basic.checkColor(color);

                if (isMatch && !lastIsMatch) {
                    control.raiseEvent(colorSensorEventId, 0);
                }
                lastIsMatch = isMatch;
                basic.pause(200);
            }
        })
    }
}
