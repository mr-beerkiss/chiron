import shortid from 'shortid'

const sessionManager = () => {
  const sessions = []

  function sessionExists (sessionId) {
    return !!sessions.find(s => s.id === sessionId)
  }

  return {
    sessionExists,
    createSession (username) {
      if (typeof username !== 'string' || username.length === 0) throw new Error('You must supply a string identifier to start a session')
      // TODO: Should usernames be forced to be unique?
      // I would say No, since it would be up to the application to manage the session id for the
      // user, and the session id will be the uniquie identifier, not the username
      const id = shortid.generate()
      const timeCreated = Date.now()
      sessions.push({
        id,
        username,
        timeCreated,
        timeLastUsed: timeCreated
      })

      return id
    },
    getSession (sessionId) {
      const session = sessions.find(s => s.id === sessionId) || null
      return session
    },
    destroySession (sessionId) {
      if (!sessionExists(sessionId)) throw new Error('The supplied session id does not exist')
      const index = sessions.findIndex(s => s.id === sessionId)
      sessions.splice(index)
    }
  }
}

export default sessionManager
