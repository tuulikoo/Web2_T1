import express from 'express';
import {
  checkToken,
  userDelete,
  userDeleteCurrent,
  userGet,
  userListGet,
  userPost,
  userPut,
  userPutCurrent,
} from '../controllers/userController';
import passport from '../../passport';
import {body, param} from 'express-validator';

const router = express.Router();

router
  .route('/')
  .get(userListGet)
  .post(
    body('user_name').isLength({min: 3}).isString(),
    body('email').isEmail(),
    body('password').isLength({min: 5}).isString(),
    userPost
  )
  .put(passport.authenticate('jwt', {session: false}), userPutCurrent)
  .delete(passport.authenticate('jwt', {session: false}), userDeleteCurrent);

router.get(
  '/token',
  passport.authenticate('jwt', {session: false}),
  checkToken
);

router
  .route('/:id')
  .get(userGet)
  .put(passport.authenticate('jwt', {session: false}), userPut)
  .delete(passport.authenticate('jwt', {session: false}), userDelete);

export default router;

// - user_name should be at least 3 characters long
// - email should be a valid email
// - password should be at least 5 characters long
// userPost should use bcrypt to hash password
