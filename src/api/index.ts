import express from 'express';

import userRoute from './routes/userRoute';
import catRoute from './routes/catRoute';
import authRoute from './routes/authRoute';
import passport from 'passport';
import {MessageResponse, TypedResponse} from '../types/MessageTypes';

const router = express.Router();

router.use(passport.initialize());

router.get('/', (_req: Request, res: TypedResponse<MessageResponse>) => {
  res.json({
    message: 'routes: auth, user, cat',
  });
});

router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/cat', catRoute);

export default router;
