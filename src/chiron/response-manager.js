const responseManager = () => {
  const DefaultResponses = [
    {
      label: 'greet',
      keywords: ['hello', 'hi', 'hey', 'howdy'],
      response: 'Hello, I`m Chiron!'
    },
    {
      label: 'why',
      keywords: ['why'],
      response: `
        My maker called me this based on the Greek Myth of Chiron.  A centaur sired by the titan
        Chronus, Chiron was reknowned as a teacher and a tutor.  It was said his personal skills
        were a match for Apollo.  https://en.wikipedia.org/wiki/Chiron
      `
    }
  ]

  const DEFAULT_RESPONSE = `I'm sorry, I don't know what to do about that`

  const responses = [...DefaultResponses]

  function responseFromKeyword (keyword) {
    return responses.find(v => v.keywords.includes(keyword))
  }

  return {
    respond (message) {
      // sanitize input
      if (typeof message !== 'string') throw new Error('Input must be present and be of type string')

      const response = responseFromKeyword(message.toLowerCase())

      if (!response) return DEFAULT_RESPONSE

      return response.response
    }
  }
}

export default responseManager
