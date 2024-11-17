//% weight=100 color=#DC22E1 block="MINTspark Inventor V2" blockId="MINTspark Inventor V2" icon="\uf0e7"
namespace ms_nezhaV2 {
    /*
     * NeZha V2
     */
    let MPU6050Initialised = false;

    //% weight=37
    //% block="Gyro drive %direction speed %speed"
    //% subcategory="Robot Tank Drive"
    //% group="Gyro Movement"
    //% speed.min=1 speed.max=100
    //% color=#6e31c4
    export function driveTankModeSingleSpeedGyro(direction: LinearDirection, speed: number): void {
        speed = Math.abs(speed);
        speed = (direction == LinearDirection.Forward) ? speed : -speed;

        // Setup IMU, exit if not initialised
        if (!setupAndCalibrateMPU6050()) {
            return;
        }

        // Drive with PID Control
        control.inBackground(() => {
            driveTankModeSingelSpeedGyroPid(speed, 60000, MotorMovementMode.Seconds);
        })
    }

    //% weight=37
    //% block="Gyro drive %direction speed %speed for %value %mode"
    //% subcategory="Robot Tank Drive"
    //% group="Gyro Movement"
    //% speed.min=1 speed.max=100
    //% expandableArgumentMode="toggle"
    //% color=#6e31c4
    export function driveTankModeSingleSpeedGyroFor(direction: LinearDirection, speed: number, value: number, mode: MotorMovementMode): void {
        speed = Math.abs(speed);
        speed = (direction == LinearDirection.Forward) ? speed : -speed;

        // Setup IMU, exit if not initialised
        if (!setupAndCalibrateMPU6050()) {
            return;
        }

        // Drive with PID Control
        driveTankModeSingelSpeedGyroPid(speed, value, mode);
    }

    function setupAndCalibrateMPU6050() : boolean{
        // Setup IMU
        if (!MPU6050Initialised) {
            MPU6050Initialised = MINTsparkMpu6050.InitMPU6050(0);
        }

        // Calibrate
        if (MPU6050Initialised)
        {
            // Calibrate 6050 sensor for 1 second (robot must remain still during this period)
            MINTsparkMpu6050.Calibrate(1);
            return true;
        }

        return false;
    }

    function driveTankModeSingelSpeedGyroPid(speed: number, value: number, mode: MotorMovementMode):void{
        if (speed == 0) return;
        newMotorMovement = false;
        let target = 0;
        let currentValue = 0;

        switch(mode)
        {
            case MotorMovementMode.Seconds:
                target = value * 1000;
                break;
            case MotorMovementMode.Degrees:
                target = value;
                break;
            case MotorMovementMode.Turns:
                target = value * 360;
                break;
        }

        let startTime = input.runningTime();
        let lastUpdateTime = startTime;
        let Kp = 10; let Ki = 0.05; let Kd = 0.5;

        let pidController = new MINTsparkMpu6050.PIDController();
        pidController.setGains(Kp, Ki, Kd);
        pidController.setPoint(MINTsparkMpu6050.UpdateMPU6050().orientation.yaw);
        let speedL = speed;
        let speedR = speed;

        // Start movement
        driveTankDualSpeed(speedL / 2, speedR / 2);

        while (input.runningTime() - startTime < target) {
            if (newMotorMovement) break;

            let updateTime = input.runningTime();
            let pidCorrection = pidController.compute(updateTime - lastUpdateTime, MINTsparkMpu6050.UpdateMPU6050().orientation.yaw);
            lastUpdateTime = updateTime;

            speedL = Math.constrain(speed + pidCorrection, 0, 100);
            speedR = Math.constrain(speed - pidCorrection, 0, 100);

            // Change motor speed
            if (newMotorMovement) break;
            driveTankDualSpeed(speedL, speedR);

            basic.pause(10);

            if (mode == MotorMovementMode.Seconds)
            {
                currentValue = input.runningTime() - startTime;
            }
            else
            {
                
            }
        }

        stopTank();
    }

    //% subcategory="Robot Tank Drive"
    //% group="Gyro Movement"
    //% block="Gyro spot-turn %turn for angle %angle || with speed %speed"
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% speed.min=10 speed.max=100 speed.defl=25 angle.min=1 angle.max=200 angle.defl=90
    //% weight=25
    //% color=#6e31c4
    export function turnTankModeGyro(turn: TurnDirection, angle: number, speed?: number): void {
        newMotorMovement = true;

        if (speed == null) {
            speed = 15;
        }

        let tmLSpeed = speed;
        let tmRSpeed = speed;
        if (turn == TurnDirection.Right) { tmRSpeed = -tmRSpeed; } else { tmLSpeed = -tmLSpeed; }

        // Setup IMU, exit if not initialised
        if (!setupAndCalibrateMPU6050()) {
            return;
        }

        MINTsparkMpu6050.Calibrate(1);

        let startTime = input.runningTime();
        let startHeading = MINTsparkMpu6050.UpdateMPU6050().orientation.yaw360;
        let previousHeading = startHeading;
        let totalChange = 0;

        driveTankDualSpeed(tmLSpeed, tmRSpeed);
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

        stopTank();
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
}