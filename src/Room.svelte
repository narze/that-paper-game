<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import {
    svelteStore,
    synced,
    peers,
    connected,
    connectRoom,
    GameState,
  } from "./lib/synced-store"
  import url from "./lib/url"

  import { player } from "./lib/player-store"
  import WaitingRoom from "./WaitingRoom.svelte"
  import PrepareMap from "./PrepareMap.svelte"
  import GamePlay from "./GamePlay.svelte"

  export let roomId = ""
  export let createRoom: boolean

  const webrtcProvider = connectRoom(roomId)

  $: gameState = $svelteStore.gameData.state || GameState.Waiting

  const playerId = $player.id

  // $: roomPlayers = Object.values($svelteStore.roomPlayers)

  let enteredRoom = false

  function enter() {
    enteredRoom = true

    $svelteStore.roomPlayers[playerId] = {
      id: playerId,
      name: $player.name,
      ready: false,
      admin: false,
      enteredAt: new Date().getTime(),
    }

    window.location.hash = `#/rooms/${roomId}`
  }

  $: if ($connected && createRoom && !enteredRoom) {
    // console.log("Auto enter room (creator)")
    enter()
  }

  $: if ($connected && !createRoom && $synced && !enteredRoom) {
    // console.log("Auto enter room (joiners)")
    enter()
  }

  function nextState() {
    if (gameState == GameState.Start) {
      // TODO: Go to end state component
      $svelteStore.gameData.state = GameState.Prepare
    } else {
      $svelteStore.gameData.state =
        (gameState + 1) % Object.keys(GameState).length
    }
  }
</script>

<main>
  <h1>That Paper Game</h1>

  <p>Room ID: {roomId}</p>

  <!-- <pre class="text-left">
    $svelteStore : {JSON.stringify($svelteStore, null, 2)}
  playerIds count : {Object.keys($svelteStore.roomPlayers).length}
  player: {JSON.stringify(player)}
  roomPlayers: {JSON.stringify($svelteStore.roomPlayers, null, 2)}
  </pre> -->
  {#if !$connected || !enteredRoom}
    <div>Loading...</div>
    <!-- {:else if !enteredRoom} -->
    <!-- <button
      class="btn"
      on:click={enter}
      disabled={createRoom ? !$connected : !$synced}>Enter</button
    > -->
  {:else if gameState == GameState.Waiting}
    <WaitingRoom store={svelteStore} {nextState} />
  {:else if gameState == GameState.Prepare}
    <PrepareMap store={svelteStore} {nextState} />
  {:else if gameState == GameState.Start}
    <GamePlay store={svelteStore} {nextState} />
  {:else if gameState == GameState.Ended}
    TODO: Show the result of the game...
  {/if}
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  img {
    height: 16rem;
    width: 16rem;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4rem;
    line-height: 1.1;
    margin: 2rem auto;
    max-width: 14rem;
  }

  p {
    max-width: 14rem;
    margin: 1rem auto;
    line-height: 1.35;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }

    p {
      max-width: none;
    }
  }
</style>
