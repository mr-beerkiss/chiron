/* eslint-env mocha */
import { assert, expect } from 'chai'

import shortid from 'shortid'

import chiron, { ActionTypes } from '.'

describe('chiron', () => {
  const defaultGreeting = 'Hello, I`m Chiron!'
  const testUser = 'testuser'

  let defaultBot = chiron()
  let defaultSessionId = defaultBot.createSession(testUser)

  it('has an API', () => {
    assert.isFunction(defaultBot.learn)
    assert.isFunction(defaultBot.respond)
    assert.isFunction(defaultBot.getAction)
    assert.isFunction(defaultBot.getActions)
    assert.isFunction(defaultBot.createSession)
    assert.isFunction(defaultBot.getSession)
    assert.isFunction(defaultBot.destroySession)
  })

  it('has some default actions', () => {
    expect(defaultBot.respond(defaultSessionId, 'hello')).to.equal(defaultGreeting)
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
        expect(scopedBot.createSession).to.throw(thrownMsg)
        const dodgyArgs = [null, 45.1, [1, 2, 3], {foo: 'bar'}]
        dodgyArgs.forEach(a => expect(scopedBot.createSession.bind(scopedBot, a)).to.throw(thrownMsg))        
        expect(scopedBot.createSession.bind(scopedBot, 'This should be ok')).to.be.ok
      })

      it('creates a session and returns a session id', () => {
        expect(scopedBot.createSession(testUser))
          .to.satisfy(res => typeof res === 'string' && shortid.isValid(res))
      })
    })

    describe('returns an existing session', () => {
      it('returns null for an invalid session id', () => {
        const dodgyId = shortid.generate()
        expect(scopedBot.getSession(dodgyId)).to.be.null
      })

      it('returns a valid session object for a valid id', done => {
        const session = scopedBot.getSession(scopedSessionId)
        expect(session.id).to.equal(scopedSessionId)
        expect(session.username).to.equal(testUser)
        setTimeout(() => {
          expect(session.timeCreated).to.be.below(Date.now())
          done()
        }, 10)
      })
    })

    describe('destroys a session', () => {
      it('throws an exception if the session does not exist', () => {
        const dodgyId = shortid.generate()
        const thrownMsg = 'The supplied session id does not exist'
        expect(scopedBot.destroySession.bind(scopedBot, dodgyId)).to.throw(thrownMsg)
      })

      it('successfully destroys an existing session', () => {
        expect(scopedBot.getSession(scopedSessionId)).to.be.ok
        scopedBot.destroySession(scopedSessionId)
        expect(scopedBot.getSession(scopedSessionId)).to.be.null
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
      expect(scopedBot.respond).to.throw(thrownMsg)
      const dodgyscopedSessionId = 'A dodgy session id'
      expect(scopedBot.respond.bind(scopedBot, dodgyscopedSessionId, testMsg)).to.throw(thrownMsg)
      expect(scopedBot.respond.bind(scopedBot, scopedSessionId, testMsg)).to.be.ok
    })

    it('throws an error if invalid input type is provided', () => {
      const thrownMsg = 'Input must be present and be of type string'
      expect(scopedBot.respond.bind(scopedBot, scopedSessionId)).to.throw(thrownMsg)
      const dodgyArgs = [null, 45.1, [1, 2, 3], {foo: 'bar'}]
      dodgyArgs.forEach(a => expect(scopedBot.respond.bind(scopedBot, scopedSessionId, a)).to.throw(thrownMsg))
      expect(scopedBot.respond.bind(scopedBot, scopedSessionId, testMsg)).to.be.ok
    })

    it('returns a default message when it doesn\'t understand the input', () => {
      expect(scopedBot.respond(scopedSessionId, 'dflkasjglasjlgas')).to.equal('I\'m sorry, I don\'t know what to do about that')
    })

    it('can use various keywords to perform the same action', () => {
      const keywords = ['hi', 'hello', 'hey', 'howdy']
      keywords.forEach(k => expect(scopedBot.respond(scopedSessionId, k)).to.equal(defaultGreeting))
    })

    it('doesn`t care about input case', () => {
      const keywords = ['hi', 'HI', 'Hi', 'hI']
      keywords.forEach(k => expect(scopedBot.respond(scopedSessionId, k)).to.equal(defaultGreeting))
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
      expect(scopedBot.learn).to.throw(thrownMsg)
      const dodgyscopedSessionId = 'A dodgy session id'
      expect(scopedBot.learn.bind(scopedBot, dodgyscopedSessionId, action)).to.throw(thrownMsg)
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, action)).to.be.ok
    })

    it('throws an error if invalid input type is provided', () => {
      const thrownMsg = 'Input must be present and must be an object'
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId)).to.throw(thrownMsg)
      const dodgyArgs = [null, 'A string', 43.5, [1, 2, 3]]
      dodgyArgs.forEach(a => expect(scopedBot.learn.bind(scopedBot, scopedSessionId, a)).to.throw(thrownMsg))
    })

    it('validates its input object', () => {
      const badAction = {}
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, badAction)).to.throw('Action must have a label')
      badAction.label = 'Some label'
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, badAction)).to.throw('Action type is not valid')
      badAction.type = Symbol('faulty-action')
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, badAction)).to.throw('Action type is not valid')
      badAction.type = ActionTypes.SAY
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, badAction)).to.throw('Action must have a keywords array')
      badAction.keywords = []
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, badAction)).to.throw('Action must have at least one keyword')
      badAction.keywords = ['some keyword']
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, badAction)).to.throw('Action must supply a response string')
      badAction.response = 'some response'
      expect(scopedBot.learn.bind(scopedBot, scopedSessionId, badAction)).to.be.ok
    })

    it('returns an learned action', () => {
      scopedBot.learn(scopedSessionId, action)
      expect(scopedBot.getAction(action.label)).to.deep.equal(action)
    })

    it('learns a new action and responds accordingly', () => {
      scopedBot.learn(scopedSessionId, action)
      action.keywords.forEach(kw => expect(scopedBot.respond(scopedSessionId, kw)).to.equal(action.response))
    })
  })
})
