export default function PrivacyPolicy() {
  return (
    <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-6 text-gray-800 font-sans">
      <h1 className="text-3xl font-bold border-b pb-4 text-green-700">Privacy Policy</h1>
      <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">1. Introduction</h2>
        <p>
          Welcome to <strong>GREENEABLE SOLAR SOLUTION</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">2. Information We Collect</h2>
        <p>
          We collect personal information that you voluntarily provide to us when generating invoices or communicating with clients:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Client Name and Contact Information (Phone number)</li>
          <li>Billing and Installation Address</li>
          <li>System Capacity and Invoice Details</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">3. How We Use Your Information</h2>
        <p>
          We use the collected information solely to generate tax invoices and to send invoice documents and updates directly via WhatsApp or other communication tools as requested by you.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">4. Data Security & Sharing</h2>
        <p>
          We do not sell or rent your personal data. Data is processed securely through official channels such as Meta WhatsApp Cloud API strictly for delivering invoices to your customers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <div className="bg-gray-50 p-4 rounded-md border text-sm space-y-1">
          <p className="font-bold text-green-700">GREENEABLE SOLAR SOLUTION</p>
          <p>215, ESCON PLAZA, ABOVE SBI BANK, AMROLI, SURAT - 394107, Gujarat</p>
          <p>Phone: +91 99131 68126</p>
        </div>
      </section>
    </main>
  );
}