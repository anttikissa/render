let log = console.log

class Value {
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

export function val(initialValue) {
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
			let componentInstance = component({ ...attributes, _children: children })
			return componentInstance.render(target, false)
			// return component(target, false)
		} else if (component === '') {
			// fragment
			result = target
		} else {
			// <li>...</li>
			result = document.createElement(component)
			target.appendChild(result)
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
