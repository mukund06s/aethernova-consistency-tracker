-- AlterTable
ALTER TABLE "habits" ADD COLUMN     "freezesAvailable" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "frozenUntil" TIMESTAMP(3),
ADD COLUMN     "isFrozen" BOOLEAN NOT NULL DEFAULT false;
