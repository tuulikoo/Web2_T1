type User = {
  user_id: number;
  user_name: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
};

type Point = {
  lat: number;
  lng: number;
};

type Cat = {
  cat_id: number;
  cat_name: string;
  weight: number;
  owner: User | number;
  filename: string;
  birthdate: string;
  coords: Point;
};

export {User, Cat};
