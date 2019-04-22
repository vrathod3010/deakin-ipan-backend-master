var E = {
  T_VISIT_URL:    'T_VISIT_URL',
  T_UI_CLICK:     'T_UI_CLICK',
  T_UI_SCROLL:    'T_UI_SCROLL',
  T_LOGIN:        'T_LOGIN',
  T_LOGOUT:       'T_LOGOUT',
}

function hasEvent(name) {
  name = name.toUpperCase()
  return E.hasOwnProperty(name)
}

function addEvent(name) {
  if (hasEvent(name)) return false

  E.name = name
  return true
}

function removeEvent(name) {
  if (!hasEvent(name)) return false

  delete E.name
  return true
}

module.exports = {
  EVENTS: E,
  hasEvent: hasEvent,
  addEvent: addEvent,
  removeEvent: removeEvent
}
