/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { hash,compare } from 'bcryptjs';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { model , Model , Schema} from 'mongoose';


const SALT_ROUND = 10;


const authSchema : Schema = new Schema(
  {
    username: {type: String },
    uid: {type: String },
    email: {type: String },
    password: {type: String },
    avatarColor: {type: String },
    createdAt: {type: Date , default: Date.now },
    passwordResetToken: {type: String , default: ''},
    passwordResetExpires: {type: Number }
  } ,
  {
    toJSON: {
      transform(_doc , ret) {
        delete ret.password; // delete password in response
        return ret; // return other properties
      }
    }
  }
);


authSchema.pre('save' , async function (this: IAuthDocument , next: () => void) {
  // hash the password before save in db
  const hashedPassword : string = await hash(this.password as string , SALT_ROUND);
  // copy hashed password to password request body
  this.password = hashedPassword;
  // next for continuation
  next();
});


authSchema.methods.comparePassword = async function (password: string) : Promise<boolean> {
  const hashedPassword : string = (this as unknown as IAuthDocument).password!;
  return compare(password , hashedPassword);
};


authSchema.methods.hashPassword = async function (password: string) : Promise<string> {
  return hash(password , SALT_ROUND);
};

const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('Auth' , authSchema , 'Auth');

export { AuthModel };

