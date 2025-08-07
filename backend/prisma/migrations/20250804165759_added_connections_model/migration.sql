/*
  Warnings:

  - Added the required column `updatedAt` to the `connection_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."connection_requests" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "public"."CONNECTION_STATUS" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."Connections" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user1_id" TEXT NOT NULL,
    "user2_id" TEXT NOT NULL,

    CONSTRAINT "Connections_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Connections" ADD CONSTRAINT "Connections_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Connections" ADD CONSTRAINT "Connections_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
