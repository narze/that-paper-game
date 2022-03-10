<script lang="ts">
  import { svelteStore, GameState } from "./lib/synced-store"

  import NavBar from "./NavBar.svelte"
  import { store } from "./lib/synced-store"

  export let roomId = [
    { id: "2RiDxgedP3wXEi2eCs2ci" },
    { id: "Poe1gedP3wXEi2eCs8hrt" },
  ]
  export let createRoom: boolean
  const playerCount = store.players.length
  $: gameState = $svelteStore.gameData.state || GameState.Waiting

  let enteredRoom = false

  function enter(index) {
    enteredRoom = true
    window.location.hash = `#/rooms/${index}`
  }
</script>

<main class="grid h-screen place-items-center">
  <NavBar />
  {#if gameState === GameState.Waiting}
    <div class="flex flex-col">
      <h1 class="text-6xl font-bold font-ubuntu text-blue-500">
        Room Discovery
      </h1>
      <p class="text-md font-bold text-blue-400 font-ubuntu">Click to join !</p>
    </div>
    <div
      class="flex flex-col md:flex-row flex-wrap gap-4"
      style="max-width: 70vw"
    >
      {#each roomId as room}
        <div
          on:click={enter(room.id)}
          class="text-2xl font-bold font-ubuntu text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg px-4 py-2 shadow-lg active:scale-90 duration-200"
        >
          <p>{room.id}</p>
          <p class="text-base">{playerCount} players</p>
        </div>
      {/each}
    </div>
  {/if}
  <div
    class="flex {enteredRoom
      ? 'flex-col md:flex-row'
      : 'flex-col'} items-center gap-6"
  />
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
