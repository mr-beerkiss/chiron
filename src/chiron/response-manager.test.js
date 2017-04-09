/* eslint-env jest */

import responseManager from './response-manager'

describe('respond API', () => {
  const testMsg = 'This should be ok'
  const defaultGreeting = 'Hello, I`m Chiron!'

  let responder

  beforeEach(() => {
    responder = responseManager()
  })

  it('throws an error if invalid input type is provided', () => {
    const thrownMsg = 'Input must be present and be of type string'
    expect(responder.respond.bind(responder)).toThrow(thrownMsg)
    const dodgyArgs = [null, 45.1, [1, 2, 3], {foo: 'bar'}]
    dodgyArgs.forEach(a => expect(responder.respond.bind(responder, a)).toThrow(thrownMsg))
    expect(responder.respond.bind(responder, testMsg)).toBeTruthy()
  })

  it('returns a default message when it doesn\'t understand the input', () => {
    expect(responder.respond('dflkasjglasjlgas')).toEqual('I\'m sorry, I don\'t know what to do about that')
  })

  it('can use various keywords to perform the same action', () => {
    const keywords = ['hi', 'hello', 'hey', 'howdy']
    keywords.forEach(k => expect(responder.respond(k)).toEqual(defaultGreeting))
  })

  it('doesn`t care about input case', () => {
    const keywords = ['hi', 'HI', 'Hi', 'hI']
    keywords.forEach(k => expect(responder.respond(k)).toEqual(defaultGreeting))
  })
})
