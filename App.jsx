/** @jsx render */

import './App.css'

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
}

function val(initialValue) {
	return new Value(initialValue)
}

function render(tagName, attributes, ...children) {
	log('render', { tagName, attributes, children })

	let result = document.createElement(tagName)

	for (let attribute in attributes) {
		let value = attributes[attribute]
		// event handlers must be set directly instead of setAttribute
		if (attribute.startsWith('on')) {
			result[attribute] = value
		} else if (value instanceof Value) {
			let currentValue = value.value
			result.setAttribute(attribute, currentValue)
			value.onChange(newValue => {
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
		if (child instanceof Node) {
			result.appendChild(child)
		} else if (child instanceof Value) {
			let currentValue = child.value
			let node = document.createTextNode(currentValue)
			result.appendChild(node)
			child.onChange(newValue => node.textContent = newValue)
		} else {
			result.appendChild(document.createTextNode(child))
		}
	}

	return result
}

export function App() {
	let inputValue = val('Hello world')
	let inputLength = val(inputValue.value.length)
	inputValue.onChange(newValue => inputLength.value = newValue.length)
	let counter = val(0)

	function inputChanged(event) {
		inputValue.value = event.target.value
	}

	function increaseCounter() {
		counter.value++
	}

	function decreaseCounter() {
		counter.value--
	}

	let counterInputValid = val(true)
	function counterChanged(event) {
		let value = event.target.value

		if (value === '') {
			return
		}

		let newValue = Number(value)
		let isValid = !isNaN(newValue)
		if (isValid) {
			counter.value = newValue
		}

		counterInputValid.value = isValid
	}

	let app = (
		<div class="App">
			<p>
				Text is <input type="text" value={inputValue} oninput={inputChanged} />
			</p>
			<p class="text" style="color: blue">
				{inputValue}
			</p>
			<p>Text length: {inputLength}</p>
			<p>
				Counter is {counter} <button onclick={increaseCounter}>+</button>{' '}
				<button onclick={decreaseCounter}>-</button>
			</p>
			<p>
				The same counter is{' '}
				<input
					type="text"
					value={counter}
					data-is-valid={counterInputValid}
					oninput={counterChanged}
				/>
			</p>
		</div>
	)

	return app
}
