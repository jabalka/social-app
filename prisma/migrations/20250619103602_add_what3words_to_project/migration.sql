-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "postcode" TEXT,
ADD COLUMN     "what3words" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "what3words" TEXT;

-- CreateTable
CREATE TABLE "_IdeaCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_IdeaCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_IdeaCategories_B_index" ON "_IdeaCategories"("B");

-- AddForeignKey
ALTER TABLE "_IdeaCategories" ADD CONSTRAINT "_IdeaCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IdeaCategories" ADD CONSTRAINT "_IdeaCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
