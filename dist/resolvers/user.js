"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const argon2_1 = __importDefault(require("argon2"));
const User_1 = require("../entities/User");
let UsernamePasswordInput = class UsernamePasswordInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UsernamePasswordInput.prototype, "username", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UsernamePasswordInput.prototype, "password", void 0);
UsernamePasswordInput = __decorate([
    (0, type_graphql_1.InputType)()
], UsernamePasswordInput);
let UserInput = class UserInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserInput.prototype, "firstName", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserInput.prototype, "lastName", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserInput.prototype, "email", void 0);
UserInput = __decorate([
    (0, type_graphql_1.InputType)()
], UserInput);
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let UserResolver = class UserResolver {
    async register(options, input, confirmPassword) {
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
        if (options.password.length > 8)
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'Password length should not be less than 8'
                    }
                ]
            };
        if (options.password !== confirmPassword) {
            console.log("The error occurs here");
            return {
                errors: [{
                        field: 'password',
                        message: "Passwords does not match!"
                    }]
            };
        }
        const hashedPassword = await argon2_1.default.hash(options.password);
        const user = User_1.User.create({
            username: options.username,
            password: hashedPassword,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            confirmPassword
        });
        console.log({ user });
        try {
            await user.save();
        }
        catch (err) {
            const _field = err.detail.split(' ')[1];
            const key = _field.includes('username') ? 'username' : _field.includes('email') ? 'email' : '';
            console.log({ key });
            if (err.code === '23505') {
                return {
                    errors: [
                        {
                            field: key,
                            message: `${_field} already exist`
                        }
                    ]
                };
            }
        }
        return { user };
    }
    async login(options) {
        const user = await User_1.User.findOneBy({ username: options.username });
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
        const valid = await argon2_1.default.verify(user.password, options.password);
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
    users() {
        return User_1.User.find();
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __param(1, (0, type_graphql_1.Arg)('input')),
    __param(2, (0, type_graphql_1.Arg)('confirmPassword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsernamePasswordInput,
        UserInput, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsernamePasswordInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Query)(() => [User_1.User]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "users", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map