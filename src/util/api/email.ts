import sgMail from '@sendgrid/mail';

import { CONTACT_EMAIL, BRAND } from '@util/global';



const EMAIL_FOOTER = `<p>Thank you for using UniVerse. Email ${CONTACT_EMAIL} for any questions.</p>`;



export const sendActivationEmail = async (email: string, token: string) => {
    const msgText = `${BRAND} Account Activation. Type the following code in the app to verify your account: ${token}.`;
    const msgHtml = `
        <h1>${BRAND} Verification</h1>
        <p>Type the following code in the app to verify your account: </p>
        <p>${token}</p>

        <br />

        ${EMAIL_FOOTER}
    `;
    const mail = {
        email: email,
        subject: `Activate Your ${BRAND} Account`,
        msgText: msgText,
        msgHtml: msgHtml
    };

    const sgCode = await sendEmail(mail);
    return sgCode;
}



export interface MailType {
    email: string,
    subject: string,
    msgText: string,
    msgHtml: string
}
export const sendEmail = async (mail: MailType) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

    const msg = {
        to: mail.email,
        from: {
            email: CONTACT_EMAIL,
            name: BRAND
        },
        subject: mail.subject,
        text: mail.msgText,
        html: mail.msgHtml
    };

    const mailRes = await sgMail.send(msg);

    // https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api/responses
    return mailRes[0].statusCode;
}