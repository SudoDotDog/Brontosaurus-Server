/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Basic
 */

import { ISudooExpressRoute, ROUTE_MODE, SudooExpressErrorInfo, SudooExpressHandler } from "@sudoo/express";
import { SudooLog } from '@sudoo/log';
import { createStrictMapPattern, createStringPattern, Pattern } from "@sudoo/pattern";
import { ConnorError, ErrorCreationFunction } from "connor";
import { getErrorCreationFunction } from "../util/error";

export const extendAttemptBodyPattern = (record: Record<string, Pattern>): Pattern => {

    return createStrictMapPattern({

        target: createStringPattern(),
        platform: createStringPattern(),

        userAgentOverride: createStringPattern({
            optional: true,
        }),

        ...record,
    });
};

export type BaseAttemptBody = {

    readonly target: string;
    readonly platform: string;

    readonly userAgentOverride?: string;
};

export abstract class BrontosaurusRoute implements ISudooExpressRoute {

    protected readonly _error: ErrorCreationFunction = getErrorCreationFunction();
    protected readonly _log: SudooLog = SudooLog.global;

    public abstract readonly path: string;
    public abstract readonly mode: ROUTE_MODE;
    public abstract readonly groups: SudooExpressHandler[];

    public onError(code: number, error: Error): SudooExpressErrorInfo {

        const err: ConnorError = error as any;
        this._log.error(`${this.path} - ${error.message} (${code})`);

        return {
            code,
            message: String(err.code),
        };
    }
}
