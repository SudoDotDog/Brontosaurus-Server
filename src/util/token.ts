/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Token
 */

import { BrontosaurusSign } from "@brontosaurus/core";
import { IBrontosaurusBody } from "@brontosaurus/definition";
import { IApplicationModel } from "../model/application";

export const createToken = (body: IBrontosaurusBody, application: IApplicationModel): string => {

    const sign: BrontosaurusSign = BrontosaurusSign.create(application.key, body, application.secret);
    const token: string = sign.token(Date.now() + application.expire);

    return token;
};
