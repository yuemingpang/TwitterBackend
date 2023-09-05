import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { error } from "console";

const ses = new SESClient({});

function createCommand(toAddress: string, fromAddress: string, message: string) {
    return new SendEmailCommand({
        Destination: {
            ToAddresses: [toAddress]
        },
        Source: fromAddress, // the verified address on AWS SES
        Message: {
            Subject: {Charset: 'UTF-8', Data: "Your one-time token"},
            Body: {Text:{Charset: 'UTF-8', Data: message}},
        }
    });
}

export async function sendEmailToken(email: string, token: string) {

    const message = `Your one-time token is : ${token}`;
    // my verified address on AWS SES
    const command = createCommand(email, "pymdebaby@gmail.com", message);
    try {
        return await ses.send(command);
    } catch (e) {
        console.log("Error sending email", e);
        return error;
    }
}