-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "telegram_id" BIGINT NOT NULL,
    "locale" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bots" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "telegram_id" BIGINT NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "start_message" VARCHAR(4000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_users" (
    "bot_id" INTEGER NOT NULL,
    "telegram_id" BIGINT NOT NULL,
    "blocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "bot_users_pkey" PRIMARY KEY ("bot_id","telegram_id")
);

-- CreateTable
CREATE TABLE "bot_chats" (
    "bot_id" INTEGER NOT NULL,
    "telegram_id" BIGINT NOT NULL,
    "title" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,

    CONSTRAINT "bot_chats_pkey" PRIMARY KEY ("bot_id","telegram_id")
);

-- CreateTable
CREATE TABLE "messages" (
    "bot_id" INTEGER NOT NULL,
    "user_telegram_id" BIGINT NOT NULL,
    "message_id" BIGINT NOT NULL,
    "message_thread_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("user_telegram_id","message_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_id_key" ON "users"("telegram_id");

-- CreateIndex
CREATE UNIQUE INDEX "bots_token_key" ON "bots"("token");

-- CreateIndex
CREATE UNIQUE INDEX "bots_telegram_id_key" ON "bots"("telegram_id");

-- CreateIndex
CREATE INDEX "bots_owner_id_idx" ON "bots"("owner_id");

-- CreateIndex
CREATE INDEX "messages_bot_id_idx" ON "messages"("bot_id");

-- AddForeignKey
ALTER TABLE "bots" ADD CONSTRAINT "bots_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_users" ADD CONSTRAINT "bot_users_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_chats" ADD CONSTRAINT "bot_chats_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_bot_id_user_telegram_id_fkey" FOREIGN KEY ("bot_id", "user_telegram_id") REFERENCES "bot_users"("bot_id", "telegram_id") ON DELETE RESTRICT ON UPDATE CASCADE;
