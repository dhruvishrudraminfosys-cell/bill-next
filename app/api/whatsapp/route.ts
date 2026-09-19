import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const phone = formData.get('phone') as string;
    const clientName = formData.get('clientName') as string;
    const invoiceNo = formData.get('invoiceNo') as string;
    const grandTotal = formData.get('grandTotal') as string;
    const pdfFile = formData.get('pdfFile');

    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is missing' }, { status: 400 });
    }

    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'WhatsApp credentials are missing. Add WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN to your environment variables.'
      }, { status: 500 });
    }

    
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone;

    let messagePayload: any = {};
    const baseUrl = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}`;

    
    if (pdfFile && pdfFile instanceof Blob) {
      const mediaFormData = new FormData();
      mediaFormData.append('messaging_product', 'whatsapp');
      mediaFormData.append('file', pdfFile, `Invoice_${invoiceNo || 'Solar'}.pdf`);

      const uploadResponse = await fetch(`${baseUrl}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
        body: mediaFormData,
      });

      const uploadData = await uploadResponse.json();
      
      if (uploadResponse.ok && uploadData.id) {
        messagePayload = {
          messaging_product: 'whatsapp',
          to: finalPhone,
          type: 'document',
          document: {
            id: uploadData.id,
            filename: `Invoice_${invoiceNo || 'Solar'}.pdf`,
            caption: `Hello *${clientName || 'Customer'}*,\n\nHere is your Tax Invoice (*${invoiceNo}*) from *GREENEABLE SOLAR SOLUTION*:\n----------------------------------\n✅ *Grand Total:* *Rs. ${grandTotal}*\n\nThank you for choosing solar energy!`
          }
        };
      }
    }

    
    if (!messagePayload.type) {
      messagePayload = {
        messaging_product: 'whatsapp',
        to: finalPhone,
        type: 'text',
        text: {
          body: `Hello *${clientName || 'Customer'}*,\n\nHere is your Tax Invoice (*${invoiceNo}*) from *GREENEABLE SOLAR SOLUTION*:\n----------------------------------\n✅ *Grand Total:* *Rs. ${grandTotal}*\n\nThank you for choosing solar energy!`
        }
      };
    }

    
    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagePayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ success: false, error: data }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}