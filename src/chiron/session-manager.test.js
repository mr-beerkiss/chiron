import shortid from 'shortid'
import chiron from '.'
import sessionManager from './session-manager'

/* eslint-env jest */
describe('session API', () => {
  const testUser = 'testuser'

  let sessions
  let scopedSessionId

  beforeEach(() => {
    sessions = sessionManager()
    scopedSessionId = sessions.createSession(testUser)
  })

  it('has an API', () => {
    expect(typeof sessions.createSession).toBe('function')
    expect(typeof sessions.getSession).toBe('function')
    expect(typeof sessions.destroySession).toBe('function')
    expect(typeof sessions.sessionExists).toBe('function')
  })

  describe('create a session', () => {
    it('throws an error if invalid input is provided', () => {
      const thrownMsg = 'You must supply a string identifier to start a session'
      expect(sessions.createSession).toThrow(thrownMsg)
      const dodgyArgs = [null, 45.1, [1, 2, 3], {foo: 'bar'}]
      dodgyArgs.forEach(a => expect(sessions.createSession.bind(sessions, a)).toThrow(thrownMsg))
      expect(sessions.createSession.bind(sessions, 'This should be ok')).toBeTruthy()
    })

    it('creates a session and returns a session id', () => {
      const sessionId = sessions.createSession(testUser)
      expect(typeof sessionId === 'string' && shortid.isValid(sessionId)).toBe(true)
    })
  })

  describe('returns an existing session', () => {
    it('returns null for an invalid session id', () => {
      const dodgyId = shortid.generate()
      expect(sessions.getSession(dodgyId)).toBeNull()
    })

    it('returns a valid session object for a valid id', done => {
      const session = sessions.getSession(scopedSessionId)
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
      expect(sessions.destroySession.bind(sessions, dodgyId)).toThrow(thrownMsg)
    })

    it('successfully destroys an existing session', () => {
      expect(sessions.getSession(scopedSessionId)).toBeTruthy()
      sessions.destroySession(scopedSessionId)
      expect(sessions.getSession(scopedSessionId)).toBeNull()
    })
  })
})
