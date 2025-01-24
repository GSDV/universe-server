import { CONTACT_EMAIL } from '@util/global';

import styles from '@styles/pages/file.module.css';



export default function Page() {
    return (
        <div className={styles.container}>
            <p>Last Updated: January 24, 2025</p>

            <h1>Privacy Policy</h1>





            <h2>1. Acceptance of Privacy Policy</h2>

            <p>Please read this Privacy Policy (&quot;Policy&quot;) carefully before using UniVerse (the &quot;Service&quot;) operated by UniVerse (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).</p>

            <p>By using this university social media platform (the &quot;Service&quot;), you accept and agree to this Privacy Policy and acknowledge that your personal information will be handled as described. If you do not agree with this Privacy Policy, please do not use the Service.</p>

            <p>You also agree that you are of legal age to attend university in your jurisdiction and have a valid university email address.</p>



            <h2>2. Information Collected</h2>

            <h3>2.1 Information You Provide</h3>
            <p>The information you provide includes:</p>
            <ul>
                <li>Account information: email address and password</li>
                <li>Profile information: username, display name, university affiliation, biography and profile picture</li>
                <li>Content you create: posts, replies, likes, and follow relationships</li>
                <li>Location information (optional): when you choose to share your location with posts</li>
            </ul>

            <h3>2.2 Information for Security</h3>
            <p>The information that we collect or generate includes:</p>
            <ul>
                <li>Authentication tokens for keeping you logged in securely</li>
                <li>Password reset tokens when you request a password reset</li>
                <li>Account verification status</li>
                <li>Account deleted or banned status</li>
            </ul>



            <h2>3. How We Use Your Information</h2>

            <p>We use your information to:</p>
            <ul>
                <li>Provide and maintain our service</li>
                <li>Verify your university affiliation</li>
                <li>Display your content to other users</li>
                <li>Enable social interactions like following and liking</li>
                <li>Process reports of inappropriate content</li>
                <li>Improve our services and user experience</li>
                <li>Protect against abuse and maintain platform safety</li>
                <li>Comply with legal obligations</li>
            </ul>



            <h2>4. Information Sharing and Disclosure</h2>

            <h3>4.1 Public Information</h3>
            <p>Your posts, profile information, and interactions are visible to other users of the platform.</p>

            <h3>4.2 Service Providers</h3>
            <p>We may share information with third-party service providers who help us operate, maintain, and improve our platform under strict confidentiality agreements.</p>
            <p>We may share information with third-party service providers under strict confidentiality agreements, including:</p>
            <ul>
                <li>Cloud hosting providers to store your data securely</li>
                <li>Email service providers to send verification emails and password reset links</li>
                <li>Content delivery networks to ensure fast content delivery</li>
                <li>Image storage services to handle profile pictures and media uploads</li>
            </ul>

            <h3>4.3 Legal Requirements</h3>
            <p>We may disclose information if required by law, regulation, legal process, or governmental request.</p>



            <h2>5. Data Security</h2>

            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction</p>



            <h2>6. Your Rights and Choices</h2>

            <p>You can:</p>
            <ul>
                <li>Access or update your account information</li>
                <li>Choose whether to share location information</li>
                <li>Remove account from public view</li>
            </ul>

            <h3>6.2 Data Security</h3>
            <p>While we implement reasonable security measures, we cannot guarantee absolute security. You acknowledge this risk when using the Service.</p>



            <h2>7. Data Retention</h2>

            <p>We retain your information for as long as your account is active or as needed to provide services. When you delete your account, your profile and posts will be marked as deleted and hidden from other users, but the data may be retained in our systems for security, auditing, and abuse prevention purposes. If your account is banned, we retain information about the ban and associated content to prevent abuse</p>



            <h2>8. Children's Privacy</h2>

            <p>Our service is intended for university students and is not directed at children under 18. We do not knowingly collect personal information from children under 18.</p>



            <h2>9. Changes to This Policy</h2>

            <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date</p>

            <p>When we make significant changes, we will notify you through the app or by email. Your continued use of the service after such modifications constitutes your acknowledgment of the modified Privacy Policy</p>



            <h2>10. Contact Us</h2>
            <p>If you have questions about this privacy policy or our practices, please contact us at:</p>
            <ul>
                <li>Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
            </ul>



            <h2>11. University-Specific Terms</h2>

            <p>As our platform is designed for university students:</p>
            <ul>
                <li>We verify university affiliations through institutional email addresses</li>
                <li>Content may be organized and filtered based on university affiliation</li>
                <li>University administrators may have limited access to relevant platform data in accordance with applicable education privacy laws</li>
            </ul>



            <h2>12. California Privacy Rights</h2>

            <p>California residents have specific rights regarding their personal information under the CCPA. Please contact us for more information about these rights.</p>



            <h2>13. International Data Transfers</h2>

            <p>If you are using our service from outside the United States, please be aware that data may be transferred to, stored in, and processed in the United States or other countries.</p>



            <h2>14. Entire Agreement</h2>

            <p>These Terms constitute the entire agreement between you and us regarding the Service, superseding any prior agreements.
            By using our Service, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.</p>
        </div>
    );
}