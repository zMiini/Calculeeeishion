function calculateMaxItems() {
    // --- 1. Define Constants and Get Inputs ---
    
    const RESOURCES_PER_ITEM = {
        GRAY: 86,
        GREEN: 45,
        BLUE: 33
    };

    const POWDER_PER_BLUE = 10;
    const GRAY_EXCHANGE_COST = 100;
    const GRAY_EXCHANGE_YIELD = 80;
    const GREEN_EXCHANGE_COST = 50;
    const GREEN_EXCHANGE_YIELD = 80;
    
    let currentGray = Number(document.getElementById('initialGray').value);
    let currentGreen = Number(document.getElementById('initialGreen').value);
    let currentBlue = Number(document.getElementById('initialBlue').value);

    let outputHTML = '';
    
    // --- 2. Determine Max Items (Absolute Ceiling) ---
    
    const maxItemsGray = Math.floor(currentGray / RESOURCES_PER_ITEM.GRAY);
    const maxItemsGreen = Math.floor(currentGreen / RESOURCES_PER_ITEM.GREEN);
    const absoluteMaxItems = Math.min(maxItemsGray, maxItemsGreen);

    // --- 3. Iterate to Find Maximum Possible Items (Corrected Logic) ---

    let maxCraftable = Math.floor(currentBlue / RESOURCES_PER_ITEM.BLUE);
    let bestGreenExchanges = 0;
    let bestGrayExchanges = 0;
    let bestGreenUsed = 0;
    let bestGrayUsed = 0;
    let bestTotalPowderGenerated = 0;

    for (let targetItems = maxCraftable + 1; targetItems <= absoluteMaxItems; targetItems++) {
        
        const neededBlue = targetItems * RESOURCES_PER_ITEM.BLUE;
        const neededPowder = neededBlue * POWDER_PER_BLUE;
        const powderAlreadyAvailable = currentBlue * POWDER_PER_BLUE;
        let powderToFind = neededPowder - powderAlreadyAvailable;
        
        let greenAvailableForExchange = currentGreen - (targetItems * RESOURCES_PER_ITEM.GREEN);
        let grayAvailableForExchange = currentGray - (targetItems * RESOURCES_PER_ITEM.GRAY);

        if (greenAvailableForExchange < 0 || grayAvailableForExchange < 0) {
            break;
        }

        let currentPowderGenerated = 0;
        let tempPowderToFind = powderToFind;
        let tempGreenUsed = 0;
        let tempGrayUsed = 0;
        let tempGreenExchanges = 0;
        let tempGrayExchanges = 0;

        // Determine which resource is the most abundant (relative to the other) and use it first.
        let useGrayFirst = grayAvailableForExchange > greenAvailableForExchange;

        // --- A. Use the most abundant resource first ---
        let firstResourceUsed = 0;
        let secondResourceUsed = 0;

        if (useGrayFirst) {
            // Priority 1: Use Gray (since it is the most abundant reserve)
            if (grayAvailableForExchange > 0) {
                const maxGrayBatches = Math.floor(grayAvailableForExchange / GRAY_EXCHANGE_COST);
                const batchesToUse = Math.ceil(tempPowderToFind / GRAY_EXCHANGE_YIELD);
                const grayBatches = Math.min(maxGrayBatches, batchesToUse);
                
                tempGrayExchanges = grayBatches;
                tempGrayUsed = grayBatches * GRAY_EXCHANGE_COST;
                const powderFromGray = grayBatches * GRAY_EXCHANGE_YIELD; 
                currentPowderGenerated += powderFromGray;
                tempPowderToFind -= powderFromGray;
            }
            
            // Priority 2: Use Green (if Gray ran out or was not enough)
            if (tempPowderToFind > 0 && greenAvailableForExchange > 0) {
                const maxGreenBatches = Math.floor(greenAvailableForExchange / GREEN_EXCHANGE_COST);
                const batchesToUse = Math.ceil(tempPowderToFind / GREEN_EXCHANGE_YIELD);
                const greenBatches = Math.min(maxGreenBatches, batchesToUse);

                tempGreenExchanges = greenBatches;
                tempGreenUsed = greenBatches * GREEN_EXCHANGE_COST;
                const powderFromGreen = greenBatches * GREEN_EXCHANGE_YIELD;
                currentPowderGenerated += powderFromGreen;
                tempPowderToFind -= powderFromGreen;
            }

        } else {
            // Priority 1: Use Green (since it is the most abundant reserve)
            if (greenAvailableForExchange > 0) {
                const maxGreenBatches = Math.floor(greenAvailableForExchange / GREEN_EXCHANGE_COST);
                const batchesToUse = Math.ceil(tempPowderToFind / GREEN_EXCHANGE_YIELD);
                const greenBatches = Math.min(maxGreenBatches, batchesToUse);

                tempGreenExchanges = greenBatches;
                tempGreenUsed = greenBatches * GREEN_EXCHANGE_COST;
                const powderFromGreen = greenBatches * GREEN_EXCHANGE_YIELD;
                currentPowderGenerated += powderFromGreen;
                tempPowderToFind -= powderFromGreen;
            }
            
            // Priority 2: Use Gray (if Green ran out or was not enough)
            if (tempPowderToFind > 0 && grayAvailableForExchange > 0) {
                const maxGrayBatches = Math.floor(grayAvailableForExchange / GRAY_EXCHANGE_COST);
                const batchesToUse = Math.ceil(tempPowderToFind / GRAY_EXCHANGE_YIELD);
                const grayBatches = Math.min(maxGrayBatches, batchesToUse);
                
                tempGrayExchanges = grayBatches;
                tempGrayUsed = grayBatches * GRAY_EXCHANGE_COST;
                const powderFromGray = grayBatches * GRAY_EXCHANGE_YIELD; 
                currentPowderGenerated += powderFromGray;
                tempPowderToFind -= powderFromGray;
            }
        }


        // --- D. Check if we generated enough Powder for this target item count
        if (tempPowderToFind <= 0) {
            maxCraftable = targetItems;
            bestGreenExchanges = tempGreenExchanges;
            bestGrayExchanges = tempGrayExchanges;
            bestGreenUsed = tempGreenUsed;
            bestGrayUsed = tempGrayUsed;
            bestTotalPowderGenerated = currentPowderGenerated;
        } else {
            break; 
        }
    }
    
    // --- 4. Final Output ---

    const currentGreenRemaining = currentGreen - bestGreenUsed;
    const currentGrayRemaining = currentGray - bestGrayUsed;
    const powderGoalForFinalCount = (maxCraftable * RESOURCES_PER_ITEM.BLUE * POWDER_PER_BLUE) - (currentBlue * POWDER_PER_BLUE);
    const totalPowderFromExchanges = bestTotalPowderGenerated;

    outputHTML += `<hr><h3>Final Conclusion:</h3>`;
    
    if (maxCraftable === absoluteMaxItems) {
         outputHTML += `<p class="success">✅ Successfully reached the maximum item limit set by Gray/Green inventory. Maximum crafted:</p>`;
         outputHTML += `<p style="font-size: 2em; text-align: center;">**${maxCraftable} Items**</p>`;
    } else {
         outputHTML += `<p class="failure">⚠️ The maximum achievable count after exchanges is:</p>`;
         outputHTML += `<p style="font-size: 2em; text-align: center;">**${maxCraftable} Items**</p>`;
         outputHTML += `<p>The limit is **Blue**, as generating enough Powder for item **${maxCraftable + 1}** is impossible with remaining reserves.</p>`;
    }

    outputHTML += `<h4>Resources for ${maxCraftable} Items:</h4>
        <ul>
            <li>**Powder Goal:** ${powderGoalForFinalCount}</li>
            <li>**Powder Generated:** ${totalPowderFromExchanges}</li>
        </ul>
        <h4>Exchange Summary:</h4>
        <ul>
            <li>**Green Exchanges (50 $\\rightarrow$ 80 Powder):** **${bestGreenExchanges}**</li>
            <li>**Gray Exchanges (100 $\\rightarrow$ 80 Powder):** **${bestGrayExchanges}**</li>
        </ul>
        <h4>Inventory Change:</h4>
        <ul>
            <li>**Green Used:** ${bestGreenUsed} (Remaining: ${currentGreenRemaining})</li>
            <li>**Gray Used:** ${bestGrayUsed} (Remaining: ${currentGrayRemaining})</li>
        </ul>`;

    document.getElementById('results').innerHTML = outputHTML;
}

// Attach the function to the button ONLY after the document (DOM) is fully loaded.
document.addEventListener('DOMContentLoaded', (event) => {
    const button = document.getElementById('calculateButton');
    if (button) {
        button.addEventListener('click', calculateMaxItems);
    }
});