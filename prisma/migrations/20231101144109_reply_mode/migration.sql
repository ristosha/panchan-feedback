-- CreateEnum
CREATE TYPE "reply_mode" AS ENUM ('FORWARD', 'COPY');

-- AlterTable
ALTER TABLE "bots" ADD COLUMN     "reply_mode" "reply_mode" NOT NULL DEFAULT 'COPY';
