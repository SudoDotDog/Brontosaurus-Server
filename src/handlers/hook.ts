/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Handlers
 * @description Hook
 */

import { SudooExpressHook, SudooExpressRequest, SudooExpressResponse } from '@sudoo/express';
import { SudooLog } from '@sudoo/log';

export const basicHook: SudooExpressHook<[string, boolean?]> =
    SudooExpressHook.create<[string, boolean?]>()
        .before((_: SudooExpressRequest, res: SudooExpressResponse, content: string, isInfo: boolean = false): boolean => {

            const log: SudooLog = SudooLog.global;
            const isFailed: boolean = res.agent.isFailed();

            const parsedContent = `${content}: ${
                isFailed
                    ? 'Failed'
                    : 'Entered'
                }`;

            if (isInfo) {
                log.info(parsedContent);
            } else {
                log.verbose(parsedContent);
            }

            return !isFailed;
        });

