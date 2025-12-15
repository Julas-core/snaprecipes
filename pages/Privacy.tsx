import React from 'react';

const Privacy: React.FC = () => {
    return (
        <div className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm my-8 animate-fade-in text-amber-900 dark:text-gray-100">
            <h1 className="text-3xl font-bold font-serif mb-6 text-amber-900 dark:text-amber-500">Privacy Policy</h1>

            <div className="prose dark:prose-invert max-w-none space-y-4">
                <p><strong>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
                <p>
                    Welcome to Snap-a-Recipe ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h3>
                <p>We may collect information about you in a variety of ways. The information we may collect via the Application includes:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>
                        <strong>User-Generated Content:</strong> We process the images you upload or capture to generate recipes. These images are sent to our AI provider for analysis but are not stored on our servers or associated with any personal information.
                    </li>
                    <li>
                        <strong>Analytics Data:</strong> We may collect anonymous usage data, such as which features are used, to improve our service. This data is not linked to your personal identity.
                    </li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-2">2. Use of Your Information</h3>
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Generate recipes based on the images you provide.</li>
                    <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-2">3. Security of Your Information</h3>
                <p>
                    We are committed to protecting your data. Since we do not store your images or personal data, the risk of a data breach is minimized. We use secure, encrypted connections (HTTPS) for all data transmissions to our AI service provider.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-2">4. Third-Party Services</h3>
                <p>This application uses the following third-party services:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Google Gemini API:</strong> To analyze images and generate recipe content. Your images are sent to Google's servers for processing. Please review Google's Privacy Policy for more information.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-2">5. Contact Us</h3>
                <p>If you have questions or comments about this Privacy Policy, please contact us at: [Your Contact Email Here]</p>
            </div>
        </div>
    );
};

export default Privacy;
