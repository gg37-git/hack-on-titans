export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm">
        <h1 className="text-3xl font-black text-neutral-900 mb-6">Terms of Service</h1>
        <div className="prose prose-neutral">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h3>1. Agreement to Terms</h3>
          <p>By viewing or using this website, which can be accessed at localhost, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws.</p>
          
          <h3>2. Medical Disclaimer</h3>
          <p><strong>IMPORTANT:</strong> The content provided by our AI EmpathyBot, AI Nutrition Coach, and Predictive Analytics is for informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.</p>

          <h3>3. Use License</h3>
          <p>Permission is granted to temporarily download one copy of the materials on the HealthCare Platform for personal, non-commercial transitory viewing only.</p>
          
          <p className="mt-8 text-sm text-neutral-500 italic">For legal inquiries, please contact legal@healthcare-ai.local</p>
        </div>
      </div>
    </div>
  );
}
