import { AzureOpenAI } from 'openai'
import { NextResponse } from 'next/server'
import {
  supercompat,
  azureOpenaiClientAdapter,
} from 'supercompat'

const tools = [
  {
    "type": "function",
    "function": {
      "name": "get_current_weather",
      "description": "Get the current weather in a given location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "The city and state, e.g. San Francisco, CA",
          },
          "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
        },
        "required": ["location"],
      },
    }
  }
]

export const GET = async () => {
  const client = supercompat({
    client: azureOpenaiClientAdapter({
      azureOpenai: new AzureOpenAI({
        endpoint: process.env.EXAMPLE_AZURE_OPENAI_ENDPOINT,
        apiVersion: '2024-11-20',
        fetch: (url: RequestInfo, init?: RequestInit): Promise<Response> => (
          fetch(url, {
            ...(init || {}),
            cache: 'no-store',
            // @ts-ignore-next-line
            duplex: 'half',
          })
        ),
      }),
    }),
  })

  const agentId = 'agent_ZrKBc3znUGrm6L0cKzSpfqXG'

  // Create a conversation
  const conversation = await client.agents.conversations.create({
    agentId: agentId,
    metadata: {
      userContext: 'weather_query'
    }
  })

  // Add message to conversation
  await client.agents.conversations.messages.create(conversation.id, {
    role: 'user',
    content: 'What is the weather in SF?'
  })

  // Start the agent run
  const run = await client.agents.conversations.runs.create(
    conversation.id,
    {
      agent_id: agentId,
      instructions: 'Use the get_current_weather and then answer the message.',
      stream: true,
      tools,
      configuration: {
        message_history_limit: 10
      }
    }
  )

  let requiresActionEvent
  let lastEvent

  for await (const event of run) {
    if (event.type === 'agent_action_required') {
      requiresActionEvent = event
    }
    lastEvent = event
  }

  if (!requiresActionEvent) {
    console.dir({ lastEvent }, { depth: null })
    throw new Error('No action required event')
  }

  const toolCallId = requiresActionEvent.data.action.tool_calls[0].id
  
  const submitToolOutputsRun = await client.agents.conversations.runs.submitToolOutputs(
    conversation.id,
    requiresActionEvent.data.run_id,
    {
      stream: true,
      tool_outputs: [
        {
          tool_call_id: toolCallId,
          output: '70 degrees and sunny.',
        },
      ],
    }
  )

  for await (const _event of submitToolOutputsRun) {
  }

  // Get conversation messages
  const messages = await client.agents.conversations.messages.list(conversation.id, { 
    limit: 10 
  })

  return NextResponse.json({
    messages,
  })
}