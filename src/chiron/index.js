import sessionManager from './session-manager'
import responseManager from './response-manager'
import actionManager from './action-manager'


const chiron = () => {
  // const INVALID_SESSION_ID_MSG = 'A valid session id is required to call this method'

  const sessions = sessionManager()
  const responses = responseManager()
  const actions = actionManager()

  return {
    sessions,
    responses,
    actions
  }
}



export default chiron
