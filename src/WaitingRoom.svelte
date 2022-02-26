<script lang="ts">
  import type { svelteSyncedStore } from "@syncedstore/svelte"

  import { onMount, onDestroy } from "svelte"
  import type { svelteStore } from "./lib/synced-store"
  import { player } from "./lib/player-store"

  export let store: typeof svelteStore
  export let nextState: () => void

  const playerId = $player.id

  $: roomPlayers = Object.values($store.roomPlayers)

  onMount(() => {
    $store.roomPlayers[playerId] = {
      id: playerId,
      name: $player.name,
      ready: false,
      admin: false,
      enteredAt: new Date().getTime(),
    }
  })

  $: isRoomOwner =
    roomPlayers.length &&
    ($store.roomPlayers[playerId]?.admin ||
      roomPlayers.sort((a, b) => a.enteredAt - b.enteredAt)[0].id == playerId)

  $: canStartGame =
    isRoomOwner &&
    Object.keys($store.roomPlayers).length > 1 &&
    Object.values($store.roomPlayers).every((p) => p.ready)

  function leaveRoom() {
    delete $store.roomPlayers[playerId]
  }

  onDestroy(() => {
    leaveRoom()
  })

  window.onbeforeunload = () => {
    leaveRoom()
  }
</script>

<div class="waiting">
  <h2 class="text-xl">Waiting</h2>
  <span>
    Name:<input
      type="text"
      class="input input-bordered"
      bind:value={$store.roomPlayers[playerId].name}
    />
  </span>
  <span>
    Ready:
    <input
      type="checkbox"
      bind:checked={$store.roomPlayers[playerId].ready}
      class="checkbox"
    />
  </span>

  <div>
    Players

    {#each Object.entries($store.roomPlayers) as [playerId, player]}
      <div class="player">
        {player.name} :
        {player.ready ? "Ready" : "Not Ready"}
      </div>
    {/each}
  </div>

  {#if isRoomOwner}
    <div>
      <button
        class="btn btn-primary"
        disabled={!canStartGame}
        on:click={nextState}
      >
        Start Game!
      </button>
    </div>
  {/if}
</div>
