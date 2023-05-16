/*
    -----------------------------------
    CODE FOR SENDING SSH COMMANDS TO DEVICE
    -----------------------------------
*/
// Function to execute 'show' commands from stored procedures through SSH.
async function GetCMD(btn){

    // GET DOM objects for button, collapsing card, and result TextArea.
    const commandBtn = document.getElementById(btn.id)
    const collapseToggle = document.getElementById('collapseResult')
    const textDisplay = document.getElementById('cmdDisplay')

    // Set button to show command in progress
    textDisplay.innerHTML = 'Contacting device....'

    // Toggle collapsing card.
    if(!collapseToggle.classList.contains('show')){
        collapseToggle.classList.add('show')
    }

    // Await result of sending command.
    const response = await fetch(commandBtn.dataset.url)
    let cmdResult = await response.json()

    // Display response as string in result TextArea.
    textDisplay.innerHTML = cmdResult.toString()

}

// Function to dynamically create INPUT forms for configuration stored procedures.
async function PostCMD(btn){

    // GET HTML DOM Objects
    const commandBtn = document.getElementById(btn.id)
    const collapseToggle = document.getElementById('collapseConf')

    var confContainer = document.getElementById('cmdCard')
    confContainer.innerHTML = ''

    // Create new H4 and populate title with selected stored procedure name.
    var collapseHeader = document.createElement('h4')
    collapseHeader.innerHTML = btn.innerHTML
    confContainer.appendChild(collapseHeader)
    
    // Toggle collapsing card.
    if(!collapseToggle.classList.contains('show')){
        collapseToggle.classList.add('show')
    }

    // Function to create a dynamic label for newly created HTML DOM Objects.
    function ApplyLabel(comment, labelFor){

        var label = document.createElement('label');
        label.className = 'col-sm-2 control-label';
        label.innerHTML = comment;
        label.for = labelFor;

        return label
    }
    
    // Function to create a dynamic parent DIV for newly created child HTML DOM Objects.
    function CreateDiv(){

        var div = document.createElement('div');
        div.className = 'form-group';
        div.id = 'dynDiv'
        
        return div;
    }

    // Function to create a dynamic parent COL for newly created child HTML FORMS.
    function CreateCol(){
        var col = document.createElement('div');
        col.className = 'col-sm-10';

        return col;
    }

    // Function to dynamically create new Text Input Object
    function CreateInput(type, placeholder){

        var inputRow = document.createElement('input')
        inputRow.className = 'form-control'
        inputRow.type = type
        inputRow.placeholder = placeholder

        return inputRow
    }

    // Check if Configure VLAN stores procedure has been clicked.
    if(commandBtn.dataset.url.includes('vlanconf')){

        // Create new Text Input for VLAN entry, append into dynamically created COL and DIV parents.
        var vlanId = CreateInput('text', '101 - 4094')
        vlanId.id = 'vlanId'
        var newDiv = CreateDiv()

        var newLabel = ApplyLabel('VLAN Id', 'inputText')
        newDiv.appendChild(newLabel);

        var newCol = CreateCol()
        newCol.appendChild(vlanId)

        newDiv.appendChild(newCol)
        confContainer.appendChild(newDiv)

        // Create new Text Input for IP address entry, append into dynamically created COL and DIV parents.
        var ipInput = CreateInput('text', '0.0.0.0')
        ipInput.id = 'vlanIP'
        var newDiv = CreateDiv()

        var newLabel = ApplyLabel('IP Address', 'inputText')
        newDiv.appendChild(newLabel);

        var newCol = CreateCol()
        newCol.appendChild(ipInput)

        newDiv.appendChild(newCol)
        confContainer.appendChild(newDiv)

        // Create new SELECT drop-down for choosing Subnet Mask, append into dynamically created COL and DIV parents.
        var selectSubnet = document.createElement('select')
        selectSubnet.className = 'custom-select'
        selectSubnet.id = 'vlanSelect'
    
        var initialOption = document.createElement("option");
        initialOption.textContent = 'Select subnet mask';
        initialOption.value = null;
    
        selectSubnet.appendChild(initialOption);

        // Code to calculate subnet mask from given bit value inspired by below link.
        // https://stackoverflow.com/questions/27261281/function-for-subnet-mask
        function NetMaskCalc(bits){
            
            let subnetMask = []
            for(var x = 0; x < 4; x++){ // Loop through each octect and calculate binary value.
                let octet = Math.min(bits, 8)
                subnetMask.push(256 - Math.pow(2, 8 - octet)) // Push octect to array
                bits -= octet
            }
            return subnetMask.join('.')
        }

        // Loop through dynamic SELECT menu and insert a value for each possible subnet mask (0 is excluded for this function as it adds an SVI host IP)
        for(var x = 1; x <= 32; x++){

            // Create and append new options with given value
            var newOption = document.createElement("option");
            newOption.textContent = `/${x}`;
            newOption.value = NetMaskCalc(x) // Identify subnet mask from given bit value.

            selectSubnet.appendChild(newOption);
        }

        // Dynamically create DIV, COL, and LABEL for the SELECT menu.
        var newDiv = CreateDiv()
        var newLabel = ApplyLabel('Subnet Mask', 'inputText')
        newDiv.appendChild(newLabel);

        var newCol = CreateCol()
        newCol.appendChild(selectSubnet)

        newDiv.appendChild(newCol)
        confContainer.appendChild(newDiv)

        // Create and insert a button to execute ConfigCMD function.
        var submitBtn = document.createElement('button')
        // Set button attributes.
        submitBtn.className = 'btn btn-primary'
        submitBtn.id = 'vlanBtn'
        submitBtn.type = 'button'
        submitBtn.innerHTML = 'Create SVI'
        submitBtn.dataset.url = btn.dataset.url
        submitBtn.setAttribute("onclick", 'ConfigCMD(this)')

        var newDiv = CreateDiv()

        var newCol = CreateCol()
        newCol.appendChild(submitBtn)

        newDiv.appendChild(newCol)
        confContainer.appendChild(newDiv)
    }
    else {
        // Add further configuration stored procedures here.
    }
}

