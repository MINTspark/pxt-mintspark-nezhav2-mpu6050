//% weight=100 color=#DC22E1 block="MINTspark NeZha V2" blockId="MINTspark NeZha V2" icon="\uf0e7" //%
//% subcategories='["Motor / Servo", "Robot Tank Drive"]'
//% groups='["Motor Functions", "Servo Functions", "Information", "Setup", "Movement", "Movement MPU6050"]'
namespace ms_nezhaV2 {
    /*
     * NeZha V2
     */
    let MPU6050Initialised = false;
    let currentSpeedL = 0;
    let currentSpeedR = 0;

    function setSpeed(direction: LinearDirection, speed: number):number
    {
        speed = Math.abs(speed);
        speed = speed > 80 ? 80 : speed;
        speed = (direction == LinearDirection.Forward) ? speed : -speed;
        return speed;
    }

    //% weight=10
    //% block="Gyro drive %direction speed %speed"
    //% subcategory="Robot Tank Drive"
    //% group="Movement MPU6050"
    //% speed.min=1 speed.max=100 speed.defl=30
    //% color=#6e31c4
    //% inlineInputMode=inline
    export function driveTankModeSingleSpeedGyro(direction: LinearDirection, speed: number): void {
        speed = setSpeed(direction, speed);

        // Setup IMU, exit if not initialised
        if (!setupAndCalibrateMPU6050()) {
            return;
        }

        // Drive with PID Control
        control.inBackground(() => {
            let startTime = input.runningTime();
            let getCurrentValue = () => input.runningTime() - startTime;
            driveTankModeSingelSpeedGyroPidToTarget(speed, 60000, getCurrentValue);
        })
    }

    //% weight=9
    //% block="Gyro drive %direction speed %speed for %value %mode"
    //% subcategory="Robot Tank Drive"
    //% group="Movement MPU6050"
    //% speed.min=1 speed.max=100 speed.defl=30
    //% expandableArgumentMode="toggle"
    //% color=#6e31c4
    //% inlineInputMode=inline
    export function driveTankModeSingleSpeedGyroFor(direction: LinearDirection, speed: number, value: number, mode: MotorMovementMode): void {
        speed = setSpeed(direction, speed);

        // Setup IMU, exit if not initialised
        if (!setupAndCalibrateMPU6050()) {
            return;
        }

        let target = 0;
        let getCurrentValue: () => number;
        let startTime = input.runningTime();
        let startDegrees = readServoAbsolutePositionAggregate(tankMotorLeft)

        switch (mode) {
            case MotorMovementMode.Seconds:
                target = value * 1000;
                getCurrentValue = () => input.runningTime() - startTime;
                break;
            case MotorMovementMode.Degrees:
                target = value;
                getCurrentValue = () => Math.abs(readServoAbsolutePositionAggregate(tankMotorLeft) - startDegrees);
                break;
            case MotorMovementMode.Turns:
                target = value * 360;
                getCurrentValue = () => Math.abs(readServoAbsolutePositionAggregate(tankMotorLeft) - startDegrees);
                break;
        }

        // Drive with PID Control
        driveTankModeSingelSpeedGyroPidToTarget(speed, target, getCurrentValue);
    }


