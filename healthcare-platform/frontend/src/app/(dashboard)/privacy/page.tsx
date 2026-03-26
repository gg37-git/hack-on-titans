export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm">
        <h1 className="text-3xl font-black text-neutral-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-neutral">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>At HealthCare Platform, we take your privacy exceptionally seriously. By using our platform, you consent to the data practices described in this statement.</p>
          
          <h3>1. Collection of your Personal Information</h3>
          <p>In order to better provide you with products and services offered, we may collect personally identifiable information, such as your First and Last Name, Mailing Address, E-mail Address, and Phone Number.</p>
          
          <h3>2. Health Data Protection (HIPAA Compliance Strategy)</h3>
          <p>Your biometric data, Apple Watch/Fitbit synchronization data, and AI interactions are encrypted at rest using AES-256 standards. We do not sell your personal health records (PHR) to third-party data brokers.</p>

          <h3>3. Right to Deletion</h3>
          <p>Subject to certain exceptions, on receipt of a verifiable request from you, we will delete your personal information from our records and direct any service providers to delete your personal information from their records.</p>
          
          <p className="mt-8 text-sm text-neutral-500 italic">For privacy-related inquiries, please contact privacy@healthcare-ai.local</p>
        </div>
      </div>
    </div>
  );
}
