import {Response} from 'express';

type MessageResponse = {
  message: string;
};

type ErrorResponse = MessageResponse & {
  stack?: string;
};

type TypedResponse<T> = Omit<Response, 'json'> & {json(data: T): Response};

export {TypedResponse, MessageResponse, ErrorResponse};
