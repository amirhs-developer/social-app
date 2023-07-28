import HTTP_STATUS from 'http-status-codes';


export interface IErrorResponse {
    message: string;
    statusCode: number;
    status: string;
    serializeErrors() : IError;
}

export interface IError {
    message: string;
    statusCode: number;
    status: string;
}


export abstract class CustomError extends Error {

    abstract statusCode : number;
    abstract status: string;

    constructor(message: string) {
        super(message);
    }

    serializeErrors() : IError {
        return {
            message: this.message,
            statusCode: this.statusCode,
            status: this.status
        };
    }
}


export class BadRequestError extends CustomError {

    statusCode = HTTP_STATUS.BAD_REQUEST;
    status = 'Bad Request | error';

    constructor(message: string) {
        super(message);
    }
}


export class NotFoundError extends CustomError {

    statusCode = HTTP_STATUS.NOT_FOUND;
    status = 'Not Found | error';

    constructor(message: string) {
        super(message);
    }
}


export class ForbiddenError extends CustomError { 

    statusCode = HTTP_STATUS.FORBIDDEN;
    status = 'Forbidden | error';

    constructor(message : string) {
        super(message);
    }
}


export class NotAuthorizedError extends CustomError { 

    statusCode = HTTP_STATUS.UNAUTHORIZED;
    status = 'Not Authorized | error';

    constructor(message: string) {
        super(message);
    }
}

export class FileTooLargeError extends CustomError {
    statusCode = HTTP_STATUS.REQUEST_HEADER_FIELDS_TOO_LARGE;
    status = 'File Too Large | error';

    constructor(message : string) {
        super(message);
    }
}


export class ServerError extends CustomError {

    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    status = 'Server Error | error';

    constructor(message: string) {
        super(message);
    }
}



