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
  // console.log("start")

  const client = new OpenAI({
    apiKey: 'SUPERCOMPAT_PLACEHOLDER_OPENAI_KEY',
    fetch: supercompat({
      client: groqClientAdapter({
        groq: new Groq(),
      }),
      storage: prismaStorageAdapter({
        prisma,
      }),
      runAdapter: completionsRunAdapter({
        messagesHistoryLength: 10,
      }),
    }),
  })

  // const chatCompletion = await client.chat.completions.create({
  //   messages: [{ role: 'user', content: 'Say this is a test' }],
  //   // model: 'gpt-3.5-turbo',
  //   model: 'llama3-8b-8192',
  // })

  // console.dir({ chatCompletion }, { depth: null })
    // (...args) => {
    //   console.dir({ args }, { depth: null })
    //   return fetch(...args)
    // },

  // const client = supercompat({
  //   client: new Groq(),
  //   storage: prismaStorageAdapter({
  //     prisma,
  //   }),
  //   runAdapter: completionsRunAdapter({
  //     messagesHistoryLength: 10,
  //   }),
  // })

  const assistantId = 'b7fd7a65-3504-4ad3-95a0-b83a8eaff0f3'

  const thread = await client.beta.threads.create({
    messages: [],
    metadata: {
      assistantId,
    },
  })

  console.dir({ thread })
  await client.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: 'Who won the world series in 2020?'
  })

  return NextResponse.json({
    success: true,
  })
  //
  //
  // await client.beta.threads.runs.createAndPoll(
  //   thread.id,
  //   {
  //     assistant_id: assistantId,
  //     instructions: 'Just reply',
  //     model: 'llama3-8b-8192',
  //   },
  // )
  //
  // const threadMessages = await client.beta.threads.messages.list(thread.id)
  //
  // return NextResponse.json({
  //   threadMessages,
  // })
}
