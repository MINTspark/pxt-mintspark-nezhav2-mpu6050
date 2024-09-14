//% weight=100 color=#DC22E1 block="MINTspark Inventor" blockId="MINTspark Inventor" icon="\uf0e7"
namespace mintspark {
    /*
     * NeZha
     */

    let maxSpeed = 25;
    let minSpeed = 12;
    let MPU6050Initialised = false;
    let stopDrive = true;

    function restrictSpeed(speed: number):number{
        if (speed > 100) { speed = 100 };
        if (speed < -100) { speed = -100 };

        if (speed < 0)
        { 
            if (speed > -minSpeed) { return -minSpeed; }
            return Math.map(speed, -minSpeed, -100, -minSpeed, -maxSpeed);
        }

        if (speed > 0) 
        {
            if (speed < minSpeed) { return minSpeed; }
            return Math.map(speed, minSpeed, 100, minSpeed, maxSpeed);
        }

        return 0;
    }
    
    //% weight=100
    //% block="Set motor %motor speed to %speed\\% || seconds %seconds"
    //% subcategory="Motor / Servo"
    //% group="Motor"
    //% speed.min=-100 speed.max=100
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% color=#E63022
    export function setMotorSpeed(motor: neZha.MotorList, speed: number, seconds?: number): void {
        speed = restrictSpeed(speed);
        neZha.setMotorSpeed(motor, speed);

        if (seconds != null) {
            basic.pause(seconds * 1000);
            neZha.setMotorSpeed(motor, 0);
        }
    }

    //% weight=95
    //% subcategory="Motor / Servo"
    //% group="Motor"
    //% block="Stop motor %motor"
    //% color=#E63022
    export function stopMotor(motor: neZha.MotorList): void {
        stopDrive = true;
        setMotorSpeed(motor, 0)
    }

