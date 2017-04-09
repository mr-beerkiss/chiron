const actionManager = () => {
  const actions = []

  function actionFromLabel (label) {
    return actions.find(v => v.label === label)
  }

  return {
    learnAction (action) {
      if (!action || typeof action !== 'object' || Array.isArray(action)) {
        throw new Error('action must be present and must be an object')
      } else {
        if (typeof action.label !== 'string') throw new Error('Action must have a label')
        if (!Array.isArray(action.input) && typeof action.input !== 'string') throw new Error('Action must have an input string or array')
        if (Array.isArray(action.input) && !action.input.length) throw new Error('Action input cannot be an empty array')
        if (typeof action.output !== 'string' && typeof action.output !== 'function') throw new Error('Action output must be a string or function')
      }
      actions.push(action)
    },
    executeAction (label) {
      const action = actionFromLabel(label)
      if (action) {
        if (typeof action.output === 'function') {
          return action.output()
        } else {
          return action.output
        }
      }
      return null
    }
  }
}

export default actionManager
