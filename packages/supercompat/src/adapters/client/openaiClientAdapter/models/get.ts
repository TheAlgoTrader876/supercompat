import type OpenAI from 'openai'

export const get = ({
  openai,
}: {
  openai: OpenAI
}) => async (_url: string, _options: any) => {
  try {
    const data = await openai.models.list()

    return new Response(JSON.stringify(data), {
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
