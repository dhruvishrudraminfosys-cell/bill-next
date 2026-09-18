import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientName, clientPhone, systemCapacityKw, pricePerKw, subsidyAmount, gstRate } = body;

    // Calculations
    const grossAmount = Number(systemCapacityKw) * Number(pricePerKw);
    const gstAmount = (grossAmount * Number(gstRate)) / 100;
    const totalBeforeSubsidy = grossAmount + gstAmount;
    const netPayable = totalBeforeSubsidy - Number(subsidyAmount);

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    // Check if credentials exist
    if (!accountSid || !authToken || !twilioNumber) {
      return NextResponse.json(
        { error: 'Twilio environment variables are missing in .env.local' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);

    const messageBody = `Hello *${clientName}*, \n\nHere is your Solar Installation Invoice Summary:\n` +
      `☀️ *System Capacity:* ${systemCapacityKw} kW\n` +
      `💰 *Gross Amount:* ₹${grossAmount.toLocaleString('en-IN')}\n` +
      `📦 *GST (${gstRate}%):* ₹${gstAmount.toLocaleString('en-IN')}\n` +
      `🏛️ *Govt Subsidy Applied:* -₹${Number(subsidyAmount).toLocaleString('en-IN')}\n` +
      `----------------------------------\n` +
      `✅ *Net Payable Amount:* *₹${netPayable.toLocaleString('en-IN')}*\n\n` +
      `Thank you for powering your home with clean energy!`;

    // Send WhatsApp via Twilio
    const message = await client.messages.create({
      from: twilioNumber, // e.g. 'whatsapp:+14155238886'
      to: `whatsapp:${clientPhone}`, // e.g. 'whatsapp:+919876543210'
      body: messageBody,
    });

    return NextResponse.json({ 
      success: true, 
      sid: message.sid,
      calculation: { grossAmount, gstAmount, netPayable } 
    });

  } catch (error: any) {
    console.error('API Error Details:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}