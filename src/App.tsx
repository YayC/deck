// @ts-nocheck
import React, {useState, useEffect} from 'react'
import './App.css'
import TimerApp from './TimerApp'

// TODO consider using using https://github.com/albert-gonzalez/easytimer-react-hook

// https://en.wikipedia.org/wiki/Fisher-Yates_shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // random index from 0 to i inclusive
    let j = Math.floor(Math.random() * (i + 1)); 

    // swap elements array[i] and array[j]
    // we use "destructuring assignment" syntax to achieve that
    // same can be written as:
    // let t = array[i]; array[i] = array[j]; array[j] = t
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getShuffledDeck(){
  const suits = ['♠︎', '♥︎', '♣︎', '♦︎'];
  const values = Array.from({length: 13}, (_, i) => i+2)
  
  const deck = values.map((v) => {
    return suits.map((s) => ({suit: s, value: v}))
  }).flat()
  return shuffle(deck)
}

function cardValueToString({value}) {
  switch (value) {
    case 14:
      return 'Ace'
    case 13:
      return 'King'
    case 12:
      return 'Queen'
    case 11:
      return 'Jack'
    default:
      return `${value}`
  }
}

function displayPlayed(deck, deckIndex: int, sorted = false) {
  const shown = deck.slice(0, deckIndex).reverse()
  if (sorted) {
    shown.sort((a, b) => b.value - a.value)
  }
  return shown.map(card => displayCard(card)).join(' ')
}

function getHalfValue({value}){
  if (value <= 4) {
     return 2
  }
  let halfish = value
  if (halfish % 2 !== 0) {
     halfish += 1
  }
   return halfish/2
}

function displayCard(card, showHalfish = false) {
  let result = `${cardValueToString(card)}${card.suit}`
    if (showHalfish) {result += `(${getHalfValue(card)})`}
  return result
}

export default function App () {
  // see https://www.robinwieruch.de/local-storage-react/ to make into a custom hook
  const [deck, setDeck] = useState(
    JSON.parse(localStorage.getItem('deck')) || getShuffledDeck()
  )
  const [deckIndex, setDeckIndex] = useState(
    parseInt(localStorage.getItem('deckIndex')) || 0
  )
  useEffect(() => {
    localStorage.setItem('deck', JSON.stringify(deck))
  }, [deck])
  useEffect(() => {
    localStorage.setItem('deckIndex', deckIndex)
  }, [deckIndex])

  function reset() {
    if (window.confirm('Reset deck?')) {
      setDeck(getShuffledDeck());
      setDeckIndex(0)
    }
  }

  function next() {
    setDeckIndex(deckIndex + 1)
  }
  function previous() {
    setDeckIndex(deckIndex - 1)
  }
  

  console.log(JSON.stringify(deck))
  
  return (
    <div className='main'>
      <div className='cardNumber'>
        {`Card #${deckIndex + 1}`}
      </div>
      <br/>
      <div className='currentCard'>
        {displayCard(deck[deckIndex], true)}
      </div>
      <br/>
      <button className='next' disabled={deckIndex === 51} onClick={next}>Next</button>
      <br/><br/>
      <button onClick={previous} disabled={deckIndex === 0}>Previous</button>
      <button onClick={reset}>Reset</button>
      <TimerApp/>
      <div className='history'>
        History:<br/>
        {displayPlayed(deck, deckIndex)}
      </div>
      <br/>
      <div className='history'>
        Piles:<br/>
        {displayPlayed(deck, deckIndex, true)}
      </div>
      
    </div>
  )
}