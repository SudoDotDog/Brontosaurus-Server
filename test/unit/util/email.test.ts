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

    it('should be able to compare email domain', (): void => {

        const left: string = 'hello@world.com';
        const right: string = 'hello@email.com';
        const result: boolean = compareEmail(left, right);

        expect(result).to.be.false;
    });

    it('should be able to compare email extension', (): void => {

        const left: string = 'hello@email.com';
        const right: string = 'hello@email.net';
        const result: boolean = compareEmail(left, right);

        expect(result).to.be.false;
    });

    it('should be able to compare plus-added domain', (): void => {

        const left: string = 'hello@email+world.com';
        const right: string = 'hello@email.com';
        const result: boolean = compareEmail(left, right);

        expect(result).to.be.false;
    });

    it('should be able to compare email with double plus', (): void => {

        const left: string = 'hello+world@email.com';
        const right: string = 'hello+foo@email.com';
        const result: boolean = compareEmail(left, right);

        expect(result).to.be.true;
    });

    it('should be able to compare email with double plus - sad path', (): void => {

        const left: string = 'hello+world@email.com';
        const right: string = 'hellofoo+foo@email.com';
        const result: boolean = compareEmail(left, right);

        expect(result).to.be.false;
    });

    it('should be able to compare email with single plus', (): void => {

        const left: string = 'hello+world@email.com';
        const right: string = 'hello@email.com';
        const result: boolean = compareEmail(left, right);

        expect(result).to.be.true;
    });
});
