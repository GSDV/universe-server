import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import { CONTACT_EMAIL } from '@util/global';



const FOOTER = `<p>Thank you for using UniVerse. Email ${CONTACT_EMAIL} for any questions.</p>`;



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
                        <h1>UniVerse Account Verification</h1>

                        <p>This is your verification token: ${verificationToken}.</p>

                        ${FOOTER}
                    `
                }
            }
        }
    };

    try {
        const command = new SendEmailCommand(params);
        await sesClient.send(command);
    } catch (error) {
        throw error;
    }
}