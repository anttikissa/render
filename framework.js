let log = console.log
let error = (message, ...rest) => {
	log('ERROR', message, ...rest)
	throw new Error(message)
}

export class Value {
	constructor(value) {
		this._value = value
		this.listeners = []
	}

	onChange(listener) {
		this.listeners.push(listener)
	}

	get value() {
		return this._value
	}

	set value(newValue) {
		let oldValue = this._value
		this._value = newValue
		for (let listener of this.listeners) {
			listener(this.value, oldValue)
		}
	}

	map(f) {
		let result = new Value(f(this.value))
		this.onChange((newValue) => (result.value = f(newValue)))
		return result
	}
}

// TODO figure out a better name
// stream() or observable() or reactive() or whatever.
// This gets confused with v.value and the argument for onChange(value => ...)
export function value(initialValue) {
	return new Value(initialValue)
}

let allTopLevelElementTargets = new Map()

class Element {
	constructor(tagName, attributes, children) {
		this.component = tagName
		this.attributes = attributes
		this.children = children
	}

	/**
	 * @param {HTMLElement} target The HTML node to contain this app
	 * @param {boolean} clear Should I clear the target node first?
	 *
	 * TODO the logic got fuzzy soon, sometimes target can be null meaning it doesn't need to
	 * be appended there. The creation of the element and adding it to the tree should be separate
	 * operations probably.
	 *
	 * @return {HTMLElement}
	 */
	render(target, clear = true) {
		// clear: true is a signal that user is mounting us on DOM; so register this element be
		// re-rendered when it needs to be done
		if (clear) {
			allTopLevelElementTargets.set(this, target)
		}

		let { component, attributes, children } = this
		log('rendering', { component, attributes, children }, 'to', target)

		if (clear) {
			target.innerHTML = ''
		}

		let result

		if (typeof component === 'function') {
			// It's a Component, instantiate it with elements and
			let componentResult = component({ ...attributes }, children)

			if (componentResult instanceof Value) {
				log('!!! Encountered a Value componentInstance')
				// TODO:
				// Make it so that there is something in DOM (comment element if nothing else)
				// whenever the value changes, replace the DOM element in question with
				// whatever is the new value

				/**
				 * Create a HTML node out of anything (null/undefined creates a placeholder
				 * comment node, Elements will be rendered)
				 *
				 * TODO maybe handle strings as well if needed?
				 * @param someValue
				 * @return {Node}
				 */
				let createNodeFrom = (someValue) => {
					if (someValue == null) {
						return document.createComment('placeholder')
					} else if (someValue instanceof Element) {
						return someValue.render(null, false)
					} else {
						error('unknown type for someValue', someValue)
					}
				}

				let node = createNodeFrom(componentResult.value)

				componentResult.onChange((newValue) => {
					let newNode = createNodeFrom(newValue)

					if (target) {
						target.replaceChild(newNode, node)
						node = newNode
					}
				})

				if (target) {
					target.appendChild(node)
				}
				return node
			} else if (componentResult instanceof Element) {
				return componentResult.render(target, false)
			} else {
				log('componentResult was not Value or Element', componentResult)
				error('componentResult was not Value or Element')
			}
		} else if (component === '') {
			// fragment
			result = target
		} else {
			// <li>...</li>
			result = document.createElement(component)
			if (target) {
				target.appendChild(result)
			}
		}

		if (attributes) {
			for (let attribute in attributes) {
				let value = attributes[attribute]
				// event handlers must be set directly instead of setAttribute
				if (attribute.startsWith('on')) {
					result[attribute] = value
				} else if (value instanceof Value) {
					let currentValue = value.value
					result.setAttribute(attribute, currentValue)
					value.onChange((newValue) => {
						result.setAttribute(attribute, newValue)
						// Input elements stop obeying the attribute after the property has
						// once been changed, so this needs to be done:
						if (attribute === 'value' && result instanceof HTMLInputElement) {
							result.value = newValue
						}
					})
				} else {
					result.setAttribute(attribute, value)
				}
			}
		}

		function handleChild(thing) {
			if (Array.isArray(thing)) {
				for (let member of thing) {
					handleChild(member)
				}
			} else if (thing instanceof Element) {
				thing.render(result, false)
			} else if (thing instanceof Value) {
				let currentValue = thing.value

				if (Array.isArray(currentValue)) {
					log('!!! Value contains an Array, we should probably consider this?')
				}

				let node = document.createTextNode(currentValue)
				result.appendChild(node)
				thing.onChange((newValue) => (node.textContent = newValue))
			} else {
				result.appendChild(document.createTextNode(thing))
			}
		}

		for (let child of children) {
			handleChild(child)
		}

		return result
	}
}

export function element(tagName, attributes, ...children) {
	return new Element(tagName, attributes, children)
}

export const fragment = ''

export function reRenderEverything() {
	for (let [element, target] of allTopLevelElementTargets.entries()) {
		target.innerHTML = ''
		element.render(target, false)
	}
}
