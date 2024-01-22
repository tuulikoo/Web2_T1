import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import passport from '../../passport';
import CustomError from '../../classes/CustomError';
import {User} from '../../types/DBTypes';

const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'local',
    {session: false},
    (err: Error, user: Partial<User>) => {
      console.log('Auth Controller - User before login:', user);

      if (err || !user) {
        console.log('Auth Controller - Invalid username/password');
        next(new CustomError('Invalid username/password', 200));
        return;
      }

      req.login(user, {session: false}, (error) => {
        if (error) {
          console.log('Auth Controller - Login error');
          next(new CustomError('Login error', 400));
          return;
        }

        delete user.password; // this is the reason for partial
        console.log('Auth Controller - User after login:', user);

        const token = jwt.sign(user, 'asdf');
        return res.json({user, token});
      });
    }
  )(req, res, next);
};

export {login};
