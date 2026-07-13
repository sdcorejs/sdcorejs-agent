import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1700000000000 implements MigrationInterface {
  name = 'Initial1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE IF NOT EXISTS items (id uuid PRIMARY KEY, name varchar(120) NOT NULL, version integer NOT NULL DEFAULT 1)');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS items');
  }
}
