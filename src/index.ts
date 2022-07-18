import 'reflect-metadata';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';

const main = async () => {
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'litrants',
    username: 'thasquirrie',
    password: 'bigdad',
    logging: true,
    synchronize: true,
    entities: [Post, User],
  });

  await dataSource.initialize();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: 'sq',
      store: new RedisStore({ client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day,
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__,

      },
      secret: 'thasquirrie',
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({req, res}) => ({req, res, redis}),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log('Server started on localhost:4000');
  });
};

main();
