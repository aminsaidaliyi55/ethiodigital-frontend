/**
 * Official Receipt Utility
 * Updated to calculate 15% VAT for the Ethio-Digital Trade system.
 */
export const handlePrint = (item, activeTab) => {
    const isRequest = activeTab === 'requests';
    const printWindow = window.open('', '_blank');
    const date = new Date().toLocaleDateString('en-GB');

    // --- Tax Calculations ---
    const subtotal = Number(isRequest ? item.budget : item.total_amount) || 0;
    const vatRate = 0.15;
    const vatAmount = subtotal * vatRate;
    const grandTotal = subtotal + vatAmount;

    const title = isRequest ? item.title : `Transaction #${item.id || item.order_id}`;

    // Official System Mock Data
    const tinNumber = "0043928174";
    const fsNumber = `FS-${Math.floor(100000 + Math.random() * 900000)}`;

    printWindow.document.write(`
        <html>
            <head>
                <title>Official Receipt - ${fsNumber}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;700&display=swap');
                    
                    body { 
                        font-family: 'Segoe UI', 'Noto Sans Ethiopic', sans-serif; 
                        padding: 10px; 
                        color: #000; 
                        line-height: 1.2;
                    }
                    .receipt-container { 
                        max-width: 600px; 
                        margin: auto; 
                        border: 1.5px solid #000; 
                        padding: 20px; 
                        background: #fff;
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 2px solid #000; 
                        margin-bottom: 15px; 
                        padding-bottom: 10px;
                    }
                    .header h1 { margin: 0; font-size: 20px; }
                    .header h2 { margin: 0; font-size: 16px; font-weight: bold; }
                    .header p { margin: 2px 0; font-size: 11px; }

                    .meta {
                        display: flex;
                        justify-content: space-between;
                        font-size: 12px;
                        margin-bottom: 15px;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 10px;
                    }

                    .main-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    .main-table th {
                        border: 1.5px solid #000;
                        padding: 8px;
                        font-size: 11px;
                        text-align: left;
                        background: #f9f9f9;
                    }
                    .main-table td {
                        border: 1px solid #000;
                        padding: 10px;
                        font-size: 13px;
                    }

                    .summary {
                        margin-left: auto;
                        width: 250px;
                        font-weight: bold;
                        font-size: 14px;
                    }
                    .summary-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 4px 0;
                    }
                    .total-row {
                        border-top: 2px solid #000;
                        border-bottom: 4px double #000;
                        margin-top: 5px;
                        padding: 8px 0;
                        font-size: 16px;
                    }

                    .footer { 
                        margin-top: 40px; 
                        font-size: 11px;
                    }
                    .signature-area {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                        margin-top: 20px;
                    }
                    .sig-line {
                        width: 200px;
                        border-top: 1px solid #000;
                        text-align: center;
                        padding-top: 5px;
                        font-size: 10px;
                    }
                    .legal {
                        text-align: center;
                        font-size: 9px;
                        color: #333;
                        border-top: 1px dashed #000;
                        padding-top: 10px;
                    }

                    @media print { 
                        body { padding: 0; background: none; } 
                        .receipt-container { border: 1px solid #000; width: 100%; } 
                    }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="header">
                        <h2>ኢትዮ ዲጂታል የንግድና ገበያ ቁጥጥር ስርዓት</h2>
                        <h1>ETHIO-DIGITAL TRADE & MARKET CONTROL</h1>
                        <p>Official Sales Voucher / ህጋዊ የሽያጭ ደረሰኝ</p>
                        <p><strong>TIN / የግብር ከፋይ መለያ ቁጥር:</strong> ${tinNumber}</p>
                    </div>

                    <div class="meta">
                        <div>
                            <strong>DATE / ቀን:</strong> ${date}<br>
                            <strong>OFFICER / ሰራተኛ:</strong> SYSTEM_ADMIN
                        </div>
                        <div style="text-align: right;">
                            <strong>FS No. / ፋይናንስ ቁጥር:</strong> ${fsNumber}<br>
                            <strong>REF / መለያ:</strong> #${item.id || item.order_id}
                        </div>
                    </div>

                    <table class="main-table">
                        <thead>
                            <tr>
                                <th width="70%">Description / የዕቃው ወይም የአገልግሎቱ አይነት</th>
                                <th width="30%">Amount / የገንዘብ መጠን</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <strong>${title}</strong><br>
                                    <span style="font-size: 11px;">Buyer / ገዢ: ${item.client_name || 'General Customer'}</span>
                                </td>
                                <td style="text-align: right; font-weight: bold;">
                                    ${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="summary">
                        <div class="summary-row">
                            <span>Subtotal / ድምር:</span>
                            <span>${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div class="summary-row">
                            <span>VAT (15%) / ቫት:</span>
                            <span>${vatAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div class="summary-row total-row">
                            <span>TOTAL / ጠቅላላ:</span>
                            <span>ETB ${grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>

                    <div class="footer">
                        <div class="signature-area">
                            <div class="sig-line">Customer Signature / የደንበኛ ፊርማ</div>
                            <div class="sig-line">Authorized Seal / የድርጅቱ ማህተም</div>
                        </div>
                        <div class="legal">
                            This document is generated by the Ethio-Digital Trade Control System.<br>
                            ይህ ሰነድ በኢትዮ ዲጂታል የንግድ ቁጥጥር ስርዓት የተዘጋጀ ህጋዊ ሰነድ ነው።
                        </div>
                    </div>
                </div>

                <script>
                    window.onload = function() { 
                        window.print(); 
                        setTimeout(() => { window.close(); }, 500);
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
};