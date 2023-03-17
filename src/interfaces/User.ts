import {RowDataPacket} from 'mysql2';
interface User {
  user_id: number;
  user_name: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
}

// TODO: create interface or type GetUser that extends RowDataPacket and User

// TODO create interface or type PostUser that extends User but without id

// TODO create interface or type PutUser that extends PostUser but all properties are optional

export {User};
