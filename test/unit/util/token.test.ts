/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Token
 * @package Unit Test
 */

import { ObjectID } from 'bson';
import { expect } from 'chai';
import * as Chance from "chance";
import { filterGroups } from '../../../src/util/token';

describe('Given [Token] Helper Methods', (): void => {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const chance: Chance.Chance = new Chance('brontosaurus-server-util-token');

    it('should be able to filter groups', (): void => {

        const group1: ObjectID = new ObjectID();
        const group2: ObjectID = new ObjectID();
        const group3: ObjectID = new ObjectID();

        const required: ObjectID[] = [group1, group2];
        const has: ObjectID[] = [group2, group3];

        const filtered: ObjectID[] = filterGroups(required, has);

        expect(filtered).to.be.lengthOf(1);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect((filtered[0]).equals(group2)).to.be.true;
    });
});
