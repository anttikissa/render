/** @jsx element */

import './App.css'

let log = console.log

import { val, element, reRenderEverything } from './framework.js'

function ListItem(params) {
	let content = params.content || 'nothing'

	return (
		<li>
			I am a list item that says "{content}"!
			{params._children.length ? ' and I have children: ' : ''}
			{params._children}
		</li>
	)
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

	let listItem1Content = name.map((string) => {
		if (string.length) {
			return `Your name capitalized is "${string[0].toUpperCase()}${string.substring(1)}"`
		} else {
			return 'You have no name'
		}
	})

	// This approach does not work for array reactivity because values inside Values can only map
	// to a single node currently

	// let listItemChildren = val([
	// 	'This one has children, ',
	// 	<b>what now?</b>
	// ])

	let listItemChildren = [
		'This one has children, ',
		<b>Try to delete me! </b>,
		<b>One </b>,
		<b>Two </b>,
		<b>Three </b>,
	]

	function removeChild() {
		listItemChildren.pop()
		// A bit of a heavy solution
		reRenderEverything()
	}

	name.onChange((newValue, oldValue) => {
		if ((newValue && !oldValue) || (oldValue && !newValue)) {
			// This does not rerender the 'name.value.length' conditional below
			// so it's of no use; though, observe how it destroys the focus when you're typing
			reRenderEverything()
		}
	})

	let app = (
		<div class="App">
			This is app!
			<if>
				{name.map(value => value.length)}
				<p className="text" style="color: blue">
					Hi there, {name}!
				</p>
				<p>(Optional "else" block)</p>
			</if>

			<p>
				Who are you? <input type="text" value={name} oninput={inputChanged} />
			</p>
			{/* This does not work: :( :( - though, it IS ugly so let's invent something else */}

			{name.value.length ? (
				<p class="text" style="color: blue">
					Hi there, {name}!
				</p>
			) : <p>(Optional "else" block)</p>}

			<p>Name length: {nameLength}</p>
			<p style="color: green">Check out this list:</p>
			<ul>
				<ListItem content={listItem1Content} />
				<ListItem content={'Item #2'} />
				<ListItem>Children: {listItemChildren}</ListItem>
			</ul>
			<p>
				<button onclick={removeChild}>Remove one child</button>
			</p>
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
					placeholder="Enter a valid number"
				/>
			</p>
		</div>
	)

	return app
}
