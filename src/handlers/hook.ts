/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Handlers
 * @description Hook
 */

import { SudooExpressHook, SudooExpressRequest, SudooExpressResponse } from '@sudoo/express';
import { SudooLog } from '@sudoo/log';

export const autoHook: SudooExpressHook<[string, boolean?]> =
    SudooExpressHook.create<[string, boolean?]>()
        .before((req: SudooExpressRequest, res: SudooExpressResponse, content: string, isInfo: boolean = false): boolean => {

            const log: SudooLog = SudooLog.global;
            const isFailed: boolean = res.agent.isFailed();

            const parsedContent = `${content}: ${
                isFailed
                    ? 'Failed'
                    : 'Entered'
                }`;

            if (isInfo) {
                log.info(`${req.path} - ${parsedContent}`);
            } else {
                log.verbose(`${req.path} - ${parsedContent}`);
            }

            return !isFailed;
        });

