'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

interface InvoiceItem {
  id: number;
  description: string;
  hsn: string;
  qty: string;
  rate: any;
  amount: number;
  cgstRate: any;
  sgstRate: any;
}

function numberToWords(num: number): string {
  if (isNaN(num) || num === 0) return 'Zero Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    const nString = String(n);
    if (nString.length > 9) return 'overflow';

    const nArray: RegExpMatchArray | null = ('000000000' + nString).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!nArray) return '';

    const getValue = (value: string): string => {
      const numericValue = Number(value);
      if (numericValue === 0) return '';
      if (numericValue < 20) return a[numericValue];

      const tensValue = Number(value[0]);
      const onesValue = Number(value[1]);
      return `${b[tensValue] || ''} ${a[onesValue] || ''}`.trim();
    };

    let str = '';
    str += (Number(nArray[1]) !== 0) ? `${getValue(nArray[1])} Crore ` : '';
    str += (Number(nArray[2]) !== 0) ? `${getValue(nArray[2])} Lakh ` : '';
    str += (Number(nArray[3]) !== 0) ? `${getValue(nArray[3])} Thousand ` : '';
    str += (Number(nArray[4]) !== 0) ? `${getValue(nArray[4])} Hundred ` : '';
    str += (Number(nArray[5]) !== 0) ? `${(str !== '') ? 'and ' : ''}${getValue(nArray[5])}` : '';
    return str.trim();
  }

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = 'INR ' + inWords(rupees);
  if (paise > 0) {
    result += ' and ' + inWords(paise) + ' Paise';
  }
  return result + ' Only';
}

