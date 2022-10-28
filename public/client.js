/* Client side JavaScript */

// Function to navigate to the /organisations/:orgId URL
function RedirectOrg(orgId){

    window.location.href = `/organisations/${orgId}`
}

function TrClick(tRow){

    let parseId = tRow.id.replace('d', '').split('I')

    switch(parseId[0].toString()){
        case 'trOrg': // User has clicked on the Org Table

            const table = document.querySelector(".org-refresh__table")

            const tableData = {
                orgId: table.rows.item(parseId[1]).cells.item(0).innerHTML,
                orgAlias: table.rows.item(parseId[1]).cells.item(1).innerHTML
            }

            RedirectOrg(tableData.orgId)

        break;
        case 'trAlert': // User has clicked on the Alert Table
            console.log(`Parse Alias: ${parseId[0]} Parse Id: ${parseId[1]}`)
        break;
        default: // Default TR action 
            console.log(`Parse Alias: ${parseId[0]} Parse Id: ${parseId[1]}`)
    }
}

function TdClick(tData){

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
        console.log(header)
        table.querySelector("thead tr").insertAdjacentHTML("beforeend", `<th>${header}</th>`);
    }
    
    // Populate table with rowData
    let i = 1;
    for(const row of data.rows){

        table.querySelector("tbody").insertAdjacentHTML("beforeend", `
            <div class="col-12">
                <tr onclick="TrClick(this);" id="trOrgId${i}">
                    ${row.map(col => `<td onclick="TdClick(this);" value="tdOrgId${i}">${col}</td>`).join("")}
                </tr>
            </div>  
        `);

        i += 1
    }

    root.querySelector(".org-refresh__label").textContent = `Table last updated: ${new Date().toLocaleString()}`;
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
    
    // Populate table with rowData
    let i = 1;
    for(const row of data.rows){

        table.querySelector("tbody").insertAdjacentHTML("beforeend", `
            <div class="col-12">
                <tr onclick="TrClick(this);" id="trSiteId${i}">
                    ${row.map(col => `<td onclick="TdClick(this);" value="tdSiteId${i}">${col}</td>`).join("")}
                </tr>
            </div>  
        `);

        i += 1
    }

    root.querySelector(".site-refresh__label").textContent = `Table last updated: ${new Date().toLocaleString()}`;
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

    /*
    // Code used to update alert table
    async function UpdateAlertTable(root){

    }

    // Create Alert Table and then call function to populate it
    for(const root of document.querySelectorAll(".alert-refresh[data-url]")){


        UpdateAlertTable(root);
    }
    */
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
else if (document.querySelectorAll(".net-refresh[data-url]").length > 0){

}
else{
    console.log(`Table not found.`)
}
