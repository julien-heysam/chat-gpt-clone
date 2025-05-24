-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "cost" DOUBLE PRECISION,
ADD COLUMN     "inputTokens" INTEGER,
ADD COLUMN     "outputTokens" INTEGER;
