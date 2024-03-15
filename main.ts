//% weight=100 color=#DC22E1 block="MINTspark Inventor" blockId="MINTspark Inventor" icon="\uf0e7"
namespace mintspark {
    /*
     * NeZha
     */
    
    //% weight=100
    //% block="Set motor %motor speed to %speed\\% || seconds %seconds"
    //% subcategory="Motor / Servo"
    //% group="Motor"
    //% speed.min=-100 speed.max=100
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% color=#E63022
    export function setMotorSpeed(motor: neZha.MotorList, speed: number, seconds?: number): void {
        if (speed < 0 && speed > -11)
        {
            speed = -11;
        }
        else if (speed > 0 && speed < 11) {
            speed = 11;
        }

        neZha.setMotorSpeed(motor, speed);

        if (seconds != null) {
            basic.pause(seconds * 1000);
            setMotorSpeed(motor, 0);
        }
    }

    //% weight=95
    //% subcategory="Motor / Servo"
    //% group="Motor"
    //% block="Stop motor %motor"
    //% color=#E63022
    export function stopMotor(motor: neZha.MotorList): void {
        setMotorSpeed(motor, 0)
    }

    //% weight=90
    //% subcategory="Motor / Servo"
    //% group="Motor"
    //% block="Stop all motor"
    //% color=#E63022
    export function stopAllMotor(): void {
        setMotorSpeed(neZha.MotorList.M1, 0)
        setMotorSpeed(neZha.MotorList.M2, 0)
        setMotorSpeed(neZha.MotorList.M3, 0)
        setMotorSpeed(neZha.MotorList.M4, 0)
    }

    /*
     * Tank Mode
     */

    let tankMotorLeft: neZha.MotorList = neZha.MotorList.M1;
    let tankMotorLeftReversed: boolean = false;
    let tankMotorRight: neZha.MotorList = neZha.MotorList.M2;
    let tankMotorRightReversed: boolean = false;

    export enum TurnDirection {
        //% block="left"
        Left,
        //% block="right"
        Right
    }

    //% weight=50
    //% block="Set motor left to %motor reverse %reverse"
    //% subcategory="Tank Mode"
    //% group="Tank Mode"
    //% motor.defl=neZha.MotorList.M1
    //% reverse.shadow="toggleYesNo"
    //% color=#E63022
    export function setTankMotorLeft(motor: neZha.MotorList, reverse: boolean): void {
        tankMotorLeft = motor;
        tankMotorLeftReversed = reverse;
    }

    //% weight=45
    //% block="Set motor right to %motor reverse %reverse"
    //% subcategory="Tank Mode"
    //% group="Tank Mode"
    //% motor.defl=neZha.MotorList.M2
    //% reverse.shadow="toggleYesNo"
    //% color=#E63022
    export function setTankMotorRight(motor: neZha.MotorList, reverse: boolean): void {
        tankMotorRight = motor;
        tankMotorRightReversed = reverse;
    }

    //% weight=40
    //% block="Drive straight speed %speed\\% || seconds %seconds"
    //% subcategory="Tank Mode"
    //% group="Tank Mode"
    //% speed.min=-100 speed.max=100
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% color=#E63022
    export function driveTankModeSingleSpeed(speed: number, seconds?: number): void {
        let tm1Speed = tankMotorLeftReversed ? -speed : speed;
        let tm2Speed = tankMotorRightReversed ? -speed : speed;
        setMotorSpeed(tankMotorLeft, tm1Speed);
        setMotorSpeed(tankMotorRight, tm2Speed);

        if (seconds != null)
        {
            basic.pause(seconds * 1000);
            setMotorSpeed(tankMotorRight, 0);
            setMotorSpeed(tankMotorLeft, 0);
        }
    }

