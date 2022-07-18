import {
  Arg,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import argon2 from 'argon2';
import { User } from '../entities/User';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@InputType()
class UserInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Arg('input') input: UserInput,
    @Arg('confirmPassword') confirmPassword: string
  ): Promise<UserResponse> {
    console.log({ options });
    if (!options.username || !options.password) {
      return {
        errors: [
          {
            field: 'Username or Password',
            message: 'Please provide the necessary details to proceed',
          },
        ],
      };
    }

    if (options.password.length > 8) return {
      errors: [
        {
          field: 'password',
          message: 'Password length should not be less than 8'
        }
      ]
    }

    if (options.password !== confirmPassword) {
      console.log("The error occurs here")
      return {
        errors: [{
          
          field: 'password',
          message: "Passwords does not match!"
        }]
      }
    }

    const hashedPassword = await argon2.hash(options.password);
      const user = User.create({
      username: options.username,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      confirmPassword
    })

    console.log({ user });

    // if ()
    try {
    await user.save();
  } catch(err) {
    const _field = err.detail.split(' ')[1];
    const key = _field.includes('username') ? 'username' : _field.includes('email') ? 'email': '';

    console.log({key});
    if (err.code === '23505') {
      return {
        errors: [
          {
            field: key,
            message: `${_field} already exist`
          }
        ]
      }
    }
  }

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput
  ): Promise<UserResponse> {
    const user = await User.findOneBy({ username: options.username });

    console.log({ user });

    if (!user) {
      console.log('Lights, Camera, Action!');

      return {
        errors: [
          {
            field: 'username',
            message: 'Username does not exist',
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);

    console.log({ valid });

    if (!valid) {
      console.log('Sorry!');
      return {
        errors: [
          {
            field: 'password',
            message: 'Password not correct',
          },
        ],
      };
    }

    console.log('We got here!');

    return {
      user,
    };
  }

  @Query(() => [User])
  users(): Promise<User[]> {
    return User.find();
  }
}
