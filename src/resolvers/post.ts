import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { Post } from '../entities/Post';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => String) id: string): Promise<Post | null> {
    return Post.findOneBy({ id });
  }

  @Mutation(() => Post)
  async createPost(@Arg('title', () => String) title: string): Promise<Post> {
    return Post.create({ title }).save();
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg('id') id: string,
    @Arg('title', () => String) title: string
  ): Promise<Post | null> {
    let post = await Post.findOneBy({ id });
    if (!post) return null;

    if (title !== 'undefined') {
      post.title = title;
      post.save();
      // await Post.update({id}, {title})
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id') id: string
  ): Promise<Boolean> {
    await Post.delete(id);
  }
}
