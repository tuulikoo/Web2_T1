import {
  addUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../models/userModel';
import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import bcrypt from 'bcryptjs';
import {User} from '../../types/DBTypes';
import {MessageResponse} from '../../types/MessageTypes';
import {validationResult} from 'express-validator';
const salt = bcrypt.genSaltSync(12);

const userListGet = async (
  _req: Request,
  res: Response<User[]>,
  next: NextFunction
) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const userGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response<User>,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const user = await getUser(id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// TODO: create userPutCurrent function to update current user
// userPutCurrent should use updateUser function from userModel
// userPutCurrent should use validationResult to validate req.body

// TODO: create userDelete function for admin to delete user by id
// userDelete should use deleteUser function from userModel
// userDelete should use validationResult to validate req.params.id
// userDelete should use req.user to get role

// TDOD: create userPost function to add new user
// userPost should use addUser function from userModel
// userPost should use validationResult to validate req.body
// - user_name should be at least 3 characters long
// - email should be a valid email
// - password should be at least 5 characters long
// userPost should use bcrypt to hash password

const userPost = async (
  req: Request<{}, {}, User>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('userPostCurrent validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const {user_name, email, password} = req.body;

    // Hash the password before storing it in the database
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser: User = {
      user_id: 0,
      user_name,
      email,
      password: hashedPassword,
      role: 'user',
    };

    const result = await addUser(newUser);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
//userPut oli valmiina))
const userPut = async (
  req: Request<{id: number}, {}, User>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const user = req.body;
    if (user && user.role !== 'admin') {
      throw new CustomError('Admin only', 403);
    }
    const result = await updateUser(user, req.params.id);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const userPutCurrent = async (
  req: Request<{id: number}, {}, User>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('userPutCurrent validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const user = req.body;

    const result = await updateUser(user, req.params.id);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
const userDelete = async (
  req: Request<{id: string}, {}, User>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const user = req.body;
    // Ensure the requesting user has admin role
    if (user && user.role !== 'admin') {
      console.log('User Controller - Admin only');
      throw new CustomError('Admin only', 403);
    }

    const id = Number(req.params.id);
    const result = await deleteUser(id);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const userDeleteCurrent = async (
  req: Request,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const user = req.body;
    if (!user?.user_id) {
      throw new CustomError('No user', 400);
      console.log('******************userDeleteCurrent validation' + req.body);
    }

    const result = await deleteUser(user.user_id);

    res.json(result);
  } catch (error) {
    next(error);
    console.log('******************userDeleteCurrent validation' + req.body);
  }
};

const checkToken = (req: Request, res: Response, next: NextFunction) => {
  const user = req.body;
  if (!user) {
    next(new CustomError('Token not valid', 403));
  } else {
    res.json(user);
  }
};

export {
  userListGet,
  userGet,
  userPost,
  userPut,
  userPutCurrent,
  userDelete,
  checkToken,
  userDeleteCurrent,
};
