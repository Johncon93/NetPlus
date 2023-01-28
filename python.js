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
// Launch child process to iniitate SYSLOG Controller
exports.InitSYSLOG = () => {

    let result = []

    try{
        const { exec } = require('node:child_process');
        exec('python3 ./controllers/SYSLOG-Controller.py');
        result = [true, `SYSLOG: True`]

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
        const { exec } = require('node:child_process');
        exec('"./exabgp-git/sbin/exabgp" ./exabgp-git/sbin/conf.ini');
        result = [true, "BGP Initiated"]
    }
    catch(error){
        result = [false, error.toString()]
    }

    return result;
}

exports.UplinkHealth = (host) => {

    try{
        const pyProcess = spawner("python3", ["uplink.py", host]);

        let response = pyProcess.stdout;
    
        return response.toString();
    }
    catch(error){

        return(error.toString())
    }
}