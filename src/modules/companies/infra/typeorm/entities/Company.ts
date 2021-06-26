import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { validateOrReject, MaxLength, MinLength } from 'class-validator';

@Entity('companies')
export default class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ length: 5 })
  @MinLength(5, {
    message: 'Zipcode too short!',
  })
  @MaxLength(5, {
    message: 'Zipcode too long!',
  })
  zipcode: string;

  @Column({ nullable: true })
  website: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  private validate(): Promise<void> {
    this.transformData();
    return validateOrReject(this);
  }

  private transformData(): void {
    this.website = this.website?.toLowerCase();
    this.name = this.name.toUpperCase();
  }
}
