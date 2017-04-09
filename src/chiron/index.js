import sessionManager from './session-manager'
import responseManager from './response-manager'

const ActionTypes = {
  SAY: Symbol('say')
}

const chiron = () => {
  const INVALID_SESSION_ID_MSG = 'A valid session id is required to call this method'

  const actions = []

  const sessions = sessionManager()
  const responses = responseManager()

  function actionFromLabel (label) {
    return actions.find(v => v.label === label)
  }

  function actionExists (actionType) {
    if (!actionType) return false
    return !!Object.keys(ActionTypes).find(k => ActionTypes[k] === actionType)
  }

  return {
    sessions,
    responses,
    learn (sessionId, action) {
      if (!sessions.sessionExists(sessionId)) throw new Error(INVALID_SESSION_ID_MSG)
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
    getAction (label) {
      return actionFromLabel(label)
    },
    getActions () {
      return actions
    }
  }
}

export {
  ActionTypes
}

export default chiron