// Function to send configuration SSH commands to the server and parse response.
async function ConfigCMD(btn){

    const confToggle = document.getElementById('confToggle')

    // Toggle collapsing card.
    if(!confToggle.classList.contains('show')){
        confToggle.classList.add('show')
    }

    // Check if configure VLAN stored procedure has been clicked.
    if(btn.dataset.url.includes('vlanconf')){

        // GET dynamic objects created by PostCMD function.
        let vlanId = document.getElementById('vlanId')
        let ipAddr = document.getElementById('vlanIP')
        let selectOpt = document.getElementById('vlanSelect')
        const textDisplay = document.getElementById('confDisplay')

        let ipCheck = ipAddr.value.split('.') // Split given IP into a list.

        // Check if the IP format and octet values form a valid IP Address.
        let realIP = true
        if(ipCheck.length == 4){
            if(ipCheck[0] >= 1 && ipCheck[0] < 255){

                for(var x = 1; x < (ipCheck.length); x++){
                    if(parseInt(ipCheck[x]) >= 0 && parseInt(ipCheck[x]) < 255){
                        realIP = true
                    }
                    else{
                        realIP = false
                        alert('Invalid IP address')
                    }
                }
            }
            else{
                realIP = false
                alert('Invalid IP address')
            }
            if(realIP){

                // Create object with given values.
                let data = {
                    host: `${ipAddr.value}`,
                    vlanId: `${vlanId.value}`,
                    subMask: `${selectOpt.value}`
                }

                // Submit POST request to server
                const response = await fetch(btn.dataset.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({data}),
                    });

                let cmdResult = await response.json()

                // Reveal hidden text area for results display.
                textDisplay.hidden = false

                // Display response as string in result TextArea.
                textDisplay.innerHTML = cmdResult.toString()
            }
        }
        else{
            realIP = false
            alert('Invalid IP address')
        }
    }
}

// Function to stop any active ICMP sessions when attempting to leave the page.
let active = false
function stopICMP(){

    active = false
}

/*
    -----------------------------------
    CODE FOR HISTORIC TRAFFIC DATA GRAPH
    -----------------------------------
*/

// Function to create graph detailing historic device health data.
function historyGraph(timeWindow, history){

    // ToDo: log scale for the y axis
    const ctx = document.getElementById('historyChart');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.apply(null, {length: timeWindow}).map(Number.call, Number),
        datasets: [{
          label: `${(timeWindow*2)} History`,
          data: history,
          spanGaps: true
        }]
      },
      options: {
        scales:{
            x:{
                display: true
            },
            y:{
                display: true
            }
        },
        spanGaps: true
      }
    });

}

