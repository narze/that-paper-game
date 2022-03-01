<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import type { svelteStore, RoomPlayer } from "./lib/synced-store"
  import { player } from "./lib/player-store"

  export let store: typeof svelteStore
  export let nextState: () => void

  const playerId = $player.id

  $: roomPlayers = Object.values($store.roomPlayers) as RoomPlayer[]

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
    isRoomOwner && roomPlayers.length > 1 && roomPlayers.every((p) => p.ready)

  function leaveRoom() {
    delete $store.roomPlayers[playerId]
  }

  function shufflePlayerAndProceed() {
    const shuffledRoomPlayers = roomPlayers.sort(() => Math.random() - 0.5)

    shuffledRoomPlayers.forEach((player) => {
      $store.players.push({
        id: player.id,
        name: player.name,
      })
    })

    nextState()
  }

  onDestroy(() => {
    leaveRoom()
  })

  window.onbeforeunload = () => {
    leaveRoom()
  }
</script>

<div class="flex flex-col">
  <div class="grid place-items-center">
    <div class="flex flex-col gap-6">
      <h2 class="text-4xl font-ubuntu text-blue-500 font-bold">
        ⚙ Preferences
      </h2>
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-2">
          <p class="text-left font-ubuntu font-bold">Username</p>
          <input
            type="text"
            class="input"
            bind:value={$store.roomPlayers[playerId].name}
          />
        </div>
        <div class="flex flex-row gap-2">
          <p class="text-left font-ubuntu font-bold">Ready</p>
          <input
            type="checkbox"
            bind:checked={$store.roomPlayers[playerId].ready}
            class="checkbox"
          />
        </div>
      </div>

      <div class="flex flex-row gap-2 justify-center">
        {#if isRoomOwner}
          <button
            class="btn btn-primary"
            disabled={!canStartGame}
            on:click={shufflePlayerAndProceed}
          >
            Start Game!
          </button>
        {/if}
        <button class="btn btn-error" on:click={() => (location.href = "/")}>
          Leave Room
        </button>
      </div>
    </div>
  </div>
</div>
