// The host resolves the user's requested action from the conversation. Ticket
// identifiers are context, never an action selector or file-write authority.
export function resolveDocumentationAction({requested_action, ticket_id=null}={}) {
  const actions={summarize:{mode:'summarize',writes:false},comments:{mode:'code-documentation',writes:true},'record-requirement':{mode:'write-requirement',writes:true},'technical-doc':{mode:'write-technical-doc',writes:true}};
  if(!Object.hasOwn(actions,requested_action))return {mode:'clarify-intent',writes:false,ticket_id};
  return {...actions[requested_action],ticket_id};
}