    //% weight=8
    //% block="Gyro drive %direction speed %speed for %distance %distanceUnit"
    //% subcategory="Robot Tank Drive"
    //% group="Movement MPU6050"
    //% speed.min=1 speed.max=100 speed.defl=30
    //% expandableArgumentMode="toggle"
    //% color=#6e31c4
    //% inlineInputMode=inline
    export function driveTankModeSingleSpeedGyroForDistance(direction: LinearDirection, speed: number, distance: number, distanceUnit: DistanceUnint): void {
        speed = setSpeed(direction, speed);

        // Setup IMU, exit if not initialised
        if (!setupAndCalibrateMPU6050()) {
            return;
        }

        // Calculate required degrees for distance
        let distMm = (distanceUnit == DistanceUnint.Cm) ? distance * 10 : distance * 10 * 2.54;
        let target = distMm * wheelLinearDegreePerMm;
        let startDegrees = readServoAbsolutePositionAggregate(tankMotorLeft)
        let getCurrentValue = () => Math.abs(readServoAbsolutePositionAggregate(tankMotorLeft) - startDegrees);

        // Drive with PID Control
        driveTankModeSingelSpeedGyroPidToTarget(speed, target, getCurrentValue);
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

    function driveTankModeSingelSpeedGyroPidToTarget(speed: number, target: number, getCurrentValue: () => number): void {
        if (speed == 0) return;
        robotTankModeMovementChange = false;

        let lastUpdateTime = input.runningTime();
        let Kp = 3; let Ki = 0.05; let Kd = 0.5;
        let pidController = new MINTsparkMpu6050.PIDController();
        pidController.setPoint(MINTsparkMpu6050.UpdateMPU6050().orientation.yaw);
        let speedL = speed;
        let speedR = speed;

        // Start movement
        pidDriveTankDualSpeed(speedL, speedR, 500)
        
        while (getCurrentValue() < target) {
            if (robotTankModeMovementChange) break;

            let updateTime = input.runningTime();
            let pidCorrection = pidController.compute(updateTime - lastUpdateTime, MINTsparkMpu6050.UpdateMPU6050().orientation.yaw);
            lastUpdateTime = updateTime;

            speedL = Math.constrain(speed + pidCorrection, -100, 100);
            speedR = Math.constrain(speed - pidCorrection, -100, 100);

            // Change motor speed
            if (robotTankModeMovementChange) break;
            pidDriveTankDualSpeed(speedL, speedR);

            basic.pause(10);
        }

        pidDriveTankDualSpeed(0, 0);
    }

    //% subcategory="Robot Tank Drive"
    //% group="Movement MPU6050"
    //% block="Gyro spot-turn %turn for angle %angle || with speed %speed"
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% speed.min=10 speed.max=100 speed.defl=25 angle.min=1 angle.max=200 angle.defl=90
    //% weight=7
    //% color=#6e31c4
    export function turnTankModeGyro(turn: TurnDirection, angle: number, speed?: number): void {
        robotTankModeMovementChange = true;

        if (speed < 20) {
            speed = 20;
        }

        let tmLSpeed = speed;
        let tmRSpeed = speed;
        if (turn == TurnDirection.Right) { tmRSpeed = -tmRSpeed; } else { tmLSpeed = -tmLSpeed; }

        // Setup IMU, exit if not initialised
        if (!setupAndCalibrateMPU6050()) {
            return;
        }

        let startTime = input.runningTime();
        let startHeading = MINTsparkMpu6050.UpdateMPU6050().orientation.yaw360;
        let previousHeading = startHeading;
        let totalChange = 0;

        pidDriveTankDualSpeed(tmLSpeed, tmRSpeed);
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

        pidDriveTankDualSpeed(0, 0);
    }

    function pidDriveTankDualSpeed(speedLeft: number, speedRight: number, rampTimeMs: number = 0): void {
        let tmLSpeed = tankMotorLeftReversed ? -speedLeft : speedLeft;
        let tmRSpeed = tankMotorRightReversed ? -speedRight : speedRight;

        // Ramp speed if required
        if (rampTimeMs > 0)
        {
            rampSpeed(tmLSpeed, tmRSpeed, rampTimeMs)
        }
        else
        {
            runMotor(tankMotorLeft, tmLSpeed);
            runMotor(tankMotorRight, tmRSpeed);
        }

        currentSpeedL = tmLSpeed;
        currentSpeedR = tmRSpeed;
    }

    function rampSpeed(speedL: number, speedR: number, rampTimeMs: number)
    {
        if (currentSpeedL == 0 && currentSpeedR == 0)
        {
            currentSpeedL = Math.round(speedL * 0.2);
            currentSpeedR = Math.round(speedR * 0.2);
            runMotor(tankMotorRight, currentSpeedR);
            runMotor(tankMotorLeft, currentSpeedL);
        }

        let startTime = input.runningTime();
        let endTime = startTime + rampTimeMs;
        let rangeL = speedL - currentSpeedL;
        let rangeR = speedR - currentSpeedR;
        let upperBoundaryL = Math.abs(rangeL);
        let upperBoundaryR = Math.abs(rangeR);
        let counter = 0;

        while (input.runningTime() < endTime)
        {
            basic.pause(50);
            let timeNow = input.runningTime();
            let offsetL = Math.map(timeNow, startTime, endTime, 0, upperBoundaryL);
            let offsetR = Math.map(timeNow, startTime, endTime, 0, upperBoundaryR);

            offsetL = rangeL < 0 ? -offsetL : offsetL;
            offsetR = rangeR < 0 ? -offsetR : offsetR;

            if (counter % 2 == 0)
            {
                runMotor(tankMotorLeft, currentSpeedL + offsetL);
                runMotor(tankMotorRight, currentSpeedR + offsetR);
            }
            else
            {
                runMotor(tankMotorRight, currentSpeedR + offsetR);
                runMotor(tankMotorLeft, currentSpeedL + offsetL);
            }
            
            counter++;
        }

        runMotor(tankMotorLeft, speedL);
        runMotor(tankMotorRight, speedR);
    }
}