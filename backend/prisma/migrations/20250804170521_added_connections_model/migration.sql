/*
  Warnings:

  - You are about to drop the `Connections` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Connections" DROP CONSTRAINT "Connections_user1_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Connections" DROP CONSTRAINT "Connections_user2_id_fkey";

-- DropTable
DROP TABLE "public"."Connections";

-- CreateTable
CREATE TABLE "public"."connections" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user1_id" TEXT NOT NULL,
    "user2_id" TEXT NOT NULL,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."connections" ADD CONSTRAINT "connections_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connections" ADD CONSTRAINT "connections_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