// Function to display historic device health data form given time period.
async function UplinkHistory(btn){

    const uplink = document.getElementById(btn.id)
    const collapseToggle = document.getElementById('collapseExample')

    collapseToggle.classList.toggle('show') // Reveal hidden chart.

    let timeWindow = uplink.id.split('y')
    timeWindow = timeWindow[1] // Set variable to store given time period.

    // GET health data from database.
    const response = await fetch(uplink.dataset.url)
    let historyData = await response.json()

    let history = []
    if(timeWindow <= 288){ // Display last hour of health data.
        for(var x = 0; x < timeWindow; x++){
            
            // If device is up then ICMP result is stores as a float, if it is down then it is a string.
            // This determines if value is a float and then pushes data to array.
            if(parseFloat(historyData[0][x])){
                history.push(historyData[0][x])
            }
            else(
                history.push(0.0001) // Stored data was not a float, stored lowest possible value.
            )
        }
    }
    else{

        /*
        *
        *   Historic data greater than 24 hours is only available on certain devices.
        *   This is because the device needs to be active to populate database.
        *   For demonstration purposes data for any time period >= 24 hours will be randomly generated.
        *         
        */

        // Create new array and fill will 30 slots containing a nested array of size 288.
        historyData = []
        for(var x = 0; x < 30; x++){

            historyData.push([288])

            // Fill each slot of the nested array with random data.
            for(var y = 0; y < historyData[x].length; y++){
                historyData[x][y] = Array.apply(null, {length: 288}).map(Function.call, Math.random)
            }
        }

        // Nested loops used to populate history health data for 24 hour - 30 day periods.
        // For information about the data logic please see diagram under /design/VID-HealthCheck.png
        var z = 0;
        Loop1:
        for(var x = 0; x < historyData.length; x++){

            Loop2:
            for(var y = 0; y < historyData[x].length; y++){
                Loop3:
                for(var n = 0; n < historyData[x][y].length; n++){

                    if(parseFloat(historyData[x][y][n])){
                        history.push(historyData[x][y][n])
                        z += 1
                    }
                    else{
                        history.push(0.0001)
                        z += 1
                    }
                    if(z == timeWindow){
                        x = historyData.length
                        break Loop2
                    }

                }
            }
        }
    }

    // Call history graph function to generate new graph using given time period and data.
    historyGraph(timeWindow, history)
}

