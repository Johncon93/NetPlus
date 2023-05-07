/*
    -----------------------------------
    SYNCHRONOUS CHILD PROCESSES
    -----------------------------------
*/

// Define Synchronous child process
const spawner = require('child_process').spawnSync;

// Launch child process to send commands to a target device using ssh.
exports.CallDevice = (command, target) => {

    const pyProcess = spawner("python3", ["./controllers/SSH-Controller.py", command, target]);
    let response = pyProcess.stdout;

    console.log(response.toString())

    return response.toString();
}

exports.ConfigureDevice = (command, target) => {
    
}

// Launch child process to get otp
exports.CallOTP = (secret) => {

    const pyProcess = spawner("python3", ['./controllers/OTP-Controller.py', secret]);
    let response = pyProcess.stdout;

    return response.toString();

}

// Launch child process to iniitate SYSLOG Controller
exports.InitSYSLOG = () => {

    let result = []

    try{
        const { exec } = require('node:child_process');
        exec('python3 ./controllers/SYSLOG-Controller.py');
        result = [true, `SYSLOG Initiated`]

    }
    catch(error){
        result = [false, error.toString()]
    }

    return result;
}

// Launch Uplink health session - sends polling ICMP packets to target host until cancelled.
exports.UplinkHealth = (host) => {

    try{
        const pyProcess = spawner("python3", ["./controllers/ICMP-Controller.py", host]);
        let response = pyProcess.stdout;
    
        return response.toString();
    }
    catch(error){

        return(error.toString())
    }
}

/*
    -----------------------------------
    ASYNCHRONOUS CHILD PROCESSES
    -----------------------------------
*/

// Launch child process to initiate Health Check Controller
exports.InitHealth = () => {

    let result = []

    try{
        const { exec } = require('node:child_process');
        exec('python3 ./controllers/HealthCheck-Controller.py');
        result = [true, `ICMP Initiated`]

    }
    catch(error){
        result = [false, error.toString()]
    }

    return result;
}

// Launch child process to iniitate BGP Controller
exports.InitBGP = () => {

    let result = []

    try{
        // Run Exabgp Python application to translate JSON into BGP messages.
        const { exec } = require('node:child_process');
        exec('"./exabgp-git/sbin/exabgp" ./exabgp-git/sbin/conf.ini');
        result = [true, "BGP Initiated"]
    }
    catch(error){
        result = [false, error.toString()]
    }

    return result;
}