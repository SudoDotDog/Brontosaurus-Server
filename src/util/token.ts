/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Token
 */

import { BrontosaurusSign } from "@brontosaurus/core";
import { IApplicationModel, INFOS_SPLITTER } from "@brontosaurus/db";
import { Basics, IBrontosaurusBody, IBrontosaurusHeader } from "@brontosaurus/definition";
import { _Map } from "@sudoo/bark/map";
import { SafeObject } from "@sudoo/extract";

export type SafeToken = {

    readonly header: SafeObject<IBrontosaurusHeader>;
    readonly body: SafeObject<IBrontosaurusBody>;
};

export const createToken = (body: IBrontosaurusBody, application: IApplicationModel): string => {

    const sign: BrontosaurusSign = BrontosaurusSign.create(application.key, body, {
        public: application.publicKey,
        private: application.privateKey,
    });
    const token: string = sign.token(Date.now() + application.expire);

    return token;
};

export const parseInfo = (infoRecord: Record<string, Basics>): string[] => {

    return _Map.keys(infoRecord).map((key: string) => key + INFOS_SPLITTER + infoRecord[key]);
};
