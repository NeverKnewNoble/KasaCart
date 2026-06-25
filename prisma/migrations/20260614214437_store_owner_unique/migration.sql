-- One store per seller: replace the plain owner_id index with a unique one.
-- DropIndex
DROP INDEX "stores_owner_id_idx";

-- CreateIndex
CREATE UNIQUE INDEX "stores_owner_id_key" ON "stores"("owner_id");
