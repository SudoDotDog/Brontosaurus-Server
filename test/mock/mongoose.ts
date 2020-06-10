/**
 * @author WMXPY
 * @namespace Brontosaurus_Server
 * @description Mongoose
 * @package Mock
 */

import { expect } from 'chai';
import * as mongoose from 'mongoose';

export class Connector {

    public static create(dbName?: string): Connector {

        return new Connector(dbName);
    }

    private readonly _dbName: string;
    private _timeout: number;

    private constructor(dbName?: string) {

        this._dbName = dbName || 'unit-test';
        this._timeout = 3000;
    }

    public get timeout(): number {

        return this._timeout;
    }

    public setTimeout(timeout: number): Connector {

        this._timeout = timeout;
        return this;
    }

    public before(): void {

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const connector: Connector = this;

        before(function (this: Mocha.Context, next: () => void): void {
            // eslint-disable-next-line no-invalid-this
            this.timeout(connector._timeout);
            mongoose.connect(
                `mongodb://localhost:27017/${connector._dbName}`,
                { useNewUrlParser: true },
            );

            const connection = mongoose.connection;
            connection.on('error', () => {
                // eslint-disable-next-line no-invalid-this
                this.skip();
            });
            connection.once('open', next);
        });
    }

    public verify(): void {

        it('Verify Connection', (): void => {

            expect(mongoose.connection.readyState).to.be.equal(1);
        }).timeout(this._timeout);
    }

    public after(): void {

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const connector: Connector = this;

        after(function (this: Mocha.Context, next: () => void): void {
            // eslint-disable-next-line no-invalid-this
            this.timeout(connector._timeout);
            if (!mongoose.connection.db) {
                // eslint-disable-next-line no-invalid-this
                this.skip();
            } else {
                mongoose.connection.db.dropDatabase((): void => {
                    mongoose.connection.close(next);
                });
            }
        });
    }
}
