import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import { CONTACT_EMAIL } from '@util/global';



const FOOTER = `
<p style="margin: 0;">This email was sent from an unmonitored address, please do not reply. For questions, contact ${CONTACT_EMAIL}.</p>
<p style="margin: 0;">Thank you for using UniVerse.</p>
`;



const sesClient = new SESClient({
    region: process.env.SES_REGION,
    credentials: {
        accessKeyId: process.env.SES_ACCESS_KEY as string,
        secretAccessKey: process.env.SES_SECRET_ACCESS_KEY as string
    }
});



export const sendVerificationEmail = async (recipient: string, verificationToken: string) => {
    const params = {
        Source: '"UniVerse" <verification@joinuniverse.app>',
        Destination: { ToAddresses: [recipient] },
        Message: {
            Subject: { Data: 'Verify Your Account' },
            Body: {
                Text: {
                    Data: `This is your verification token: ${verificationToken}.`
                },
                Html: {
                    Data: `
                        <div>
                            <h1>UniVerse Account Verification</h1>
                            <p>This is your verification token: ${verificationToken}.</p>
                            ${FOOTER}
                        </div>
                    `
                }
            }
        },
        Headers: {
            'Reply-To': { Data: 'no-reply@joinuniverse.app' },
            'X-Auto-Response-Suppress': { Data: 'OOF, AutoReply' }
        }
    
    };

    try {
        const command = new SendEmailCommand(params);
        await sesClient.send(command);
    } catch (error) {
        throw error;
    }
}



export const sendResetPasswordEmail = async (recipient: string, rpToken: string) => {
    const params = {
        Source: '"UniVerse" <password@joinuniverse.app>',
        Destination: { ToAddresses: [recipient] },
        Message: {
            Subject: { Data: 'Reset Your Password' },
            Body: {
                Text: {
                    Data: `Copy this link to reset your password: https://joinuniverse.app/reset-password/${rpToken}`
                },
                Html: {
                    Data: `
                        <div>
                            <h1>UniVerse Password Reset</h1>
                            <p>Click <a href='https://joinuniverse.app/reset-password/${rpToken}'>here</a> to reset your password.</p>
                            <p>If the above link does not work, copy this link: https://joinuniverse.app/reset-password/${rpToken}</p>
                            <p>If you did not ask to reset your password, you may safely ignore this email.</p>
                            ${FOOTER}
                        </div>
                    `
                }
            }
        },
        Headers: {
            'Reply-To': { Data: 'no-reply@joinuniverse.app' },
            'X-Auto-Response-Suppress': { Data: 'OOF, AutoReply' }
        }
    
    };

    try {
        const command = new SendEmailCommand(params);
        await sesClient.send(command);
    } catch (error) {
        throw error;
    }
}