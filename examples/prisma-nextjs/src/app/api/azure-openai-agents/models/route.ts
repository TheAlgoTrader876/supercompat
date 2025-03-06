import { AzureOpenAI } from 'openai'
import { NextResponse } from 'next/server'
import {
  supercompat,
  azureOpenaiClientAdapter,
} from 'supercompat'

export const GET = async () => {
  const client = supercompat({
    client: azureOpenaiClientAdapter({
      azureOpenai: new AzureOpenAI({
        endpoint: process.env.EXAMPLE_AZURE_OPENAI_ENDPOINT,
        apiVersion: '2024-11-20',
      }),
    }),
  })

  const response = await client.agents.list()

  const agents = []

  for await (const agent of response) {
    agents.push(agent)
  }

  return NextResponse.json({
    agents,
  })
}