/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Handlers
 * @description Handlers
 * @package Unit Test
 */

import { expect } from 'chai';
import * as Chance from "chance";
import { createTokenHandler } from '../../../src/handlers/handlers';

describe('Given [Handlers] Helper Methods', (): void => {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const chance: Chance.Chance = new Chance('brontosaurus-server-handlers-handlers');

    it('should be able to verify function type', (): void => {

        expect(typeof createTokenHandler).to.be.equal('function');
    });
});
