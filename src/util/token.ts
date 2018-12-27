/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Token
 */

import { BrontosaurusSign } from "@brontosaurus/core";
import { IApplicationModel } from "../model/application";

export const createToken = (username: string, application: IApplicationModel): string => {

    const sign: BrontosaurusSign = BrontosaurusSign.create({
        username,
    }, application.secret);

    sign.key(application.key);
    const token: string = sign.token(Date.now() + application.expire);

    return token;
};
