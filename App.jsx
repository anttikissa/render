/** @jsx element */

import './App.css'

let log = console.log

import { val, element } from './framework.js'

function ListItem(params) {
	return <li>I am a list item that says "{params.content}"!</li>
}

export function App() {
	let name = val('')
	let nameLength = name.map((value) => value.length)
	let counter = val(0)

	function inputChanged(event) {
		name.value = event.target.value
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

	let listItem1Content = name.map(string => {
		if (string.length) {
			return `Your name capitalized is "${string[0].toUpperCase()}${string.substring(1)}"`
		} else {
			return 'You have no name'
		}
	})

	let app = (
		<div class="App">
			This is app!
			<p>
				Who are you? <input type="text" value={name} oninput={inputChanged} />
			</p>
			<p class="text" style="color: blue">
				Hi there, {name}!
			</p>
			<p>Name length: {nameLength}</p>
			<p style="color: green">Check out this list:</p>
			<ul>
				<ListItem content={listItem1Content} />
				<ListItem content={'Item #2'} />
			</ul>
			<p>End list</p>

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
