import {promisePool} from '../../database/db';
import CustomError from '../../classes/CustomError';
import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {Cat} from '../../types/DBTypes';
import {MessageResponse, UploadResponse} from '../../types/MessageTypes';

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

type UpdateCatData = Partial<Omit<Cat, 'cat_id'>> & {owner?: number};

const updateCat = async (
  data: Cat | UpdateCatData,
  catId: number,
  userRole: 'admin' | 'user' | undefined = undefined
): Promise<MessageResponse> => {
  const catData: UpdateCatData =
    'owner' in data ? (data as UpdateCatData) : {owner: data.owner};

  if (userRole === 'user' && catData.owner === undefined) {
    throw new CustomError('User role requires "owner" field', 400);
  }

  let updateSql = 'UPDATE sssf_cat SET ? WHERE cat_id = ?';
  const updateValues: any[] = [catData, catId];

  if (userRole === 'user') {
    updateSql += ' AND owner = ?';
    updateValues.push(catData.owner);
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
