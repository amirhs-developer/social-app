import Joi , {ObjectSchema} from 'joi';


const signupSchema : ObjectSchema = Joi.object().keys({

  username: Joi.string().required().min(4).max(8).messages({
    'string.base': 'username must be a string type',
    'string.min': 'invalid username . t characters < 4',
    'string.max': 'invalid username . t characters > 8',
    'string.empty': 'username can not be empty'
  }),

  password: Joi.string().required().min(4).max(8).messages({
    'string.base': 'password must be a string type',
    'string.min': 'invalid password . t characters < 4',
    'string.max': 'invalid password . t characters > 8',
    'string.empty': 'password can not be empty'
  }),

  email: Joi.string().required().email().messages({
    'string.base': 'email must be a string type',
    'string.email': 'email must be valid',
    'string.empty': 'email can not be empty'
  }),

  avatarColor: Joi.string().required().messages({
    'any.required': 'avatar color is required'
  }),

  avatarImage: Joi.string().required().messages({
    'any.required': 'avatar image is required'
  })

});

export {signupSchema};
