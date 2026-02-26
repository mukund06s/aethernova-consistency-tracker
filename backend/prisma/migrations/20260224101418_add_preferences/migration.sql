-- AlterTable
ALTER TABLE "users" ADD COLUMN     "confettiEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "soundEnabled" BOOLEAN NOT NULL DEFAULT true;
