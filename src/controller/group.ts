/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Controller
 * @description Group
 */

import { ObjectID } from "bson";
import { GroupModel, IGroupModel } from "../model/group";

export const getGroupById = async (id: ObjectID): Promise<IGroupModel | null> =>
    await GroupModel.findOne({
        _id: id,
    });