export default function SolarBillGenerator() {
  const [company] = useState({
    name: 'Aadhya Solar Tech',
    address: '215, ESCON PLAZA, ABOVE SBI BANK, AMROLI',
    city: 'SURAT',
    pincode: '394107',
    state: 'Gujarat',
    phone: '+91 7284810210',
    gstin: '24CBAPB8912R1ZG',
    bankName: 'ICICI BANK LTD (2898)',
    accountNo: '183605002898',
    ifsc: 'KATARGAM & ICIC0001836',
  });

  const [client, setClient] = useState({
    name: '',
    address: '',
    city: 'Surat',
    pincode: '395010',
    state: 'Gujarat',
    phone: '',
    invoiceNo: '',
    eWayBillNo: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, description: '', hsn: '', qty: '', rate: '', amount: 0, cgstRate: 2.5, sgstRate: 2.5 },
  ]);

  const [currentDate, setCurrentDate] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-GB'));
    const randomInvoice = `GS/2026/${Math.floor(100 + Math.random() * 900)}`;
    setClient(prev => ({ ...prev, invoiceNo: randomInvoice }));
  }, []);

  const handleItemChange = (id: number, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'rate' || field === 'qty') {
          const q = parseFloat(updated.qty) || 1;
          const r = parseFloat(String(updated.rate)) || 0;
          updated.amount = q > 0 && !isNaN(q) && updated.qty !== '-' ? q * r : Number(updated.rate) || 0;
        }
        return updated;
      }
      return item;
    }));
  };

  const addItemRow = () => {
    setItems([
      ...items,
      { id: Date.now(), description: '', hsn: '', qty: '', rate: '', amount: 0, cgstRate: 2.5, sgstRate: 2.5 }
    ]);
  };

  const deleteItemRow = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subTotal = Number(items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toFixed(2));
  
  const totalCgstAmount = Number(items.reduce((acc, curr) => {
    const cRate = curr.cgstRate === '' || isNaN(curr.cgstRate) ? 2.5 : Number(curr.cgstRate);
    return acc + ((curr.amount * cRate) / 100);
  }, 0).toFixed(2));

  const totalSgstAmount = Number(items.reduce((acc, curr) => {
    const sRate = curr.sgstRate === '' || isNaN(curr.sgstRate) ? 2.5 : Number(curr.sgstRate);
    return acc + ((curr.amount * sRate) / 100);
  }, 0).toFixed(2));

  const grandTotal = Number((subTotal + totalCgstAmount + totalSgstAmount).toFixed(2));
  const totalTaxAmount = Number((totalCgstAmount + totalSgstAmount).toFixed(2));

  // Generate PDF, Upload to Vercel Blob & Open WhatsApp
  const handleGeneratePDF = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client.phone) {
      alert('Please enter the customer\'s WhatsApp mobile number.');
      return;
    }

    setIsLoading(true);
    setResponseMessage('Generating PDF & uploading to Vercel Blob...');

    try {
      const doc = new jsPDF();
      let y = 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Tax Invoice', 105, y, { align: 'center' });
      y += 5;

      doc.setDrawColor(0);
      doc.setLineWidth(0.2);
      doc.rect(14, y, 182, 30);
      doc.line(105, y, 105, y + 30);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(company.name, 16, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(`${company.address}, ${company.city} - ${company.pincode}`, 16, y + 9);
      doc.text(`MO. No. ${company.phone}`, 16, y + 13);
      doc.text(`GSTIN/UIN: ${company.gstin}`, 16, y + 17);
      doc.text(`State Name : ${company.state}`, 16, y + 21);

      doc.text(`Invoice No. : ${client.invoiceNo}`, 108, y + 5);
      doc.text(`e-Way Bill No. : ${client.eWayBillNo || ''}`, 145, y + 5);
      doc.text(`Dated : ${currentDate}`, 108, y + 9);
      doc.text(`State Name : ${company.state}`, 108, y + 21);

      y += 30;

      doc.rect(14, y, 182, 24);
      doc.line(105, y, 105, y + 24);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text('Buyer (Bill to)', 16, y + 4);
      doc.setFontSize(7.5);
      doc.text(client.name || '---', 16, y + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(`${client.address ? client.address + ', ' : ''}${client.city} - ${client.pincode}`, 16, y + 12);
      doc.text(`State Name : ${client.state}`, 16, y + 16);
      doc.text(`Phone No. : +91 ${client.phone}`, 16, y + 20);

      y += 24;

      doc.setFillColor(240, 240, 240);
      doc.rect(14, y, 182, 7, 'F');
      doc.rect(14, y, 182, 7);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('Sl No.', 17, y + 4.5);
      doc.text('Description of Goods and Services', 35, y + 4.5);
      doc.text('HSN/SAC', 115, y + 4.5);
      doc.text('Quantity', 138, y + 4.5);
      doc.text('Amount', 190, y + 4.5, { align: 'right' });

      y += 7;

      doc.setFont('helvetica', 'normal');
      items.forEach((item, idx) => {
        doc.rect(14, y, 182, 7);
        doc.text(String(idx + 1), 17, y + 4.5, { align: 'center' });
        doc.text(item.description || '---', 35, y + 4.5);
        doc.text(item.hsn || '---', 115, y + 4.5);
        doc.text(item.qty || '---', 138, y + 4.5);
        doc.text(`Rs. ${Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 193, y + 4.5, { align: 'right' });
        y += 7;
      });

      const summaryRows = [
        { label: 'Sub Total', val: `Rs. ${subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { label: 'CGST', val: `Rs. ${totalCgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { label: 'SGST', val: `Rs. ${totalSgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { label: 'Grand Total', val: `Rs. ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      ];

      summaryRows.forEach((row) => {
        doc.rect(14, y, 182, 6.5);
        doc.setFont('helvetica', 'bold');
        doc.text(row.label, 140, y + 4, { align: 'right' });
        doc.text(row.val, 193, y + 4, { align: 'right' });
        y += 6.5;
      });

      doc.rect(14, y, 182, 9);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.text('Amount Chargeable (in words)', 16, y + 3);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(numberToWords(grandTotal), 16, y + 7);

      y += 9;

      doc.setFillColor(240, 240, 240);
      doc.rect(14, y, 182, 10, 'F');
      doc.rect(14, y, 182, 10);
      
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text('HSN/SAC', 18, y + 6);
      doc.text('Taxable Value', 50, y + 6);
      doc.text('CGST Amount', 85, y + 6);
      doc.text('SGST Amount', 120, y + 6);
      doc.text('Total Tax Amount', 160, y + 6);

      y += 10;

      doc.setFont('helvetica', 'normal');
      items.forEach(item => {
        const cRate = item.cgstRate === '' || isNaN(item.cgstRate) ? 2.5 : Number(item.cgstRate);
        const sRate = item.sgstRate === '' || isNaN(item.sgstRate) ? 2.5 : Number(item.sgstRate);
        const cAmt = Number(((item.amount * cRate) / 100).toFixed(2));
        const sAmt = Number(((item.amount * sRate) / 100).toFixed(2));
        
        doc.rect(14, y, 182, 6.5);
        doc.text(item.hsn || '---', 18, y + 4);
        doc.text(`Rs. ${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 50, y + 4);
        doc.text(`Rs. ${cAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 85, y + 4);
        doc.text(`Rs. ${sAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 120, y + 4);
        doc.text(`Rs. ${(cAmt + sAmt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 160, y + 4);
        y += 6.5;
      });

      doc.rect(14, y, 182, 6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Total', 18, y + 4);
      doc.text(`Rs. ${subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 50, y + 4);
      doc.text(`Rs. ${totalCgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 85, y + 4);
      doc.text(`Rs. ${totalSgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 120, y + 4);
      doc.text(`Rs. ${totalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 160, y + 4);

      y += 6.5;

      doc.rect(14, y, 182, 26);
      doc.line(110, y, 110, y + 26);

      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text('Declaration', 16, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.text('We declare that this invoice shows the actual\nprice of the goods described and that all\nparticulars are true and correct.', 16, y + 8);

      doc.setFont('helvetica', 'bold');
      doc.text("Company's Bank Details", 112, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(`A/c Holder's Name : ${company.name}`, 112, y + 8.5);
      doc.text(`Bank Name : ${company.bankName}`, 112, y + 12.5);
      doc.text(`A/c No. : ${company.accountNo}`, 112, y + 16.5);
      doc.text(`Branch & IFSC Code : ${company.ifsc}`, 112, y + 20.5);

      y += 26;

      doc.rect(14, y, 182, 12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(`for ${company.name}`, 155, y + 4, { align: 'center' });
      doc.setFontSize(5.5);
      doc.text('Authorised Signatory', 155, y + 9.5, { align: 'center' });

      const safeInvoiceNo = client.invoiceNo.replace(/\//g, '_');
      const fileName = `Tax_Invoice_${safeInvoiceNo}.pdf`;
      
      doc.save(fileName);

      const pdfBlob = doc.output('blob');
      const formData = new FormData();
      formData.append('file', pdfBlob, fileName);
      formData.append('filename', fileName);

      const res = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Upload failed');

      const downloadUrl = data.url;

      const cleanPhone = client.phone.replace(/\D/g, '');
      const finalPhone = cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone;
      const formattedTotal = grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const messageText = `Hello *${client.name || 'Customer'}*,\n\nHere is your Tax Invoice (*${client.invoiceNo}*) from *GREENEABLE SOLAR SOLUTION*:\n----------------------------------\n✅ *Grand Total:* *Rs. ${formattedTotal}*\n\n📄 *Download PDF Invoice here:*\n${downloadUrl}\n\nThank you for choosing solar energy!`;

      const encodedMessage = encodeURIComponent(messageText);
      const waUrl = `https://wa.me/${finalPhone}?text=${encodedMessage}`;

      setWhatsappLink(waUrl);
      setResponseMessage(`Success! PDF uploaded & WhatsApp link ready for +${finalPhone} 🚀`);
      setIsLoading(false);

      window.open(waUrl, '_blank');

    } catch (error: any) {
      console.error(error);
      setResponseMessage(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-10">
      <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Aadhya Solar Bill Generator</h1>
        
        <form onSubmit={handleGeneratePDF} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md border">
            <h3 className="col-span-full font-bold text-gray-700">Client & Invoice Details</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600">Client Name</label>
              <input type="text" placeholder="e.g. BHUVA PIYUSH" value={client.name} onChange={e => setClient({...client, name: e.target.value})} className="w-full p-2 border rounded text-sm mt-1 bg-white" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">WhatsApp Phone (Customer Number)</label>
              <input type="tel" inputMode="numeric" maxLength={10} placeholder="9898097976" value={client.phone} onChange={e => setClient({...client, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="w-full p-2 border rounded text-sm mt-1 bg-white font-bold text-green-700" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Invoice Number</label>
              <input type="text" value={client.invoiceNo} onChange={e => setClient({...client, invoiceNo: e.target.value})} className="w-full p-2 border rounded text-sm mt-1 bg-white font-bold text-blue-700" required />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600">Street Address / Society / Plot</label>
              <input type="text" placeholder="e.g. PL-08, SHIVAM BUNGALOW" value={client.address} onChange={e => setClient({...client, address: e.target.value})} className="w-full p-2 border rounded text-sm mt-1 bg-white" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">City</label>
              <input type="text" placeholder="Surat" value={client.city} onChange={e => setClient({...client, city: e.target.value})} className="w-full p-2 border rounded text-sm mt-1 bg-white" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Pincode</label>
              <input type="text" placeholder="395010" value={client.pincode} onChange={e => setClient({...client, pincode: e.target.value})} className="w-full p-2 border rounded text-sm mt-1 bg-white" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">State</label>
              <input type="text" placeholder="Gujarat" value={client.state} onChange={e => setClient({...client, state: e.target.value})} className="w-full p-2 border rounded text-sm mt-1 bg-white" required />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-700">Solar Items & Tax</h3>
              <button type="button" onClick={addItemRow} className="bg-blue-600 text-white px-3 py-1 text-xs rounded font-bold hover:bg-blue-700">+ Add Item Row</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs bg-white border rounded">
                <thead>
                  <tr className="bg-gray-200 border-b">
                    <th className="p-2">Description</th>
                    <th className="p-2">HSN/SAC</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Rate (₹)</th>
                    <th className="p-2">CGST %</th>
                    <th className="p-2">SGST %</th>
                    <th className="p-2">Amount (₹)</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2"><input type="text" placeholder="e.g. SOLAR SYSTEM" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="w-full p-1 border rounded text-xs bg-white" /></td>
                      <td className="p-2"><input type="text" placeholder="854140" value={item.hsn} onChange={e => handleItemChange(item.id, 'hsn', e.target.value)} className="w-20 p-1 border rounded text-xs bg-white" /></td>
                      <td className="p-2"><input type="text" placeholder="KW" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', e.target.value)} className="w-20 p-1 border rounded text-xs bg-white" /></td>
                      <td className="p-2"><input type="number" placeholder="Rate" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', e.target.value)} className="w-20 p-1 border rounded text-xs bg-white" /></td>
                      <td className="p-2"><input type="number" placeholder="2.5" value={item.cgstRate} onChange={e => handleItemChange(item.id, 'cgstRate', e.target.value)} className="w-16 p-1 border rounded text-xs bg-white" /></td>
                      <td className="p-2"><input type="number" placeholder="2.5" value={item.sgstRate} onChange={e => handleItemChange(item.id, 'sgstRate', e.target.value)} className="w-16 p-1 border rounded text-xs bg-white" /></td>
                      <td className="p-2 font-semibold">₹{Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2 text-center">
                        {items.length > 1 && (
                          <button type="button" onClick={() => deleteItemRow(item.id)} className="text-red-600 font-bold hover:text-red-800 px-2 py-1">✕</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700 transition shadow-lg disabled:bg-gray-400">
            {isLoading ? 'Uploading & Preparing WhatsApp...' : 'Generate PDF, Upload & Open WhatsApp 🚀'}
          </button>
        </form>

        {responseMessage && (
          <div className="mt-4 p-4 rounded bg-green-100 text-green-800 text-center text-sm space-y-2">
            <p className="font-semibold">{responseMessage}</p>
            {whatsappLink && (
              <div>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 shadow-md">
                  💬 Open WhatsApp Chat with PDF Download Link
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* LIVE PREVIEW SECTION */}
      <div className="bg-white p-8 shadow-xl rounded-lg border border-gray-300">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">📄 Aadhya Solar Tech Invoice</h2>
        </div>

        <div className="border border-gray-400 p-6 rounded-md text-xs space-y-4 bg-white text-black">
          {/* Header */}
          <div className="text-center font-bold text-sm tracking-wide">Tax Invoice</div>

          {/* Company & Invoice Info Box */}
          <div className="grid grid-cols-2 border border-black">
            <div className="p-3 border-r border-black space-y-0.5">
              <div className="font-bold text-sm">{company.name}</div>
              <div>{company.address}, {company.city} - {company.pincode}</div>
              <div>MO. No. {company.phone}</div>
              <div>GSTIN/UIN: {company.gstin}</div>
              <div>State Name : {company.state}</div>
            </div>
            <div className="p-3 space-y-1">
              <div><span className="font-semibold">Invoice No. :</span> {client.invoiceNo}</div>
              <div><span className="font-semibold">e-Way Bill No. :</span> {client.eWayBillNo || '---'}</div>
              <div><span className="font-semibold">Dated :</span> {currentDate}</div>
              <div><span className="font-semibold">State Name :</span> {company.state}</div>
            </div>
          </div>

          {/* Buyer Info Box */}
          <div className="border border-black p-3 space-y-0.5">
            <div className="font-bold">Buyer (Bill to)</div>
            <div className="font-semibold text-sm">{client.name || '---'}</div>
            <div>{client.address ? client.address + ', ' : ''}{client.city} - {client.pincode}</div>
            <div>State Name : {client.state}</div>
            <div>Phone No. : +91 {client.phone || '---'}</div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse border border-black text-center">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="border-r border-black p-1.5 w-10">Sl No.</th>
                <th className="border-r border-black p-1.5 text-left">Description of Goods and Services</th>
                <th className="border-r border-black p-1.5 w-20">HSN/SAC</th>
                <th className="border-r border-black p-1.5 w-16">Quantity</th>
                <th className="p-1.5 text-right w-24">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-black">
                  <td className="border-r border-black p-1.5">{idx + 1}</td>
                  <td className="border-r border-black p-1.5 text-left">{item.description || '---'}</td>
                  <td className="border-r border-black p-1.5">{item.hsn || '---'}</td>
                  <td className="border-r border-black p-1.5">{item.qty || '---'}</td>
                  <td className="p-1.5 text-right">Rs. {Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} className="border-r border-black text-right font-bold p-1.5">Sub Total</td>
                <td className="text-right font-bold p-1.5">Rs. {subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td colSpan={4} className="border-r border-black text-right font-bold p-1.5">CGST</td>
                <td className="text-right font-bold p-1.5">Rs. {totalCgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td colSpan={4} className="border-r border-black text-right font-bold p-1.5">SGST</td>
                <td className="text-right font-bold p-1.5">Rs. {totalSgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr className="bg-gray-50 border-t border-black font-bold">
                <td colSpan={4} className="border-r border-black text-right p-1.5">Grand Total</td>
                <td className="text-right p-1.5">Rs. {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          {/* Amount in words */}
          <div className="border border-black p-2">
            <div className="text-[10px] text-gray-600">Amount Chargeable (in words)</div>
            <div className="font-bold">{numberToWords(grandTotal)}</div>
          </div>

          {/* Tax Breakdown Table */}
          <table className="w-full border-collapse border border-black text-center">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="border-r border-black p-1.5">HSN/SAC</th>
                <th className="border-r border-black p-1.5">Taxable Value</th>
                <th className="border-r border-black p-1.5">CGST Amount</th>
                <th className="border-r border-black p-1.5">SGST Amount</th>
                <th className="p-1.5">Total Tax Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const cRate = item.cgstRate === '' || isNaN(item.cgstRate) ? 2.5 : Number(item.cgstRate);
                const sRate = item.sgstRate === '' || isNaN(item.sgstRate) ? 2.5 : Number(item.sgstRate);
                const cAmt = Number(((item.amount * cRate) / 100).toFixed(2));
                const sAmt = Number(((item.amount * sRate) / 100).toFixed(2));
                return (
                  <tr key={item.id} className="border-b border-black">
                    <td className="border-r border-black p-1.5">{item.hsn || '---'}</td>
                    <td className="border-r border-black p-1.5">Rs. {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="border-r border-black p-1.5">Rs. {cAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="border-r border-black p-1.5">Rs. {sAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-1.5">Rs. {(cAmt + sAmt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
              <tr className="font-bold border-t border-black">
                <td className="border-r border-black p-1.5">Total</td>
                <td className="border-r border-black p-1.5">Rs. {subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="border-r border-black p-1.5">Rs. {totalCgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="border-r border-black p-1.5">Rs. {totalSgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="p-1.5">Rs. {totalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          {/* Declaration & Bank Details */}
          <div className="grid grid-cols-2 border border-black">
            <div className="p-3 border-r border-black space-y-1">
              <div className="font-bold">Declaration</div>
              <div className="text-[10px] leading-tight text-gray-700">
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
              </div>
            </div>
            <div className="p-3 space-y-0.5">
              <div className="font-bold">Company's Bank Details</div>
              <div>A/c Holder's Name : {company.name}</div>
              <div>Bank Name : {company.bankName}</div>
              <div>A/c No. : {company.accountNo}</div>
              <div>Branch & IFSC Code : {company.ifsc}</div>
            </div>
          </div>

          {/* Signature Footer */}
          <div className="border border-black p-4 text-right flex flex-col justify-end h-20">
            <div className="font-bold">for {company.name}</div>
            <div className="mt-6 text-[10px] text-gray-600">Authorised Signatory</div>
          </div>
        </div>
      </div>
    </main>
  );
} 