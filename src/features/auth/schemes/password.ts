import Joi , {ObjectSchema} from 'joi';

// create email and password schema

const emailSchema : ObjectSchema  = Joi.object().keys({

  email: Joi.string().email().required().messages({
    'string.base': 'filed must be valid',
    'string.email': 'filed must be valid',
    'string.empty': 'filed must be valid'
  })
});


const passwordSchema : ObjectSchema = Joi.object().keys({

  password: Joi.string().required().min(4).max(8).messages({
    'string.base': 'password must be a string type',
    'string.min': 'invalid password . t characters < 4',
    'string.max': 'invalid password . t characters > 8',
    'string.empty': 'password can not be empty'
  }),

  confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
    'any.only': 'password should match',
    'any.required': 'confirm password is a required field',
  })
});


export { emailSchema , passwordSchema };
