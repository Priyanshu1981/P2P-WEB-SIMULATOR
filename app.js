// Define the SAP P2P Lifecycle Stages
const p2pStages = [
    { step: 0, status: "PR Created", tcode: "ME51N", nextAction: "Issue RFQ (ME41)" },
    { step: 1, status: "RFQ Sent", tcode: "ME41", nextAction: "Create PO (ME21N)" },
    { step: 2, status: "PO Issued", tcode: "ME21N", nextAction: "Goods Receipt (MIGO)" },
    { step: 3, status: "Goods Received", tcode: "MIGO", nextAction: "Invoice Verification (MIRO)" },
    { step: 4, status: "Invoice Verified", tcode: "MIRO", nextAction: "Pay Vendor (F-53)" },
    { step: 5, status: "Cycle Complete", tcode: "F-53", nextAction: null }
];

// Array to store our procurement records
let procurements = [];
let docCounter = 1000; // Starting ID for documents

// DOM Elements
const prForm = document.getElementById('pr-form');
const tableBody = document.getElementById('table-body');

// Handle new Purchase Requisition submission
prForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const material = document.getElementById('material').value;
    const qty = document.getElementById('qty').value;
    const plant = document.getElementById('plant').value;

    const newRecord = {
        id: `DOC-${docCounter++}`,
        material: material,
        qty: qty,
        plant: plant,
        currentStep: 0
    };

    procurements.push(newRecord);
    renderTable();
    
    // Optional: Reset form fields, except plant
    document.getElementById('material').value = 'RM-STEEL-01';
    document.getElementById('qty').value = '500';
});

// Function to advance a record to the next SAP stage
function advanceStage(recordId) {
    const record = procurements.find(r => r.id === recordId);
    
    if (record && record.currentStep < p2pStages.length - 1) {
        record.currentStep++;
        renderTable();
    }
}

// Function to render the table rows based on current data
function renderTable() {
    tableBody.innerHTML = ''; // Clear existing rows

    if (procurements.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #777;">No active procurement cycles. Create a PR above.</td></tr>`;
        return;
    }

    procurements.forEach(record => {
        const stageData = p2pStages[record.currentStep];
        const isComplete = record.currentStep === p2pStages.length - 1;
        
        const tr = document.createElement('tr');
        
        // Setup Stage Badge CSS class
        const badgeClass = isComplete ? 'stage-badge stage-completed' : 'stage-badge';

        // Setup Button HTML
        let actionHTML = '';
        if (isComplete) {
            actionHTML = `<span style="color: green; font-weight: bold;">✓ Paid</span>`;
        } else {
            actionHTML = `<button class="btn action-btn" onclick="advanceStage('${record.id}')">${stageData.nextAction} ➔</button>`;
        }

        tr.innerHTML = `
            <td><strong>${record.id}</strong></td>
            <td>${record.material} <br><small style="color:#777;">Plant: ${record.plant}</small></td>
            <td>${record.qty}</td>
            <td><span class="${badgeClass}">${stageData.status}</span></td>
            <td>${actionHTML}</td>
        `;
        
        tableBody.appendChild(tr);
    });
}

// Initial render to show empty state
renderTable();