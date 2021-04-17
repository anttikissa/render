/** @jsx element @jsxFrag fragment */

import './App.css'

let log = console.log

import { value, element, fragment, Value, reRenderEverything } from './framework.js'

function ListItem(params, children) {
	let content = params.content || 'nothing'

	return (
		<>
			<li>This is a fragment</li>
			<li>
				I am a list item that says "{content}"!
				{children.length ? ' and I have children: ' : ''}
				{children}
			</li>
		</>
	)
}

export function OldApp() {
	let name = value('')
	let nameLength = name.map((value) => value.length)
	let counter = value(0)

	function inputChanged(event) {
		name.value = event.target.value
	}

	function increaseCounter() {
		counter.value++
	}

	function decreaseCounter() {
		counter.value--
	}

	let counterInputValid = value(true)
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
	// 	<b>Try to delete me! </b>,
	// 	<b>One </b>,
	// 	<b>Two </b>,
	// 	<b>Three </b>,
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

	// name.onChange((newValue, oldValue) => {
	// 	if ((newValue && !oldValue) || (oldValue && !newValue)) {
	// 		// This does not rerender the 'name.value.length' conditional below
	// 		// so it's of no use; though, observe how it destroys the focus when you're typing
	// 		reRenderEverything()
	// 	}
	// })

	let app = (
		<div class="App">
			This is app!
			<if>
				{name.map((value) => value.length)}
				<p className="text" style="color: blue">
					Hi there, {name}!
				</p>
				<p>(Optional "else" block)</p>
			</if>
			<p>
				Who are you? <input type="text" value={name} oninput={inputChanged} />
			</p>
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

function error(message) {
	throw new Error(message)
}

function If({ cond }, children) {
	let [thenBlock, elseBlock] = children

	if (typeof cond === 'undefined') {
		error('If: attribute cond missing')
	}

	if (cond instanceof Value) {
		cond.onChange((newCond) => {
			// TODO make the thing change when condition changes somehow
			log('If: condition changed', newCond)
		})
	} else {
		if (cond) {
			return thenBlock
		} else {
			return elseBlock
		}
	}

	return <div>TODO this needs to change</div>
}

function Counter() {
	let counter = value(1)
	setInterval(() => counter.value++, 1500)

	return counter.map((value) => {
		if (value % 2 === 0) {
			return <p style="color: blue">{value} is even</p>
		} else {
			return <p style="font-weight: bold">{value} is odd</p>
		}
	})
}

export function App() {
	function toggleLoggedIn() {
		isLoggedIn.value = !isLoggedIn.value
		userProfile.value = isLoggedIn.value
			? {
					userId: 123,
					name: 'Antti',
			  }
			: null

		reRenderEverything()
	}

	let isLoggedIn = value(false)
	let userProfile = value(null)

	let userId = userProfile.map((u) => u && u.userId)
	let name = userProfile.map((u) => u && u.name)

	return (
		<div class="App">
			Counter: <Counter></Counter>

			{/*<button onclick={toggleLoggedIn}>Toggle logged in</button>*/}
			{/*<br />*/}
			{/*User logged in? {isLoggedIn}*/}
			{/*<If cond={isLoggedIn}>*/}
			{/*	<div>*/}
			{/*		This is the THEN part. User {userId}, name {name}*/}
			{/*	</div>*/}
			{/*	<div>This is the ELSE part. (You are not logged in)</div>*/}
			{/*</If>*/}
		</div>
	)
}
