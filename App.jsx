/** @jsx render */

let log = console.log

function render(tagName, attributes, ...children) {
	log('render', { tagName, attributes, children })

	let result = document.createElement(tagName)

	for (let attribute in attributes) {
		result.setAttribute(attribute, attributes[attribute])
	}

	for (let child of children) {
		if (child instanceof Node) {
			result.appendChild(child)
		} else {
			result.appendChild(document.createTextNode(child))
		}
	}

	return result
}

export function App() {
	let inputValue = 'Hello world'
	let counter = 0

	let app = (
		<div class="App">
			<p>
				Text is	<input type="text" value={inputValue} />

			</p>
			<p class="text" style="color: blue">
				{inputValue}
			</p>
			<p>
				Counter is {counter} <button>+</button> <button>-</button>
			</p>
			<p>
				The same counter is <input type="number" value={counter} />
			</p>

		</div>
	)

	return app
}
