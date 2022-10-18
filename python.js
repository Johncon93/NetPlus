exports.CallPython = (command, target) => {

    const spawner = require('child_process').spawnSync;

    const pyProcess = spawner("python3", ["python.py", command, target]);

    let response = pyProcess.stdout;

    console.log(response.toString())

    return response.toString();
}