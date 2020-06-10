/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Agent
 * @description Email
 */

import * as NodeMailer from "nodemailer";

export type SentEmailOption = {

    readonly from: string;
    readonly to: string;
    readonly subject: string;
    readonly html: string;
    readonly text: string;
};

export const sentEmailAgent = (config: any, options: SentEmailOption): Promise<boolean> => {

    const mailer = NodeMailer.createTransport(config);
    return new Promise<boolean>((resolve: (result: boolean) => void, reject: (reason: any) => void) => {
        mailer.sendMail(options, (err: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
};
