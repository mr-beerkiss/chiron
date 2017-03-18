const ActionTypes = {
  SAY: Symbol('say')
}

const darrensBot = () => {
  const DefaultActions = [
    {
      label: 'greet',
      keywords: ['hello', 'hi', 'hey', 'howdy'],
      type: ActionTypes.SAY,
      response: 'Hello!'
    }
  ]

  const actions = [...DefaultActions]

  const DEFAULT_RESPONSE = `I'm sorry, I don't know what to do about that`

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

  return {
    learn (action) {
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
    respond (message) {
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
    }
  }
}

export {
  ActionTypes
}

export default darrensBot

