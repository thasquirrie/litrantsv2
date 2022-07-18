import { Field, ObjectType } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Field(() => String)
  @Column()
  firstName: string;
  
  @Field(() => String)
  @Column()
  lastName: string;
  
  @Field(() => String)
  @Column({ unique: true })
  username: string;
  
  @Field(() => String)
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  confirmPassword: string;
  
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
  
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
