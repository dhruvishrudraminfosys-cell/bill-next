export default function PrivacyPolicy() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6", color: "#333", maxWidth: "800px", margin: "0 auto", padding: "40px", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <div style={{ background: "#fff", padding: "40px", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <h1 style={{ color: "#2c3e50", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>Privacy Policy</h1>
        <p><strong>Effective Date:</strong> September 19, 2026</p>

        <p>Welcome to <strong>Bill Generator</strong> (accessible at <a href="https://bill-generator1.netlify.app/" target="_blank" rel="noopener noreferrer">https://bill-generator1.netlify.app/</a>). This Privacy Policy document outlines the types of information that is collected and recorded by Bill Generator and how we use it.</p>

        <h2 style={{ color: "#2c3e50", marginTop: "20px" }}>1. Information We Collect</h2>
        <p>Our application integrates with messaging services (such as the WhatsApp Business API via Twilio/Meta) to generate and send bills or notifications. We may process information that you input into the application, including:</p>
        <ul>
          <li>Customer names and phone numbers</li>
          <li>Billing details, items, and transaction amounts</li>
          <li>API configuration credentials required to operate your integrated services</li>
        </ul>

        <h2 style={{ color: "#2c3e50", marginTop: "20px" }}>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, operate, and maintain our bill generation service</li>
          <li>Process transactions and send billing notifications via WhatsApp as requested by you</li>
          <li>Maintain and secure application functionality</li>
        </ul>

        <h2 style={{ color: "#2c3e50", marginTop: "20px" }}>3. Data Security</h2>
        <p>We value your trust in providing your information and utilize secure handling practices (such as environment variables for tokens). However, remember that no method of electronic storage or internet transmission is 100% secure.</p>

        <h2 style={{ color: "#2c3e50", marginTop: "20px" }}>4. Third-Party Services</h2>
        <p>Our app interacts with third-party messaging platforms such as Meta (WhatsApp API) and Twilio. Please review their respective privacy policies regarding how they handle data processed through their systems.</p>

        <h2 style={{ color: "#2c3e50", marginTop: "20px" }}>5. Changes to This Privacy Policy</h2>
        <p>We may update our Privacy Policy from time to time. You are advised to review this page periodically for any changes.</p>

        <h2 style={{ color: "#2c3e50", marginTop: "20px" }}>6. Contact Us</h2>
        <p>If you have any questions or suggestions about our Privacy Policy, you can reach out via our website at <a href="https://bill-generator1.netlify.app/" target="_blank" rel="noopener noreferrer">https://bill-generator1.netlify.app/</a>.</p>
      </div>
    </main>
  );
}