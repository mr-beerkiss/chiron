/* eslint-env jest */
import chiron, { ActionTypes } from '.'

describe('chiron', () => {
  const defaultGreeting = 'Hello, I`m Chiron!'
  const testUser = 'testuser'

  let defaultBot = chiron()
  let defaultSessionId = defaultBot.sessions.createSession(testUser)

  it('has an API', () => {
    expect(typeof defaultBot.learn).toBe('function')
    expect(typeof defaultBot.respond).toBe('function')
    expect(typeof defaultBot.getAction).toBe('function')
    expect(typeof defaultBot.getActions).toBe('function')
  })

  it('has some default actions', () => {
    expect(defaultBot.respond(defaultSessionId, 'hello')).toEqual(defaultGreeting)
  })

  describe('respond API', () => {
    const testMsg = 'This should be ok'

    let scopedBot
    let scopedSessionId

    beforeEach(() => {
      scopedBot = chiron()
      scopedSessionId = scopedBot.sessions.createSession(testUser)
    })

    it('requires a valid session id', () => {
      const thrownMsg = 'A valid session id is required to call this method'
      expect(scopedBot.respond).toThrow(thrownMsg)
      const dodgyscopedSessionId = 'A dodgy session id'
      expect(scopedBot.respond.bind(scopedBot, dodgyscopedSessionId, testMsg)).toThrow(thrownMsg)
      expect(scopedBot.respond.bind(scopedBot, scopedSessionId, testMsg)).toBeTruthy()
    })

    it('throws an error if invalid input type is provided', () => {
      const thrownMsg = 'Input must be present and be of type string'
      expect(scopedBot.respond.bind(scopedBot, scopedSessionId)).toThrow(thrownMsg)
      const dodgyArgs = [null, 45.1, [1, 2, 3], {foo: 'bar'}]
      dodgyArgs.forEach(a => expect(scopedBot.respond.bind(scopedBot, scopedSessionId, a)).toThrow(thrownMsg))
      expect(scopedBot.respond.bind(scopedBot, scopedSessionId, testMsg)).toBeTruthy()
    })

    it('returns a default message when it doesn\'t understand the input', () => {
      expect(scopedBot.respond(scopedSessionId, 'dflkasjglasjlgas')).toEqual('I\'m sorry, I don\'t know what to do about that')
    })

    it('can use various keywords to perform the same action', () => {
      const keywords = ['hi', 'hello', 'hey', 'howdy']
      keywords.forEach(k => expect(scopedBot.respond(scopedSessionId, k)).toEqual(defaultGreeting))
    })

    it('doesn`t care about input case', () => {
      const keywords = ['hi', 'HI', 'Hi', 'hI']
      keywords.forEach(k => expect(scopedBot.respond(scopedSessionId, k)).toEqual(defaultGreeting))
    })
  })

  describe('learn API', () => {
    let scopedBot
    let scopedSessionId

    beforeEach(() => {
      scopedBot = chiron()
      scopedSessionId = scopedBot.sessions.createSession(testUser)
    })

    const action = {
      label: 'test',
      type: ActionTypes.SAY,
      keywords: ['test', 'testing', 'testable'],
      response: 'Clearly you running a test!'
    }

    it('requires a valid session id', () => {
      const thrownMsg = 'A valid session id is required to call this method'
      expect(scopedBot.learn).toThrow(thrownMsg)
      const dodgyscopedSessionId = 'A dodgy session id'
      expect(scopedBot.learn.bind(scopedBot, dodgyscopedSessionId, action)).toThrow(thrownMsg)
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, action)).toBeTruthy()
    })

    it('throws an error if invalid input type is provided', () => {
      const thrownMsg = 'Input must be present and must be an object'
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId)).toThrow(thrownMsg)
      const dodgyArgs = [null, 'A string', 43.5, [1, 2, 3]]
      dodgyArgs.forEach(a => expect(scopedBot.learn.bind(scopedBot, scopedSessionId, a)).toThrow(thrownMsg))
    })

    it('validates its input object', () => {
      const badAction = {}
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, badAction)).toThrow('Action must have a label')
      badAction.label = 'Some label'
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, badAction)).toThrow('Action type is not valid')
      badAction.type = Symbol('faulty-action')
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, badAction)).toThrow('Action type is not valid')
      badAction.type = ActionTypes.SAY
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, badAction)).toThrow('Action must have a keywords array')
      badAction.keywords = []
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, badAction)).toThrow('Action must have at least one keyword')
      badAction.keywords = ['some keyword']
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, badAction)).toThrow('Action must supply a response string')
      badAction.response = 'some response'
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, badAction)).toBeTruthy()
    })

    it('returns a learned action', () => {
      scopedBot.learn(scopedSessionId, action)
      expect(scopedBot.getAction(action.label)).toEqual(action)
    })

    it('learns a new action and responds accordingly', () => {
      scopedBot.learn(scopedSessionId, action)
      action.keywords.forEach(kw => expect(scopedBot.respond(scopedSessionId, kw)).toEqual(action.response))
    })
  })
})
