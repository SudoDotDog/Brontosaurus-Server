/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Token
 */

import { BrontosaurusSign } from "@brontosaurus/core";
import { Basics, IBrontosaurusBody } from "@brontosaurus/definition";
import { _Map } from "@sudoo/bark";
import { INFOS_SPLITTER } from "../interface/account";
import { IApplicationModel } from "../model/application";

export const createToken = (body: IBrontosaurusBody, application: IApplicationModel): string => {

    const sign: BrontosaurusSign = BrontosaurusSign.create(application.key, body, application.secret);
    const token: string = sign.token(Date.now() + application.expire);

    return token;
};

export const parseInfo = (infoRecord: Record<string, Basics>): string[] => {

    return _Map.keys(infoRecord).map((key: string) => key + INFOS_SPLITTER + infoRecord[key]);
};