    //% weight=35
    //% block="Drive left motor %speedLeft\\% right motor %speedRight\\% || seconds %seconds"
    //% subcategory="Tank Mode"
    //% group="Tank Mode"
    //% speedLeft.min=-100 speedLeft.max=100
    //% speedRight.min=-100 speedRight.max=100
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% color=#E63022
    export function driveTankModeDualSpeed(speedLeft: number, speedRight: number, seconds?: number): void {
        let tmLSpeed = tankMotorLeftReversed ? -speedLeft : speedLeft;
        let tmRSpeed = tankMotorRightReversed ? -speedRight : speedRight;
        setMotorSpeed(tankMotorLeft, tmLSpeed);
        setMotorSpeed(tankMotorRight, tmRSpeed);

        if (seconds != null) {
            basic.pause(seconds * 1000);
            setMotorSpeed(tankMotorRight, 0);
            setMotorSpeed(tankMotorLeft, 0);
        }
    }

    //% weight=30
    //% block="Spot-turn %direction at speed %speed\\% for %milliSeconds ms"
    //% subcategory="Tank Mode"
    //% group="Tank Mode"
    //% speed.min=10 speed.max=100
    //% inlineInputMode=inline
    //% color=#E63022
    export function turnTankMode(direction: TurnDirection, speed: number, milliSeconds: number): void {
        let tmLSpeed = tankMotorLeftReversed ? -speed : speed;
        let tmRSpeed = tankMotorRightReversed ? -speed : speed;

        if (direction == TurnDirection.Right) 
        {tmRSpeed = -tmRSpeed;}
        else
        { tmLSpeed = -tmLSpeed;}
        
        setMotorSpeed(tankMotorLeft, tmLSpeed);
        setMotorSpeed(tankMotorRight, tmRSpeed);
        basic.pause(milliSeconds);
        setMotorSpeed(tankMotorRight, 0);
        setMotorSpeed(tankMotorLeft, 0);
    }

    //% weight=80
    //% subcategory="Motor / Servo"
    //% group="Servo"
    //% block="Set servo %servo angle to %angle°"
    //% color=#a3a3c2
    //% angel.min=0 angel.max=360
    export function setServoAngel(servo: neZha.ServoList, angel: number): void {
        neZha.setServoAngel(neZha.ServoTypeList._360, servo, angel);
    }

    /*
     * PlanetX Sensors
     */

    //% weight=110
    //% subcategory="Sensor / Input"
    //% group="Sensor"
    //% block="Soil moisture sensor %Rjpin value(0~100)"
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    //% color=#ffcc66
    export function soilHumidity(Rjpin: PlanetX_Basic.AnalogRJPin): number {
        return PlanetX_Basic.soilHumidity(Rjpin);
    }

    //% weight=105
    //% subcategory="Sensor / Input"
    //% group="Input"
    //% block="Trimpot %Rjpin analog value"
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    //% color=#ffcc66
    export function trimpot(Rjpin: PlanetX_Display.AnalogRJPin): number {
        return PlanetX_Basic.trimpot(Rjpin);
    }

    //% weight=100
    //% subcategory="Sensor / Input"
    //% group="Input"
    //% block="Crash Sensor %Rjpin is pressed"
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    //% color=#EA5532 
    export function Crash(Rjpin: PlanetX_Display.DigitalRJPin): boolean {
        return PlanetX_Basic.Crash(Rjpin);
    }

    const crashSensorEventId = 54119;
    //% weight=95
    //% subcategory="Sensor / Input"
    //% group="Input"
    //% block="Crash Sensor %Rjpin pressed"
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    //% color=#EA5532 
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

    //% weight=80
    //% block="Ultrasonic sensor %Rjpin distance %distance_unit"
    //% subcategory="Sensor / Input"
    //% group="Sensor"
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    //% distance_unit.fieldEditor="gridpicker"
    //% distance_unit.fieldOptions.columns=2
    //% color=#EA5532
    export function ultrasoundSensor(Rjpin: PlanetX_Basic.DigitalRJPin, distance_unit: PlanetX_Basic.Distance_Unit_List): number {
        return PlanetX_Basic.ultrasoundSensor(Rjpin, distance_unit);
    }

