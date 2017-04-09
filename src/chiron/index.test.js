/* eslint-env mocha */
import shortid from 'shortid';

import chiron, { ActionTypes } from '.'

describe('chiron', () => {
  const defaultGreeting = 'Hello, I`m Chiron!'
  const testUser = 'testuser'

  let defaultBot = chiron()
  let defaultSessionId = defaultBot.createSession(testUser)

  it('has an API', () => {
    expect(typeof defaultBot.learn).toBe('function')
    expect(typeof defaultBot.respond).toBe('function')
    expect(typeof defaultBot.getAction).toBe('function')
    expect(typeof defaultBot.getActions).toBe('function')
    expect(typeof defaultBot.createSession).toBe('function')
    expect(typeof defaultBot.getSession).toBe('function')
    expect(typeof defaultBot.destroySession).toBe('function')
  })

  it('has some default actions', () => {
    expect(defaultBot.respond(defaultSessionId, 'hello')).toEqual(defaultGreeting)
  })

  describe('session API', () => {
    let scopedBot
    let scopedSessionId

    beforeEach(() => {
      scopedBot = chiron()
      scopedSessionId = scopedBot.createSession(testUser)
    })

    describe('create a session', () => {
      it('throws an error if invalid input is provided', () => {
        const thrownMsg = 'You must supply a string identifier to start a session'
        expect(scopedBot.createSession).toThrow(thrownMsg)
        const dodgyArgs = [null, 45.1, [1, 2, 3], {foo: 'bar'}]
        dodgyArgs.forEach(a => expect(scopedBot.createSession.bind(scopedBot, a)).toThrow(thrownMsg))        
        expect(scopedBot.createSession.bind(scopedBot, 'This should be ok')).toBeTruthy()
      })

      it('creates a session and returns a session id', () => {
        const sessionId = scopedBot.createSession(testUser)
        expect(typeof sessionId === 'string' && shortid.isValid(sessionId)).toBe(true)
      })
    })

    describe('returns an existing session', () => {
      it('returns null for an invalid session id', () => {
        const dodgyId = shortid.generate()
        expect(scopedBot.getSession(dodgyId)).toBeNull()
      })

      it('returns a valid session object for a valid id', done => {
        const session = scopedBot.getSession(scopedSessionId)
        expect(session.id).toEqual(scopedSessionId)
        expect(session.username).toEqual(testUser)
        setTimeout(() => {
          expect(session.timeCreated).toBeLessThan(Date.now())
          done()
        }, 10)
      })
    })

    describe('destroys a session', () => {
      it('throws an exception if the session does not exist', () => {
        const dodgyId = shortid.generate()
        const thrownMsg = 'The supplied session id does not exist'
        expect(scopedBot.destroySession.bind(scopedBot, dodgyId)).toThrow(thrownMsg)
      })

      it('successfully destroys an existing session', () => {
        expect(scopedBot.getSession(scopedSessionId)).toBeTruthy()
        scopedBot.destroySession(scopedSessionId)
        expect(scopedBot.getSession(scopedSessionId)).toBeNull()
      })
    })
  })

  describe('respond API', () => {
    const testMsg = 'This should be ok'

    let scopedBot
    let scopedSessionId

    beforeEach(() => {
      scopedBot = chiron()
      scopedSessionId = scopedBot.createSession(testUser)
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
      scopedSessionId = scopedBot.createSession(testUser)
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
