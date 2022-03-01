<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import {
    svelteStore,
    synced,
    peers,
    connected,
    connectRoom,
    GameState,
    RoomPlayer,
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

<main class="grid h-screen place-items-center">
  <div
    class="flex {enteredRoom
      ? 'flex-col md:flex-row'
      : 'flex-col'} items-center gap-6"
  >
    {#if gameState === GameState.Waiting}
      <div
        class="flex flex-col gap-4 {enteredRoom
          ? 'border-b-2 md:border-r-2 md:border-b-0 border-blue-500 pb-4 md:pr-4 md:pb-0'
          : ''}"
      >
        <div class="flex flex-col">
          <h1 class="text-6xl font-bold font-ubuntu text-blue-500">
            That Paper Game
          </h1>
          <p class="text-md font-bold text-blue-400 font-ubuntu">
            Room ID: {roomId}
          </p>
        </div>
        <div class="text-left">
          {#each Object.entries($svelteStore.roomPlayers) as [pId, player]}
            <p class="font-prompt">
              {player.ready ? "✅" : "❌"}
              {player.name}
              {pId === playerId ? "(Me)" : ""}
            </p>
          {/each}
        </div>
      </div>
    {/if}
    {#if !$connected || !enteredRoom}
      <p
        class="w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-full animate-spin inline-block"
      />
      <button
        class="text-2xl font-bold font-ubuntu text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg px-4 py-2 shadow-lg active:scale-90 duration-200"
        on:click={() => (location.href = "/")}>Back</button
      >
      <!-- {:else if !enteredRoom} -->
      <!-- <button
        class="btn"
        on:click={enter}
        disabled={createRoom ? !$connected : !$synced}>Enter</button
      > -->
    {:else if gameState === GameState.Waiting}
      <WaitingRoom store={svelteStore} {nextState} />
    {:else if gameState === GameState.Prepare}
      <PrepareMap store={svelteStore} {nextState} />
    {:else if gameState === GameState.Start}
      <GamePlay store={svelteStore} {nextState} />
    {:else if gameState === GameState.Ended}
      TODO: Show the result of the game...
    {/if}
  </div>

  <!-- <pre class="text-left">
    $svelteStore : {JSON.stringify($svelteStore, null, 2)}
  playerIds count : {Object.keys($svelteStore.roomPlayers).length}
  player: {JSON.stringify(player)}
  roomPlayers: {JSON.stringify($svelteStore.roomPlayers, null, 2)}
  </pre> -->
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