    const ultrasonicSensorEventId = 54121;
    //% weight=78
    //% subcategory="Sensor / Input"
    //% group="Sensor"
    //% block="Ultrasonic Sensor %Rjpin triggered"
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    export function onUltrasonicSensorTriggered(Rjpin: PlanetX_Display.DigitalRJPin, handler: () => void) {
        control.onEvent(ultrasonicSensorEventId, 0, handler);
        control.inBackground(() => {
            let lastState = false;
            while (true) {
                let distance = PlanetX_Basic.ultrasoundSensor(Rjpin, PlanetX_Basic.Distance_Unit_List.Distance_Unit_cm);
                let detected = distance > 0 && distance < 6;

                if (detected && !lastState) {
                    control.raiseEvent(ultrasonicSensorEventId, 0);
                }

                lastState = detected;
                basic.pause(200);
            }
        })
    }
    
    //% weight=75
    //% subcategory="Sensor / Input"
    //% group="Sensor"
    //% Rjpin.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2
    //% color=#EA5532
    //% block="Line-tracking sensor %Rjpin is %state"
    export function trackingSensor(Rjpin: PlanetX_Basic.DigitalRJPin, state: PlanetX_Basic.TrackingStateType): boolean {
        return PlanetX_Basic.trackingSensor(Rjpin, state);
    }

    //% weight=55
    //% subcategory="Sensor / Input"
    //% group="Sensor"
    //% block="Color sensor IIC port detects %color"
    //% color=#00B1ED
    //% color.fieldEditor="gridpicker" color.fieldOptions.columns=3
    export function checkColor(color: PlanetX_Basic.ColorList): boolean {
        return PlanetX_Basic.checkColor(color);
    }

    //% weight=50
    //% subcategory="Sensor / Input"
    //% group="Sensor"
    //% block="Color sensor IIC port color HUE(0~360)"
    //% color=#00B1ED
    //%export function readColor(): number {
    //%    return PlanetX_Basic.readColor();
    //%}

    const colorSensorEventId = 54120;
    //% weight=45
    //% subcategory="Sensor / Input"
    //% group="Sensor"
    //% block="Color sensor detects %color"
    //% color=#00B1ED
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

    /*
     * PlanetX Output
     */

    //% subcategory="Light / Display"
    //% group="Light"
    //% block="LED %Rjpin toggle to $ledstate || brightness %brightness \\%"
    //% Rjpin.fieldEditor="gridpicker" Rjpin.fieldOptions.columns=2
    //% brightness.min=0 brightness.max=100
    //% ledstate.shadow="toggleOnOff"
    //% color=#EA5532 
    //% expandableArgumentMode="toggle"
    export function ledBrightness(Rjpin: PlanetX_Display.DigitalRJPin, ledstate: boolean, brightness: number = 100): void {
        PlanetX_Display.ledBrightness(Rjpin, ledstate, brightness);
    }

    //% subcategory="Light / Display"
    //% group="Display"
    //% line.min=1 line.max=8 line.defl=1
    //% text.defl="Hello!"
    //% block="Display: Show text %text on line %line"
    //% color=#00B1ED
    export function oledShowText(text: string, line: number) {
        PlanetX_Display.showUserText(line, text);
    }

    //% subcategory="Light / Display"
    //% group="Display"
    //% line.min=1 line.max=8 line.defl=1 
    //% n.defl=1234
    //% block="Display: Show number %n on line %line"
    //% color=#00B1ED
    export function oledShowNumber(n: number, line: number) {
        PlanetX_Display.showUserNumber(line, n);
    }

    //% subcategory="Light / Display"
    //% group="Display"
    //% block="clear display" color=#00B1ED
    export function oledClear() {
        PlanetX_Display.oledClear();
    }
}