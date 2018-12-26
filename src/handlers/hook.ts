/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Handlers
 * @description Hook
 */

import { SudooExpressHook } from '@sudoo/express';
import { SudooLog } from '@sudoo/log';

export const basicHook: SudooExpressHook<[string, boolean?]> =
    SudooExpressHook.create<[string, boolean?]>()
        .before((content: string, isInfo: boolean = false): true => {

            const log = SudooLog.global;
            if (isInfo) {
                log.info(content);
            } else {
                log.verbose(content);
            }

            return true;
        });

