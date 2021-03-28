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
		this._value = newValue
		for (let listener of this.listeners) {
			listener(this.value)
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

export function render(tagName, attributes, ...children) {
	/**
	 * @param {HTMLElement} target The HTML node to contain this app
	 * @param {HTMLElement} clear Should I clear the target node first?
	 */
	return function (target, clear = true) {
		log('rendering', { tagName, attributes, children }, 'to', target)

		if (clear) {
			target.innerHTML = ''
		}
		let result = document.createElement(tagName)

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

		for (let child of children) {
			if (typeof child === 'function') {
				child = child(result, false)
			} else if (child instanceof Value) {
				let currentValue = child.value
				let node = document.createTextNode(currentValue)
				result.appendChild(node)
				child.onChange((newValue) => (node.textContent = newValue))
			} else {
				result.appendChild(document.createTextNode(child))
			}
		}

		target.appendChild(result)
	}
}
