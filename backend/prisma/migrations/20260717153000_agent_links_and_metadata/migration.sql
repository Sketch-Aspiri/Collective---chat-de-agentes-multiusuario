-- Extend agents with creator ownership and optional configuration.
ALTER TABLE "Agent"
ADD COLUMN "creatorId" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "llmConfig" JSONB,
ADD COLUMN "integrations" JSONB;

-- Existing local agents are assigned to the owner of their primary chat.
UPDATE "Agent" AS agent
SET "creatorId" = chat."ownerId"
FROM "Chat" AS chat
WHERE agent."chatId" = chat."id";

ALTER TABLE "Agent" ALTER COLUMN "creatorId" SET NOT NULL;

ALTER TABLE "Message" ADD COLUMN "metadata" JSONB;

CREATE TABLE "ChatAgentLink" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatAgentLink_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Chat_ownerId_idx" ON "Chat"("ownerId");
CREATE INDEX "ChatMember_userId_idx" ON "ChatMember"("userId");
CREATE INDEX "Agent_chatId_idx" ON "Agent"("chatId");
CREATE INDEX "Agent_creatorId_idx" ON "Agent"("creatorId");
CREATE UNIQUE INDEX "ChatAgentLink_chatId_agentId_key" ON "ChatAgentLink"("chatId", "agentId");
CREATE INDEX "ChatAgentLink_chatId_idx" ON "ChatAgentLink"("chatId");
CREATE INDEX "ChatAgentLink_agentId_idx" ON "ChatAgentLink"("agentId");
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

ALTER TABLE "ChatMember" DROP CONSTRAINT "ChatMember_chatId_fkey";
ALTER TABLE "ChatMember" DROP CONSTRAINT "ChatMember_userId_fkey";
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_chatId_fkey";
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatAgentLink" ADD CONSTRAINT "ChatAgentLink_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatAgentLink" ADD CONSTRAINT "ChatAgentLink_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
