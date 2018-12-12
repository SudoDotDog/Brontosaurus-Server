/**
 * @author WMXPY
 * @namespace Brontosaurus_Server
 * @description Index
 */

import { SudooExpress, SudooExpressApplication } from '@sudoo/express';
import * as BodyParser from 'body-parser';

const setting: SudooExpressApplication = SudooExpressApplication.create('Brontosaurus', '1');
const app: SudooExpress = SudooExpress.create(setting);

app.use(BodyParser());

app.host(8080);
