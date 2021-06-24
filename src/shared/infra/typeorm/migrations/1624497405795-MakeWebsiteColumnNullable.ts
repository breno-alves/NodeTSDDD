import {MigrationInterface, QueryRunner} from "typeorm";

export class MakeWebsiteColumnNullable1624497405795 implements MigrationInterface {
    name = 'MakeWebsiteColumnNullable1624497405795'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "website" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "website" SET NOT NULL`);
    }

}
