<script lang="ts">
  import type { svelteSyncedStore } from "@syncedstore/svelte"

  import { onMount, onDestroy } from "svelte"
  import type { svelteStore } from "./lib/synced-store"
  import { player } from "./lib/player-store"

  export let store: typeof svelteStore
  export let nextState: () => void

  const playerId = $player.id
  $: players = $store.players
  $: prepareIndex = $store.gameData.prepareIndex || 0

  const directions = {
    up: "🔼",
    right: "▶️",
    down: "🔽",
    left: "◀️",
  }

  const colors = [
    "bg-red-400",
    "bg-green-400",
    "bg-blue-400",
    "bg-yellow-400",
    "bg-orange-400",
    "bg-purple-400",
    "bg-pink-400",
    "bg-cyan-400",
    "bg-magenta-400",
    "bg-lime-400",
    "bg-teal-400",
    "bg-olive-400",
    "bg-maroon-400",
    "bg-navy-400",
    "bg-silver-400",
    "bg-gray-400",
  ]

  let map: boolean[][] = Array(8)
    .fill(false)
    .map(() => Array(5).fill(false))
    .map((a) => [true, ...a, true])

  map[0] = map[0].map((_cell) => true)
  map[map.length - 1] = map[map.length - 1].map((_cell) => true)

  $: isMyTurn = players[prepareIndex].id === playerId
  $: isPlaced = players[prepareIndex].direction === "down"

  // $: roomPlayers = Object.values($store.roomPlayers)

  $: mapWithPlayers = map.map((row, y) =>
    row.map((hole, x) => ({
      x,
      y,
      hole,
      player: $store.players.find((player) => player.x === x && player.y === y),
    }))
  )

  function placePlayer(x, y) {
    if (!isMyTurn) {
      return
    }

    if (map[y][x]) {
      return
    }

    if ($store.players.find((player) => player.x === x && player.y === y)) {
      return
    }

    $store.players[prepareIndex].x = x
    $store.players[prepareIndex].y = y
    $store.players[prepareIndex].direction = "down"
    $store.players[prepareIndex].color = colors[prepareIndex]
  }

  function nextPlayer() {
    if (prepareIndex === players.length - 1) {
      $store.players.forEach((p) => (p.hp = 5))
      $store.gameData.prepareIndex = 0
      nextState()
    } else {
      $store.gameData.prepareIndex = prepareIndex + 1
    }
  }
</script>

<div class="prepare">
  <h2 class="text-xl">Prepare</h2>

  <div class="players">
    <h2 class="text-lg">Players</h2>

    <div class="flex flex-col w-32 justify-center mx-auto">
      {#each players as player, idx}
        <div class={`${idx === prepareIndex ? "bg-green-400" : ""}`}>
          #{idx + 1}: {player.name}
        </div>
      {/each}
    </div>
  </div>

  {#if isMyTurn}
    <div class="mt-4 text-lg">Choose Your Spawn Point, and click Continue</div>

    <button class="btn" disabled={!isPlaced} on:click={nextPlayer}
      >Continue</button
    >
  {/if}

  <div class="board flex flex-col items-center mt-16">
    {#each mapWithPlayers as row, rowIdx}
      <div class="flex">
        {#each row as { x, y, hole, player }, cellIdx}
          <span
            class={`h-12 w-12 border border-black ${hole ? "bg-gray-900" : ""}`}
            on:click={() => placePlayer(x, y)}
          >
            {#if player}
              <div
                class={`w-full h-full ${player.color} flex items-center justify-center text-3xl`}
              >
                {directions[player.direction]}
              </div>
            {/if}
          </span>
        {/each}
      </div>
    {/each}
  </div>
</div>
