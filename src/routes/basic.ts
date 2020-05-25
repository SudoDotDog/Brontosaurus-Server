/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Basic
 */

import { ISudooExpressRoute, ROUTE_MODE, SudooExpressHandler } from "@sudoo/express";
import { SudooLog } from '@sudoo/log';
import { ConnorError, ErrorCreationFunction } from "connor";
import { getErrorCreationFunction } from "../util/error";

export type BaseAttemptBody = {

    readonly target: string;
    readonly platform: string;

    readonly userAgentOverride?: string;
};

export abstract class BrontosaurusRoute implements ISudooExpressRoute {

    public abstract readonly path: string;
    public abstract readonly mode: ROUTE_MODE;
    public abstract readonly groups: SudooExpressHandler[];

    protected readonly _error: ErrorCreationFunction = getErrorCreationFunction();
    protected readonly _log: SudooLog = SudooLog.global;

    public onError(code: number, error: Error) {

        const err: ConnorError = error as any;
        this._log.error(`${this.path} - ${error.message} (${code})`);

        return {
            code,
            message: String(err.code),
        };
    }
}
