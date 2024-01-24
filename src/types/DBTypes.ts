type User = {
  user_id: number;
  user_name: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
};

type Point = {
  x: number;
  y: number;
};

type Cat = {
  cat_id: number;
  cat_name: string;
  weight: number;
  owner: User | number; // owner should be a User or a number
  filename: string;
  birthdate: string; // Assuming birthdate can be null as per the database schema
  coords: Point;
};

export {User, Cat};
