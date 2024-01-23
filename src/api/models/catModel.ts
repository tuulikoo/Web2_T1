import {promisePool} from '../../database/db';
import CustomError from '../../classes/CustomError';
import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {Cat} from '../../types/DBTypes';
import {MessageResponse} from '../../types/MessageTypes';

const getAllCats = async (): Promise<Cat[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & Cat[]>(
    `
    SELECT cat_id, cat_name, weight, filename, birthdate, ST_X(coords) as lat, ST_Y(coords) as lng,
    JSON_OBJECT('user_id', sssf_user.user_id, 'user_name', sssf_user.user_name) AS owner 
	  FROM sssf_cat 
	  JOIN sssf_user 
    ON sssf_cat.owner = sssf_user.user_id
    `
  );
  if (rows.length === 0) {
    throw new CustomError('No cats found', 404);
  }
  const cats = (rows as Cat[]).map((row) => ({
    ...row,
    owner: JSON.parse(row.owner?.toString() || '{}'),
  }));

  return cats;
};
// TODO: create getCat function to get single cat

// TODO: use Utility type to modify Cat type for 'data'.
// Note that owner is not User in this case. It's just a number (user_id)
const getCat = async (catId: number): Promise<Cat> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & Cat[]>(
    `
    SELECT cat_id, cat_name, weight, filename, birthdate, ST_X(coords) as lat, ST_Y(coords) as lng,
    JSON_OBJECT('user_id', sssf_user.user_id, 'user_name', sssf_user.user_name) AS owner 
    FROM sssf_cat 
    JOIN sssf_user 
    ON sssf_cat.owner = sssf_user.user_id
    WHERE cat_id = ?;
    `,
    [catId]
  );
  if (rows.length === 0) {
    throw new CustomError('No cat found', 404);
  }
  const cat = {
    ...rows[0],
    owner: JSON.parse(rows[0].owner?.toString() || '{}'),
  };

  return cat;
};

// TODO: create updateCat function to update single cat
// if role is admin, update any cat
// if role is user, update only cats owned by user
// You can use updateUser function from userModel as a reference for SQL

type UpdateCatData = Partial<Omit<Cat, 'cat_id'>> & {owner?: number};

const updateCat = async (
  data: Cat | UpdateCatData,
  catId: number,
  user_id: number,
  userRole: 'admin' | 'user'
): Promise<MessageResponse> => {
  const catData: UpdateCatData =
    'owner' in data ? (data as UpdateCatData) : {owner: data.owner};

  if (userRole === 'user' && catData.owner !== user_id) {
    throw new CustomError('User role requires "owner" field', 400);
  }

  let updateSql = 'UPDATE sssf_cat SET ? WHERE cat_id = ?';
  const updateValues: (UpdateCatData | number)[] = [catData, catId];

  if (userRole === 'user' && catData.owner === user_id) {
    // Ensure the user can only update cats they own
    updateSql += ' AND owner = ?;';
    updateValues.push(user_id);
  }

  const sql = promisePool.format(updateSql, updateValues);

  const [headers] = await promisePool.execute<ResultSetHeader>(sql);

  if (headers.affectedRows === 0) {
    throw new CustomError('No cats updated', 400);
  }

  return {message: 'Cat updated'};
};

type AddCatData = {
  cat_name: string;
  weight: number;
  owner: number;
  filename: string;
  birthdate: string | null;
  lat: number;
  lng: number;
};

const addCat = async (data: AddCatData): Promise<MessageResponse> => {
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `
    INSERT INTO sssf_cat (cat_name, weight, owner, filename, birthdate, coords) 
    VALUES (?, ?, ?, ?, ?, POINT(?, ?))
    `,
    [
      data.cat_name,
      data.weight,
      data.owner,
      data.filename,
      data.birthdate,
      data.lat,
      data.lng,
    ]
  );
  if (headers.affectedRows === 0) {
    throw new CustomError('No cats added', 400);
  }
  return {message: 'Cat added'};
};
//deletCat oli valmiina
const deleteCat = async (catId: number): Promise<MessageResponse> => {
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `
    DELETE FROM sssf_cat 
    WHERE cat_id = ?;
    `,
    [catId]
  );
  if (headers.affectedRows === 0) {
    throw new CustomError('No cats deleted', 400);
  }
  return {message: 'Cat deleted'};
};

export {getAllCats, getCat, addCat, updateCat, deleteCat};
