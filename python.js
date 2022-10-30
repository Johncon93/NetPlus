const spawner = require('child_process').spawnSync;

// Launch child process to send commands to a target device using ssh
exports.CallDevice = (command, target) => {

    const pyProcess = spawner("python3", ["python.py", command, target]);

    let response = pyProcess.stdout;

    console.log(response.toString())

    return response.toString();
}

// Launch child process to get otp
exports.CallOTP = (secret) => {

    const pyProcess = spawner("python3", ["otp.py", secret]);

    let response = pyProcess.stdout;

    return response.toString();

}