/* Client side JavaScript */


async function UplinkStatus(btn){

    const uplink = document.getElementById(btn.id);

    const uplinkStatus = document.getElementById('uplink-health');

    let counter = 0

    let dataStream = []
    let dataTime = []

    const uplinkChart = document.getElementById('uplink-chart').getContext('2d');

    const chartData = {
        labels: dataTime,
        datasets: [{
            data: dataStream,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    }

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
        
        if(counter < 100){
            const response = await fetch(uplink.dataset.url)

            const data = await response.json()
        
            const dataParse = JSON.stringify(data).split(':"')
            dataParse[0] = dataParse[0].replace('{', '')
            dataParse[1] = dataParse[1].replace('"', '').replace('}', '')
        
            //uplinkStatus.innerHTML += `Time: ${dataParse[0]} Status: ${dataParse[1]}\n`
            counter += 1

            switch(dataParse[1]){
                case 'TO': dataStream.push(0)
                break;
                case 'CR': dataStream.push(0)
                break;
                case 'ERR': dataStream.push(0)
                break;
                default:
                dataStream.push(parseFloat(dataParse[1]))
                dataTime.push(dataParse[0])
            }

            if(counter > 10){

                dataStream.shift()
                dataTime.shift()
            }
            myChart.update()

        }
        else{
            clearInterval(timeInterval) //Clear interval to prevent never-ending loop
        }
    }, 3000);

}

// Update SSH Link with router information
async function GenerateSSH(btn){
    
    console.log(btn.id)
    const link = document.getElementById(btn.id);
    link.innerHTML = 'SSH Session Loading...'
    const response = await fetch(link.dataset.url)
    const data = await response.json()
    
    //ToDo add a log function that records every link generated, by who and at what time.
    link.href = data.link // Set href data to be the router SSH URL e.g. ssh://user:otp@routerip

    LinkTimer(data.time, btn.id) // Call interval function to set countdown timer until expiration
}

function LinkTimer(time, id){

    const link = document.getElementById(id);

    const timeInterval = setInterval(() => { // Run function in intervals of 1 sec
        
        if(time >= 0){ // Check if time expired

            link.innerHTML = `SSH Session (TTL: ${time.toString()})` //Update display text with remaining time
            link.style.border = '2px'
            time -= 1
        }
        else{
            // Time has expired, remove elements to invalidate link
            link.innerHTML = 'Link Expired'
            link.removeAttribute('onclick')
            link.removeAttribute('href')
            link.removeAttribute('data-url')
            // Add onClick function here which logs if the button has been clicked, by who and what time.
            clearInterval(timeInterval) //Clear interval to prevent never-ending loop
        }
    }, 1000);

}

// Function to navigate to the /organisations/:orgId URL
function RedirectOrg(orgId){

    window.location.href = `/organisations/${orgId}`
}

function RedirectSite(orgId, siteId){

    window.location.href = `/organisations/${orgId}/${siteId}`

}


// Load device page for target network.
function RedirectNetwork(orgId, siteId, netId){
    window.location.href = `/device/${orgId}/${siteId}/${netId}`
}

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

            RedirectSite(orgUri.innerHTML.toString().replace('/', ''), tableData.siteId)

        break;
        case 'trNet':
            siteUri = document.getElementById('siteUri').innerHTML.toString()
            siteUri = siteUri.replace('/', '')
            siteUri = siteUri.split('/')

            table = document.querySelector('.network-refresh__table')
            //console.log(`Network: ${table.rows.item(parseId[1]).cells.item(0).innerHTML}`)

            //console.log(`Org: ${siteUri[0]}, Site: ${siteUri[1]}, Network: ${table.rows.item(parseId[1]).cells.item(0).innerHTML}`)
            RedirectNetwork(siteUri[0], siteUri[1], table.rows.item(parseId[1]).cells.item(0).innerHTML)
        
        default: // Default TR action 
            console.log(`Parse Alias: ${parseId[0]} Parse Id: ${parseId[1]}`)
    }
}

function TdClick(tData){

}

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
}

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
}

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
}

if(document.querySelectorAll(".org-refresh[data-url]").length > 0){

    // Create Org Table and then call function to populate it
    for (const root of document.querySelectorAll(".org-refresh[data-url]")){

        // Create table element
        const table = document.createElement("table");
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

    }

    // Create Alert Table and then call function to populate it
    for(const root of document.querySelectorAll(".alert-refresh[data-url]")){

        // Create table element
        const table = document.createElement("table");
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
    console.log(`Table not found.`)
}
