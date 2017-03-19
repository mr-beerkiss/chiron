import shortid from 'shortid'

const ActionTypes = {
  SAY: Symbol('say')
}

const chiron = () => {
  const DefaultActions = [
    {
      label: 'greet',
      keywords: ['hello', 'hi', 'hey', 'howdy'],
      type: ActionTypes.SAY,
      response: 'Hello, I`m Chiron!'
    },
    {
      label: 'why',
      keywords: ['why'],
      type: ActionTypes.SAY,
      response: `
        My maker called me this based on the Greek Myth of Chiron.  A centaur sired by the titan
        Chronus, Chiron was reknowned as a teacher and a tutor.  It was said his personal skills
        were a match for Apollo.  https://en.wikipedia.org/wiki/Chiron
      `
    }
  ]

  const actions = [...DefaultActions]

  const DEFAULT_RESPONSE = `I'm sorry, I don't know what to do about that`
  
  const INVALID_SESSION_ID_MSG = 'A valid session id is required to call this method'

  const sessions = []

  function actionFromKeyword (keyword) {
    return actions.find(v => v.keywords.includes(keyword))
  }

  function actionFromLabel (label) {
    return actions.find(v => v.label === label)
  }

  function actionExists (actionType) {
    if (!actionType) return false
    return !!Object.keys(ActionTypes).find(k => ActionTypes[k] === actionType)
  }

  function sessionExists (sessionId) {
    return !!sessions.find(s => s.id === sessionId)
  }

  return {
    learn (sessionId, action) {
      if (!sessionExists(sessionId)) throw new Error(INVALID_SESSION_ID_MSG)
      if (!action || typeof action !== 'object' || action.length) {
        throw new Error('Input must be present and must be an object')
      } else {
        if (typeof action.label !== 'string') throw new Error('Action must have a label')
        if (!actionExists(action.type)) throw new Error('Action type is not valid')
        if (!Array.isArray(action.keywords)) throw new Error('Action must have a keywords array')
        if (!action.keywords.length) throw new Error('Action must have at least one keyword')
        if (typeof action.response !== 'string') throw new Error('Action must supply a response string')
      }
      actions.push(action)
    },
    respond (sessionId, message) {
      if (!sessionExists(sessionId)) throw new Error(INVALID_SESSION_ID_MSG)
      // sanitize input
      if (typeof message !== 'string') throw new Error('Input must be present and be of type string')

      const action = actionFromKeyword(message.toLowerCase())

      if (!action) return DEFAULT_RESPONSE

      return action.response
    },
    getAction (label) {
      return actionFromLabel(label)
    },
    getActions () {
      return actions
    },
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

export {
  ActionTypes
}

export default chiron
