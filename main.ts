//% weight=100 color=#DC22E1 block="MINTspark Elecfreaks" blockId="MINTspark Elecfreaks" icon="\uf0e7"
namespace mintspark {
    /*
     * NeZha
     */

    //% weight=88
    //% block="Set motor %motor speed to %speed\\%"
    //% group="Motor"
    //% speed.min=-100 speed.max=100
    export function setMotorSpeed(motor: neZha.MotorList, speed: number): void {
        neZha.setMotorSpeed(motor, speed);
    }

    //% weight=86
    //% block="Stop motor %motor"
    export function stopMotor(motor: neZha.MotorList): void {
        setMotorSpeed(motor, 0)
    }

    //% weight=85
    //%   block="Stop all motor"
    export function stopAllMotor(): void {
        setMotorSpeed(neZha.MotorList.M1, 0)
        setMotorSpeed(neZha.MotorList.M2, 0)
        setMotorSpeed(neZha.MotorList.M3, 0)
        setMotorSpeed(neZha.MotorList.M4, 0)
    }

    //% weight=84
    //% group="Servo"
    //% block="Set servo %servo angle to %angle°"
    //% color=#E63022
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
    //% color=#EA5532 group="Sensor"
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
    //% group="Sensor" color=#EA5532

    //%export function readColor(): number {
    //%    return PlanetX_Basic.readColor();
    //%}

    //% block="Color sensor IIC port detects %color"
    //% group="Sensor" color=#EA5532
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
    //% group="Output" color=#00B1ED
    //% expandableArgumentMode="toggle"
    export function ledBrightness(Rjpin: PlanetX_Display.DigitalRJPin, ledstate: boolean, brightness: number = 100): void {
        PlanetX_Display.ledBrightness(Rjpin, false, brightness);
    }
     
}