    //% weight=90
    //% subcategory="Motor / Servo"
    //% group="Motor"
    //% block="Stop all motor"
    //% color=#E63022
    export function stopAllMotor(): void {
        stopDrive = true;
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
    let clawServo: neZha.ServoList = neZha.ServoList.S1;

    export enum TurnDirection {
        //% block="left"
        Left,
        //% block="right"
        Right
    }

    //% weight=50
    //% block="Set robot motor left to %motor reverse %reverse"
    //% subcategory="Tank Mode"
    //% group="Setup"
    //% motor.defl=neZha.MotorList.M1
    //% reverse.shadow="toggleYesNo"
    //% color=#E63022
    export function setTankMotorLeft(motor: neZha.MotorList, reverse: boolean): void {
        tankMotorLeft = motor;
        tankMotorLeftReversed = reverse;
    }

    //% weight=45
    //% block="Set robot motor right to %motor reverse %reverse"
    //% subcategory="Tank Mode"
    //% group="Setup"
    //% motor.defl=neZha.MotorList.M2
    //% reverse.shadow="toggleYesNo"
    //% color=#E63022
    export function setTankMotorRight(motor: neZha.MotorList, reverse: boolean): void {
        tankMotorRight = motor;
        tankMotorRightReversed = reverse;
    }

    //% weight=40
    //% block="Set claw servo to port %servo"
    //% subcategory="Tank Mode"
    //% group="Setup"
    //% motor.defl=neZha.ServoList.S1
    //% reverse.shadow="toggleYesNo"
    //% color=#E63022
    export function setClawServo(servo: neZha.ServoList): void {
        clawServo = servo;
    }

    //% weight=40
    //% block="Drive straight speed %speed\\% || seconds %seconds"
    //% subcategory="Tank Mode"
    //% group="Drive"
    //% speed.min=-100 speed.max=100
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% color=#E63022
    export function driveTankModeSingleSpeed(speed: number, seconds?: number): void {
        stopDrive = true;
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

    //% weight=10
    //% block="Stop drive"
    //% subcategory="Tank Mode"
    //% group="Drive"
    //% inlineInputMode=inline
    //% color=#E63022
    export function driveTankModeStop(): void {
        stopDrive = true;
        setMotorSpeed(tankMotorLeft, 0);
        setMotorSpeed(tankMotorRight, 0);
    }

    //% weight=35
    //% block="Drive left motor %speedLeft\\% right motor %speedRight\\% || seconds %seconds"
    //% subcategory="Tank Mode"
    //% group="Drive"
    //% speedLeft.min=-100 speedLeft.max=100
    //% speedRight.min=-100 speedRight.max=100
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% color=#E63022
    export function driveTankModeDualSpeed(speedLeft: number, speedRight: number, seconds?: number): void {
        stopDrive = true;
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

    //% weight=37
    //% block="Gyro drive straight speed %speed || seconds %seconds"
    //% subcategory="Tank Mode"
    //% group="Drive"
    //% speed.min=-100 speed.max=100
    //% expandableArgumentMode="toggle"
    //% color=#E63022
    export function driveTankModeSingleSpeedGyro(speed: number, seconds?: number): void {
        // Setup IMU, exit if not initialised
        if (!setupMPU6050()) {
            return;
        }

        // Calibrate 6050 sensor for 1 second (robot must remain still during this period)
        MINTsparkMpu6050.Calibrate(1);

        // Drive with PID Control
        if (seconds != null)
        {
            driveTankModeSingelSpeedGyroPid(speed, seconds);
        }
        else
        {
            control.inBackground(() => {
                driveTankModeSingelSpeedGyroPid(speed, 60000);
            })
        }
    }

    function driveTankModeSingelSpeedGyroPid(speed: number, seconds: number):void{
        let modierfierL = tankMotorLeftReversed ? -1 : 1;
        let modierfierR = tankMotorRightReversed ? -1 : 1;

        stopDrive = false;
        let startTime = input.runningTime();
        let lastUpdateTime = startTime;
        let Kp = 10; let Ki = 0.05; let Kd = 0.5;

        let pidController = new MINTsparkMpu6050.PIDController();
        pidController.setGains(Kp, Ki, Kd);
        pidController.setPoint(MINTsparkMpu6050.UpdateMPU6050().orientation.yaw);
        let speedL = speed; let speedR = speed;
        setMotorSpeed(tankMotorLeft, speedL / 2 * modierfierL);
        setMotorSpeed(tankMotorRight, speedR / 2 * modierfierR);

        while (input.runningTime() - startTime < seconds * 1000) {
            if (stopDrive) break;

            let updateTime = input.runningTime();
            let pidCorrection = pidController.compute(updateTime - lastUpdateTime, MINTsparkMpu6050.UpdateMPU6050().orientation.yaw);
            lastUpdateTime = updateTime;

            speedL = Math.constrain(speed + pidCorrection, 0, 100);
            speedR = Math.constrain(speed - pidCorrection, 0, 100);

            // Change motor speed
            if (stopDrive) break;
            setMotorSpeed(tankMotorLeft, speedL * modierfierL);
            setMotorSpeed(tankMotorRight, speedR * modierfierR);

            basic.pause(10);
        }

        setMotorSpeed(tankMotorRight, 0);
        setMotorSpeed(tankMotorLeft, 0);
        stopDrive = true;
    }

    //% weight=30
    //% block="Spot-turn %direction for %milliSeconds ms || with speed %speed\\%"
    //% subcategory="Tank Mode"
    //% group="Turn"
    //% speed.min=10 speed.max=100 speed.defl=25
    //% inlineInputMode=inline
    //% color=#E63022
    export function turnTankMode(direction: TurnDirection, milliSeconds: number, speed?: number): void {
        let tmLSpeed = tankMotorLeftReversed ? -speed : speed;
        let tmRSpeed = tankMotorRightReversed ? -speed : speed;
        if (direction == TurnDirection.Right) { tmRSpeed = -tmRSpeed; } else { tmLSpeed = -tmLSpeed; }

        setMotorSpeed(tankMotorLeft, tmLSpeed);
        setMotorSpeed(tankMotorRight, tmRSpeed);
        basic.pause(milliSeconds);
        setMotorSpeed(tankMotorRight, 0);
        setMotorSpeed(tankMotorLeft, 0);
    }

    //% subcategory="Tank Mode"
    //% group="Turn"
    //% block="Gyro spot-turn %turn for angle %angle || with speed %speed"
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% speed.min=10 speed.max=100 speed.defl=25 angle.min=1 angle.max=200 angle.defl=90
    //% weight=25
    //% color=#E63022
    export function turnTankModeGyro(turn: TurnDirection, angle: number, speed?: number): void {
        stopDrive = true;

        if (speed == null) {
            speed = 25;
        }

        let tmLSpeed = tankMotorLeftReversed ? -speed : speed;
        let tmRSpeed = tankMotorRightReversed ? -speed : speed;
        if (turn == TurnDirection.Right) { tmRSpeed = -tmRSpeed; } else { tmLSpeed = -tmLSpeed; }

        // Setup IMU, exit if not initialised
        if (!setupMPU6050()) {
            return;
        }

        MINTsparkMpu6050.Calibrate(1);

        let startTime = input.runningTime();
        let startHeading = MINTsparkMpu6050.UpdateMPU6050().orientation.yaw360;
        let previousHeading = startHeading;
        let totalChange = 0;

        setMotorSpeed(tankMotorRight, tmRSpeed);
        setMotorSpeed(tankMotorLeft, tmLSpeed);
        basic.pause(200);

        while (input.runningTime() - startTime < 5000) {
            let heading = MINTsparkMpu6050.UpdateMPU6050().orientation.yaw360;
            let change = previousHeading - heading;

            if (turn == TurnDirection.Right) {
                change *= -1;
            }

            if (change < 0) {
                change += 360;
            }

            totalChange += change;

            if (totalChange > angle) break;

            previousHeading = heading;
            basic.pause(10);
        }

        setMotorSpeed(tankMotorRight, 0);
        setMotorSpeed(tankMotorLeft, 0);
    }

    //% weight=20
    //% subcategory="Tank Mode"
    //% group="Claw"
    //% block="Open claw"
    //% color=#a3a3c2
    export function openClaw(): void {
        neZha.setServoAngel(neZha.ServoTypeList._180, clawServo, 15);
    }

    //% weight=15
    //% subcategory="Tank Mode"
    //% group="Claw"
    //% block="Close claw"
    //% color=#a3a3c2
    export function closeClaw(): void {
        neZha.setServoAngel(neZha.ServoTypeList._180, clawServo, 68);
    }

    //% weight=80
    //% subcategory="Motor / Servo"
    //% group="Servo"
    //% block="Set servo %servo angle to %angle°"
    //% color=#a3a3c2
    //% angel.min=0 angel.max=360
    export function setServoAngel(servo: neZha.ServoList, angle: number): void {
        if (angle > 360 || angle < 0)
        {
            return;
        }
        
        neZha.setServoAngel(neZha.ServoTypeList._360, servo, angle);
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

    let lastUltrasoundSensorReading = 50;

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
        let distance = PlanetX_Basic.ultrasoundSensor(Rjpin, distance_unit);

        if (distance <= 0)
        {
            distance = lastUltrasoundSensorReading;
        }

        lastUltrasoundSensorReading = distance;
        return lastUltrasoundSensorReading;
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




    function setupMPU6050(): boolean {
        // Setup IMU
        if (!MPU6050Initialised) {
            MPU6050Initialised = MINTsparkMpu6050.InitMPU6050(0);
            return MPU6050Initialised;
        }

        return true;
    }
}