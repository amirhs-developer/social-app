/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// any request in req.body anv and send to joi validate for validation and send to server

import { joiRequestValidationError } from '@global/helpers/error.handler';
import { Request } from 'express';
import { ObjectSchema } from 'joi';


type IJoiDecorator = (target: any , key: string , descriptor: PropertyDescriptor) => void;


export function joiValidation (schema: ObjectSchema) : IJoiDecorator {

  return ( _target: any , _key: string , descriptor: PropertyDescriptor ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any []) { // args => get all properties and use inside controller

      const req : Request = args[0]; // args[0] is the request args[1] is the response args[2] is the next

      // validate or asyncValidate
      const { error } = await Promise.resolve(schema.validate(req.body));

      if(error?.details) {
        throw new joiRequestValidationError(error.details[0].message);
      }
      return originalMethod.apply(this, args);

    };

    return descriptor;

  };

}





