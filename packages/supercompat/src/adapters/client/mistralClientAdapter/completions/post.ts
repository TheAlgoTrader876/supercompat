import type { Mistral } from '@mistralai/mistralai'

export const post = ({
  mistral,
}: {
  mistral: Mistral
}) => async (_url: string, options: any) => {
  const body = JSON.parse(options.body)

  if (body.stream) {
    const response = await mistral.chat.stream(body)

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`)
        }

        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
      },
    })
  } else {
    try {
      const data = await mistral.chat.complete(body)

      return new Response(JSON.stringify({
        data,
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      return new Response(JSON.stringify({
        error,
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
  }
}
