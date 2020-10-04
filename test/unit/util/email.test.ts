/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Email
 * @package Unit Test
 */

import { expect } from 'chai';
import * as Chance from "chance";
import { compareEmail } from '../../../src/util/email';

describe('Given [Email] Helper Methods', (): void => {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const chance: Chance.Chance = new Chance('brontosaurus-server-util-email');

    it('should be able to compare email', (): void => {

        const left: string = 'hello@email.com';
        const right: string = 'hello@email.com';
        const result: boolean = compareEmail(left, right);

        expect(result).to.be.true;
    });
});
