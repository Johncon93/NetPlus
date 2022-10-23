/* Client side JavaScript */


function TrClick(tRow){

    let parseId = tRow.id.replace('d', '').split('I')

    switch(parseId[0].toString()){
        case 'trOrg': // User has clicked on the Org Table
            alert(`User has clicked on the Org Table \nParse Alias: ${parseId[0]} Parse Index: ${parseId[1]}`)
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
    let i = 0;
    for(const row of data.rows){

        table.querySelector("tbody").insertAdjacentHTML("beforeend", `
            <div class="col-12">
                <tr onclick="TrClick(this);" id="trOrgId${i}">
                    ${row.map(col => `<td onclick="TdClick(this);" value="${i}">${col}</td>`).join("")}
                </tr>
            </div>  
        `);

        i += 1
    }

    root.querySelector(".org-refresh__label").textContent = `Table last updated: ${new Date().toLocaleString()}`;
}

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