/*
    -----------------------------------
    CODE FOR LIVE TRAFFIC GRAPH
    -----------------------------------
*/
async function UplinkStatus(btn){

    active = true
    const uplink = document.getElementById(btn.id);

    const uplinkStatus = document.getElementById('uplink-health');
    const uplinkCheck = document.getElementById('deviceHealth');

    let counter = 0

    let dataStream = []
    let dataTime = []

    const uplinkChart = document.getElementById('uplink-chart').getContext('2d');

    // Set chart display data and labelling information.
    const chartData = {
        labels: dataTime,
        datasets: [{
            data: dataStream,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    }

    // Create new instance of chart and populate with display data.
    const myChart = new Chart(uplinkChart, {
        type: 'line',
        data: chartData,
        options: {
            scales: {
              y: {
                beginAtZero: true
              },
              x: {
                beginAtZero: true,
                display: false
              }
            },
            plugins:{
                legend: {
                    display: false
                }
            }
        }
    })

    const timeInterval = setInterval(async () => { // Run function in intervals of 5 sec
    
        let healthIcon = document.getElementById('deviceHealth')

        if(true && active == true){

            // GET Request to retrieve live traffic data.
            const response = await fetch(uplink.dataset.url)
            const data = await response.json()
        
            // Parse JSON result and amend string to remove artifacts.
            const dataParse = JSON.stringify(data).split(':"')
            dataParse[0] = dataParse[0].replace('{', '')
            dataParse[1] = dataParse[1].replace('"', '').replace('}', '')
        
            // Increment counter
            counter += 1

            // Update device status icons based on last result.
            function UpdateIcon(icon, status){

                if(icon.innerHTML == 'cancel' && status == 1){
                    healthIcon.classList.remove('bad-icon')
                    healthIcon.classList.add('ok-icon')
                    healthIcon.innerHTML = 'check_circle'
                }
                else if(icon.innerHTML == 'check_circle' && status == 0){
                    healthIcon.classList.remove('ok-icon')
                    healthIcon.classList.add('bad-icon')
                    healthIcon.innerHTML = 'cancel'
                }                
            }

            // Switch statement to parse server response and push to datastream.
            let status = 0
            switch(dataParse[1]){
                case 'TO': 
                dataStream.push(parseFloat('0'))
                dataTime.push(parseFloat('0'))
                break;
                case 'CR': 
                dataStream.push(parseFloat('0'))
                dataTime.push(parseFloat('0'))
                break;
                case 'ERR': 
                dataStream.push(parseFloat('0'))
                dataTime.push(parseFloat('0'))
                break;
                default:
                status = 1
                dataStream.push(parseFloat(dataParse[1]))
                dataTime.push(dataParse[0])
            }

            // Update icon with observed result.
            UpdateIcon(healthIcon, status)
            
            if(counter > 10){ // Enables the never-ending scroll effect on graph.

                dataStream.shift()
                dataTime.shift()
            }
            myChart.update()

        }
        else{
            clearInterval(timeInterval) //Clear interval to prevent never-ending loop
        }
    }, 3000); // Set interval time to 3 seconds.
}

/*
    -----------------------------------
    CODE FOR GENERATING SSH LINKS
    -----------------------------------
*/
// Update SSH Link with router information
async function GenerateSSH(btn){
    
    // Get button as a DOM object and set inner HTML to reflect loading stage.
    const link = document.getElementById(btn.id);
    link.innerHTML = 'SSH Session Loading...'

    // Retrieve URL from DOM object and submit GET Request to server
    const response = await fetch(link.dataset.url)
    const data = await response.json()
    
    // Set button href to be the router SSH URL e.g. ssh://user:otp@routerip:{Port}
    if(!data.link.includes(':22')){ // If no port defined, set 2200.
        link.href = `${data.link}:2200`
    }
    else{
        link.href = data.link
    }

    // Call interval function to set countdown timer until expiration
    LinkTimer(data.time, btn.id)
}

// Timed function that runs until OTP expires.
function LinkTimer(time, id){

    // Get button as an oject.
    const link = document.getElementById(id);

    // Run function in intervals of 1 sec
    const timeInterval = setInterval(() => {
        
        if(time >= 0){ // Check if time expired

            //Update display text with remaining time
            link.innerHTML = `SSH Session (TTL: ${time.toString()})`
            link.style.border = '2px'
            time -= 1
        }
        else{
            // Time has expired, remove elements to invalidate button link.
            link.innerHTML = 'Link Expired'
            link.removeAttribute('onclick')
            link.removeAttribute('href')
            link.removeAttribute('data-url')

            //Clear interval to prevent never-ending loop
            clearInterval(timeInterval)
        }
    }, 1000);

}

/*
    -----------------------------------
    CODE FOR WINDOW RE-LOCATION AFTER TABLE INTERACTION
    -----------------------------------
*/
// Function to navigate to the /organisations/:orgId URL
function RedirectOrg(orgId){

    window.location.href = `/organisations/${orgId}`
}

function RedirectSite(orgId, siteId){

    window.location.href = `/organisations/${orgId}/${siteId}`

}

function RedirectNetwork(orgId, siteId, netId){
    window.location.href = `/device/${orgId}/${siteId}/${netId}`
}

/*
    -----------------------------------
    CODE FOR TABLE INTERACTION
    -----------------------------------
*/

function TrClick(tRow){

    let parseId = tRow.id.replace('d', '').split('I')

    let table = "";
    let tableData = {};
    let orgUri = ""
    let siteUri = ""

    switch(parseId[0].toString()){
        case 'trOrg': // User has clicked on the Org Table

            table = document.querySelector(".org-refresh__table")

            tableData = {
                orgId: table.rows.item(parseId[1]).cells.item(0).innerHTML,
                orgAlias: table.rows.item(parseId[1]).cells.item(1).innerHTML
            }

            RedirectOrg(tableData.orgId)

        break;
        case 'trAlert': // User has clicked on the Alert Table
            console.log(`Parse Alias: ${parseId[0]} Parse Id: ${parseId[1]}`)
        break;
        case 'trSite': // User has clicked on the Site Table
            table = document.querySelector(".site-refresh__table")
            orgUri = document.getElementById('orgUri')

            tableData = {
                siteId: table.rows.item(parseId[1]).cells.item(0).innerHTML
            }

            RedirectSite(orgUri.innerHTML.toString(), tableData.siteId)

        break;
        case 'trNet':
            orgUri = document.getElementById('orgUri').innerHTML.toString()
            siteUri = document.getElementById('siteUri').innerHTML.toString()

            table = document.querySelector('.network-refresh__table')

            RedirectNetwork(orgUri, siteUri, table.rows.item(parseId[1]).cells.item(0).innerHTML)
        
        default: // Default TR action 
            console.log(`Parse Alias: ${parseId[0]} Parse Id: ${parseId[1]}`)
    }
}

// Record interaction with table data.
function TdClick(tData){
    console.log(tData)
}

/*
function PagedDataTable(){

    $(`.alert-refresh__table`).DataTable()
    $('.dataTables_length').addClass('bs-select');
}
*/

/*
    -----------------------------------
    CODE FOR ORGANISATION TABLE
    -----------------------------------
*/
// onChange Function to update URI based on Organisation drop down selection
function OrgChange(){

    var orgDropInfo = document.getElementById("orgDropDownId");

    RedirectOrg(orgDropInfo.value)

}

// Update Organisation Table
async function UpdateOrgTable(root){

    root.querySelector(".org-refresh__button").classList.add("org-refresh__button");
    
    // Retrieve JSON from /organisations url
    const response = await fetch(root.dataset.url);
    const data = await response.json()

    const table = root.querySelector(".org-refresh__table");
    table.querySelector("thead tr").innerHTML = "";
    table.querySelector("tbody").innerHTML = "";

    // Populate table with headers
    for(const header of data.headers){
        table.querySelector("thead tr").insertAdjacentHTML("beforeend", `<th>${header}</th>`);
    }
    
    const selectDropOrgId = document.getElementById('orgDropDownId');
    selectDropOrgId.options.length = 0

    var initialOption = document.createElement("option");
    initialOption.textContent = 'Select an organisation...';
    initialOption.value = null;

    selectDropOrgId.appendChild(initialOption);

    // Populate table with rowData
    let i = 1;
    for(const row of data.rows){

        console.log(row)
        var newOption = document.createElement("option");
        newOption.textContent = row[1];
        newOption.value = row[0];

        selectDropOrgId.appendChild(newOption);

        table.querySelector("tbody").insertAdjacentHTML("beforeend", `
            <div class="col-12">
                <tr onclick="TrClick(this);" id="trOrgId${i}">
                    ${row.map(col => `<td onclick="TdClick(this);" value="tdOrgId${i}">${col}</td>`).join("")}
                </tr>
            </div>  
        `);

        i += 1
    }

    selectDropOrgId.addEventListener('change', OrgChange);

    root.querySelector(".org-refresh__label").textContent = `Table last updated: ${new Date().toLocaleString()}`;
    $('#orgDT').DataTable();
}

/*
    -----------------------------------
    CODE FOR SITE TABLE
    -----------------------------------
*/
// onChange Function to update URI based on Site drop down selection
function SiteChange(){

    var siteDropInfo = document.getElementById("siteDropDownId");
    var selectDropOrgId = document.getElementById('orgDropDownId');

    RedirectSite(selectDropOrgId.value, siteDropInfo.value)

}

async function UpdateSiteTable(root){

    root.querySelector(".site-refresh__button").classList.add("site-refresh__button");
    
    // Retrieve JSON from /sites/:orgId url
    const response = await fetch(root.dataset.url);
    const data = await response.json()

    const table = root.querySelector(".site-refresh__table");
    table.querySelector("thead tr").innerHTML = "";
    table.querySelector("tbody").innerHTML = "";

    // Populate table with headers
    for(const header of data.headers){
        console.log(header)
        table.querySelector("thead tr").insertAdjacentHTML("beforeend", `<th>${header}</th>`);
    }
    
    const selectDropSiteId = document.getElementById('siteDropDownId');
    selectDropSiteId.options.length = 0

    var initialOption = document.createElement("option");
    initialOption.textContent = 'Select a site...';
    initialOption.value = null;

    selectDropSiteId.appendChild(initialOption);
    
    // Populate table with rowData
    let i = 1;
    for(const row of data.rows){

        console.log(row)
        var newOption = document.createElement("option");
        newOption.textContent = row[1];
        newOption.value = row[0];

        selectDropSiteId.appendChild(newOption);

        table.querySelector("tbody").insertAdjacentHTML("beforeend", `
            <div class="col-12">
                <tr onclick="TrClick(this);" id="trSiteId${i}">
                    ${row.map(col => `<td onclick="TdClick(this);" value="tdSiteId${i}">${col}</td>`).join("")}
                </tr>
            </div>  
        `);

        i += 1
    }

    selectDropSiteId.addEventListener('change', SiteChange);

    root.querySelector(".site-refresh__label").textContent = `Table last updated: ${new Date().toLocaleString()}`;
    $('#siteDT').DataTable();
}

/*
    -----------------------------------
    CODE FOR NETWORK TABLE
    -----------------------------------
*/
// onChange Function to update URI based on Network drop down selection
function NetworkChange(){

    var selectDropNetId = document.getElementById("networkDropDownId");
    var selectDropOrgId = document.getElementById('orgDropDownId');
    var selectDropSiteId = document.getElementById("siteDropDownId");

    RedirectNetwork(selectDropOrgId.value, selectDropSiteId.value, selectDropNetId.value)

}

async function UpdateNetworkTable(root){

    root.querySelector(".network-refresh__button").classList.add("network-refresh__button");
    
    // Retrieve JSON from /networks/:orgId/:siteId url
    const response = await fetch(root.dataset.url);
    const data = await response.json()

    const table = root.querySelector(".network-refresh__table");
    table.querySelector("thead tr").innerHTML = "";
    table.querySelector("tbody").innerHTML = "";

    // Populate table with headers
    for(const header of data.headers){
        console.log(header)
        table.querySelector("thead tr").insertAdjacentHTML("beforeend", `<th>${header}</th>`);
    }
    
    const selectDropNetworkId = document.getElementById('networkDropDownId');
    selectDropNetworkId.options.length = 0

    var initialOption = document.createElement("option");
    initialOption.textContent = 'Select a network...';
    initialOption.value = null;

    selectDropNetworkId.appendChild(initialOption);

    // Populate table with rowData
    let i = 1;
    for(const row of data.rows){

        console.log(row)
        var newOption = document.createElement("option");
        newOption.textContent = row[1];
        newOption.value = row[0];
        
        selectDropNetworkId.appendChild(newOption);

        table.querySelector("tbody").insertAdjacentHTML("beforeend", `
            <div class="col-12">
                <tr onclick="TrClick(this);" id="trNetId${i}">
                    ${row.map(col => `<td onclick="TdClick(this);" value="tdNetId${i}">${col}</td>`).join("")}
                </tr>
            </div>  
        `);

        i += 1
    }

    selectDropNetworkId.addEventListener('change', NetworkChange);

    root.querySelector(".network-refresh__label").textContent = `Table last updated: ${new Date().toLocaleString()}`;
    $('#networkDT').DataTable();
}

/*
    -----------------------------------
    CODE TO CHECK CURRENT VIEW AND UPDATE AVAILABLE TABLES
    -----------------------------------
*/

if(document.querySelectorAll(".org-refresh[data-url]").length > 0){

    // Create Org Table and then call function to populate it
    for (const root of document.querySelectorAll(".org-refresh[data-url]")){

        // Create table element
        const table = document.createElement("table");
        table.setAttribute('id', 'orgDT')
        table.classList.add("org-refresh__table");
        table.setAttribute("style", "table-layout:fixed;")
        table.innerHTML = `
        <div class="container-fluid">
            <thead>
                <tr></tr>
            </thead>
            <tbody>
                <tr onclick="TrClick(this);">
                    <td onclick="TdClick(this);">Loading</td>
                </tr>
            </tbody>    
        </div>        
        `;
        
        // Create div element
        const options = document.createElement("div");
        options.classList.add("org-refresh__options");
        options.innerHTML = `
            <span class="org-refresh__label">Table last updated: never</span>
            <button type="button" class="org-refresh__button">
                <i class="material-icons":>refresh</i>
                </button>
        `;

        // Push div and table to original div
        root.append(table, options)
        
        // Add OnClick function to button that refreshes Organisation list
        options.querySelector(".org-refresh__button").addEventListener("click", () => {
            UpdateOrgTable(root)
        })

        UpdateOrgTable(root); // Call function to populate table from /organisations
    }

    // Code used to update alert table
    async function UpdateAlertTable(root){

        root.querySelector(".alert-refresh__button").classList.add("alert-refresh__button");
    
        // Retrieve JSON from /organisations url
        const response = await fetch(root.dataset.url);
        const data = await response.json()
    
        const table = root.querySelector(".alert-refresh__table");
        table.querySelector("thead tr").innerHTML = "";
        table.querySelector("tbody").innerHTML = "";
    
        // Populate table with headers
        for(const header of data.headers){
            table.querySelector("thead tr").insertAdjacentHTML("beforeend", `<th>${header}</th>`);
        }
        console.log(`Type of Data: ${typeof(data)}`)
        console.log(`Type of Data rows: ${typeof(data.rows)}`)

        // Populate table with rowData
        let i = 1;
        for(const row of data.rows){
    
            table.querySelector("tbody").insertAdjacentHTML("beforeend", `
                <div class="col-12">
                    <tr onclick="TrClick(this);" id="trAlertId${i}">
                        ${row.map(col => `<td onclick="TdClick(this);" value="tdAlertId${i}">${col}</td>`).join("")}
                    </tr>
                </div>  
            `);
    
            i += 1
        }
    
        root.querySelector(".alert-refresh__label").textContent = `Table last updated: ${new Date().toLocaleString()}`;
        $('#alertDT').DataTable({order: [[0, 'desc']]});
    }

    // Create Alert Table and then call function to populate it
    for(const root of document.querySelectorAll(".alert-refresh[data-url]")){

        // Create table element
        const table = document.createElement("table");
        table.setAttribute('id', 'alertDT')
        table.classList.add("alert-refresh__table");
        table.setAttribute("style", "table-layout:fixed;")
        table.innerHTML = `
        <div class="container-fluid">
            <thead>
                <tr></tr>
            </thead>
            <tbody>
                <tr onclick="TrClick(this);">
                    <td onclick="TdClick(this);">Loading</td>
                </tr>
            </tbody>    
        </div>        
        `;
        
        // Create div element
        const options = document.createElement("div");
        options.classList.add("alert-refresh__options");
        options.innerHTML = `
            <span class="alert-refresh__label">Table last updated: never</span>
            <button type="button" class="alert-refresh__button">
                <i class="material-icons":>refresh</i>
                </button>
        `;

        // Push div and table to original div
        root.append(table, options)
        
        // Add OnClick function to button that refreshes Organisation list
        options.querySelector(".alert-refresh__button").addEventListener("click", () => {
            UpdateAlertTable(root)
        })

        UpdateAlertTable(root);
    }

}
else if (document.querySelectorAll(".site-refresh[data-url]").length > 0){

    // Create Org Table and then call function to populate it
    for (const root of document.querySelectorAll(".site-refresh[data-url]")){

        // Create table element
        const table = document.createElement("table");
        table.setAttribute('id', 'siteDT')
        table.classList.add("site-refresh__table");
        table.setAttribute("style", "table-layout:fixed;")
        table.innerHTML = `
        <div class="container-fluid">
            <thead>
                <tr></tr>
            </thead>
            <tbody>
                <tr onclick="TrClick(this);">
                    <td onclick="TdClick(this);">Loading</td>
                </tr>
            </tbody>    
        </div>        
        `;
        
        // Create div element
        const options = document.createElement("div");
        options.classList.add("site-refresh__options");
        options.innerHTML = `
            <span class="site-refresh__label">Table last updated: never</span>
            <button type="button" class="site-refresh__button">
                <i class="material-icons":>refresh</i>
                </button>
        `;

        // Push div and table to original div
        root.append(table, options)
        
        // Add OnClick function to button that refreshes Organisation list
        options.querySelector(".site-refresh__button").addEventListener("click", () => {
            UpdateSiteTable(root)
        })

        UpdateSiteTable(root); // Call function to populate table from /organisations
    }
}
else if (document.querySelectorAll(".network-refresh[data-url]").length > 0){

        // Create Network Table and then call function to populate it
        for (const root of document.querySelectorAll(".network-refresh[data-url]")){

            // Create table element
            const table = document.createElement("table");
            table.setAttribute('id', 'networkDT')
            table.classList.add("network-refresh__table");
            table.setAttribute("style", "table-layout:fixed;")
            table.innerHTML = `
            <div class="container-fluid">
                <thead>
                    <tr></tr>
                </thead>
                <tbody>
                    <tr onclick="TrClick(this);">
                        <td onclick="TdClick(this);">Loading</td>
                    </tr>
                </tbody>    
            </div>        
            `;
            
            // Create div element
            const options = document.createElement("div");
            options.classList.add("network-refresh__options");
            options.innerHTML = `
                <span class="network-refresh__label">Table last updated: never</span>
                <button type="button" class="network-refresh__button">
                    <i class="material-icons":>refresh</i>
                    </button>
            `;
    
            // Push div and table to original div
            root.append(table, options)
            
            // Add OnClick function to button that refreshes Organisation list
            options.querySelector(".network-refresh__button").addEventListener("click", () => {
                UpdateNetworkTable(root)
            })
    
            UpdateNetworkTable(root); // Call function to populate table from /organisations
        }
}
else{
    
    const uplinkStatus = document.getElementById('deviceHealth')

    if(uplinkStatus.innerHTML == 'check_circle'){
        uplinkStatus.className += ' ok-icon'
    }
    else {
        uplinkStatus.className += ' bad-icon'
    }

    const deviceType = document.getElementById('device-type')

    if(deviceType.dataset.url == 'WAN'){ // Check if device is WAN or LAN
        const uplinkBtn = document.getElementById('uplink-btn')
        uplinkBtn.click()
    }
    else{
        const uplinkCard = document.getElementById('uplink-card').remove()
    }

    if (document.querySelectorAll(".alert-refresh[data-url]").length > 0){


            // Code used to update alert table
        async function UpdateAlertTable(root){

            root.querySelector(".alert-refresh__button").classList.add("alert-refresh__button");
        
            // Retrieve JSON from /organisations url
            const response = await fetch(root.dataset.url);
            const data = await response.json()
        
            const table = root.querySelector(".alert-refresh__table");
            table.querySelector("thead tr").innerHTML = "";
            table.querySelector("tbody").innerHTML = "";
        
            // Populate table with headers
            for(const header of data.headers){
                table.querySelector("thead tr").insertAdjacentHTML("beforeend", `<th>${header}</th>`);
            }
            console.log(`Type of Data: ${typeof(data)}`)
            console.log(`Type of Data rows: ${typeof(data.rows)}`)

            // Populate table with rowData
            let i = 1;
            for(const row of data.rows){
        
                table.querySelector("tbody").insertAdjacentHTML("beforeend", `
                    <div class="col-12">
                        <tr onclick="TrClick(this);" id="trAlertId${i}">
                            ${row.map(col => `<td onclick="TdClick(this);" value="tdAlertId${i}">${col}</td>`).join("")}
                        </tr>
                    </div>  
                `);
        
                i += 1
            }
        
            root.querySelector(".alert-refresh__label").textContent = `Table last updated: ${new Date().toLocaleString()}`;
            $('#alertDT').DataTable({order: [[0, 'desc']]});
        }

        // Create Alert Table and then call function to populate it
        for(const root of document.querySelectorAll(".alert-refresh[data-url]")){

            // Create table element
            const table = document.createElement("table");
            table.setAttribute('id', 'alertDT')
            table.classList.add("alert-refresh__table");
            table.setAttribute("style", "table-layout:fixed;")
            table.innerHTML = `
            <div class="container-fluid">
                <thead>
                    <tr></tr>
                </thead>
                <tbody>
                    <tr onclick="TrClick(this);">
                        <td onclick="TdClick(this);">Loading</td>
                    </tr>
                </tbody>    
            </div>        
            `;
            
            // Create div element
            const options = document.createElement("div");
            options.classList.add("alert-refresh__options");
            options.innerHTML = `
                <span class="alert-refresh__label">Table last updated: never</span>
                <button type="button" class="alert-refresh__button">
                    <i class="material-icons":>refresh</i>
                    </button>
            `;

            // Push div and table to original div
            root.append(table, options)
            
            // Add OnClick function to button that refreshes Organisation list
            options.querySelector(".alert-refresh__button").addEventListener("click", () => {
                UpdateAlertTable(root)
            })

            UpdateAlertTable(root);
        }

    }

}
