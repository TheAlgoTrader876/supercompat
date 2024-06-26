import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import {
  supercompat,
  groqClientAdapter,
  prismaStorageAdapter,
  completionsRunAdapter,
} from 'supercompat'
import Groq from 'groq-sdk'
import { prisma } from '@/lib/prisma'

export const GET = async () => {
  const client = new OpenAI({
    apiKey: 'SUPERCOMPAT_PLACEHOLDER_OPENAI_KEY',
    fetch: supercompat({
      client: groqClientAdapter({
        groq: new Groq(),
      }),
      // client: groqClientAdapter({
      //   groq: new OpenAI({
      //     apiKey: process.env.OPENAI_API_KEY!,
      //   }),
      // }),
      storage: prismaStorageAdapter({
        prisma,
      }),
      runAdapter: completionsRunAdapter({
        messagesHistoryLength: 10,
      }),
    }),
  })

  const assistantId = 'b7fd7a65-3504-4ad3-95a0-b83a8eaff0f3'

  const thread = await client.beta.threads.create({
    messages: [],
    metadata: {
      assistantId,
    },
  })

  await client.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: 'Who won the world series in 2020?'
  })

  await client.beta.threads.runs.createAndPoll(
    thread.id,
    {
      assistant_id: assistantId,
      instructions: 'Just reply',
      model: 'llama3-8b-8192',
      // model: 'gpt-3.5-turbo',
    },
  )

  const threadMessages = await client.beta.threads.messages.list(thread.id, { limit: 10 })

  return NextResponse.json({
    threadMessages,
  })
}
