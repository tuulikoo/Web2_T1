import {RowDataPacket} from 'mysql2';
import {User} from './User';
interface Cat {
  // TODO: create a cat interface
  // owner should be a User or a number
}

interface GetCat extends RowDataPacket, Cat {}

// TODO: create PostCat interface or type. Same as cat but without id

// TODO: create PutCat interface or type. Sameas PostCat but properties are optional

export {Cat, GetCat};
