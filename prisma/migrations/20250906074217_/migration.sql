-- CreateTable
CREATE TABLE `Member` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `mobileNo` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `document` JSON NOT NULL,
    `extra` JSON NULL,
    `userid` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TourPackage` (
    `id` VARCHAR(191) NOT NULL,
    `packageName` VARCHAR(191) NOT NULL,
    `tourPrice` DOUBLE NOT NULL,
    `totalSeat` INTEGER NOT NULL,
    `coverPhoto` VARCHAR(191) NULL,
    `desc` VARCHAR(191) NOT NULL,
    `extra` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TourMember` (
    `id` VARCHAR(191) NOT NULL,
    `memberIds` JSON NOT NULL,
    `tourPackageId` VARCHAR(191) NOT NULL,
    `packagePrice` DOUBLE NOT NULL,
    `memberCount` INTEGER NOT NULL,
    `netCost` DOUBLE NOT NULL,
    `discount` DOUBLE NULL,
    `totalCost` DOUBLE NOT NULL,
    `paymentType` ENUM('ONE_TIME', 'EMI', 'PARTIAL') NOT NULL,
    `paymentStatus` ENUM('PENDING', 'PARTIAL', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `nextReminder` DATETIME(3) NULL,
    `lastReminder` DATETIME(3) NULL,
    `reminderCount` INTEGER NOT NULL DEFAULT 0,
    `extra` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `tourMemberId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paymentMethod` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'PARTIAL', 'PAID', 'FAILED') NOT NULL DEFAULT 'PAID',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MemberToTourMember` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_MemberToTourMember_AB_unique`(`A`, `B`),
    INDEX `_MemberToTourMember_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_userid_fkey` FOREIGN KEY (`userid`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TourMember` ADD CONSTRAINT `TourMember_tourPackageId_fkey` FOREIGN KEY (`tourPackageId`) REFERENCES `TourPackage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_tourMemberId_fkey` FOREIGN KEY (`tourMemberId`) REFERENCES `TourMember`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MemberToTourMember` ADD CONSTRAINT `_MemberToTourMember_A_fkey` FOREIGN KEY (`A`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MemberToTourMember` ADD CONSTRAINT `_MemberToTourMember_B_fkey` FOREIGN KEY (`B`) REFERENCES `TourMember`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
