/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Auth
 * @package Unit Test
 */

import { expect } from 'chai';
import * as Chance from "chance";
import { garblePassword } from '../../../src/util/auth';

describe('Given [Auth] Helper Methods', (): void => {

    const chance: Chance.Chance = new Chance('brontosaurus-server-util-auth');

    describe('Garble password', (): void => {

        it('should be able to hash', (): void => {

            const current: string = chance.string();
            const salt: string = chance.string();

            const saltedPassword: string = garblePassword(current, salt);
            const sameSaltedPassword: string = garblePassword(current, salt);

            expect(saltedPassword).to.be.equal(sameSaltedPassword);
        });
    });
});
