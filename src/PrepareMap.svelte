<script lang="ts">
  import type { RoomPlayer, svelteStore } from "./lib/synced-store"
  import { player } from "./lib/player-store"
  import { convertToArrayMap, generateSimpleMap } from "./lib/game-mechanics"

  export let store: typeof svelteStore
  export let nextState: () => void

  const playerId = $player.id
  $: players = [...($store.players || [])]
  $: prepareIndex = $store.gameData.prepareIndex || 0
  $: preparePhase = $store.gameData.preparePhase || 0

  $: isRoomOwner =
    players.length &&
    ($store.players[playerId]?.admin ||
      [...players].sort((a, b) => a.enteredAt - b.enteredAt)[0].id == playerId)

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

  const maps: boolean[][][] = [
    generateSimpleMap(),
    convertToArrayMap([
      "1111111",
      "1000011",
      "1010001",
      "1010001",
      "1000001",
      "1001001",
      "1000001",
      "1000101",
      "1000001",
      "1100111",
      "1111111",
    ]),
    convertToArrayMap([
      "11111111",
      "11000011",
      "10000001",
      "10000001",
      "10000001",
      "10000001",
      "11000011",
      "11111111",
    ]),
    convertToArrayMap([
      "111111111",
      "111000001",
      "100000101",
      "100000001",
      "100010001",
      "100000001",
      "101000001",
      "100000111",
      "111111111",
    ]),
  ]

  $: mapIdx = $store.gameData.mapIdx || 0
  $: map = maps[mapIdx]
  $: isMyTurn = players[prepareIndex].id === playerId
  $: isPlaced = players[prepareIndex].direction === "down"

  $: mapWithPlayers = map.map((row, y) =>
    row.map((hole, x) => ({
      x,
      y,
      hole,
      player: $store.players.find((player) => player.x === x && player.y === y),
    })),
  )

  function confirmMap() {
    $store.gameData.map = map
    $store.gameData.preparePhase = 1
  }

  function placePlayer(x, y) {
    if (preparePhase != 1) {
      return
    }

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
      $store.gameData.preparePhase = 0
      nextState()
    } else {
      $store.gameData.prepareIndex = prepareIndex + 1
    }
  }
</script>

<div class="flex flex-row gap-12 justify-between">
  <div class="flex flex-col gap-6 border-r-2 border-blue-500 pr-12">
    <h1 class="text-6xl font-bold font-ubuntu text-blue-500">Players</h1>
    <div class="flex flex-col gap-2">
      {#each players as player, idx}
        <div
          class={`font-prompt ${
            player.color || "bg-gray-400"
          } px-2 py-1 rounded-lg text-left`}
        >
          {player.name}
          {player.id === playerId ? "(You)" : ""}
        </div>
      {/each}
    </div>
  </div>
  <div class="flex flex-col gap-4">
    <h2 class="text-6xl font-bold font-ubuntu text-blue-500">Prepare</h2>

    {#if preparePhase == 0}
      {#if isRoomOwner}
        <div class="flex flex-col gap-2">
          <div class="text-lg font-ubuntu font-bold">Choose map</div>
          <div class="flex gap-2">
            <button
              class="btn grow"
              disabled={mapIdx == 0}
              on:click={() => ($store.gameData.mapIdx = mapIdx - 1)}
            >
              Previous</button
            >
            <button
              class="btn grow"
              disabled={mapIdx == maps.length - 1}
              on:click={() => ($store.gameData.mapIdx = mapIdx + 1)}
            >
              Next</button
            >
          </div>
          <button class="btn btn-primary" on:click={confirmMap}>Continue</button
          >
        </div>
      {:else}
        <div class="flex flex-col gap-2">
          <div class="text-lg font-ubuntu font-bold text-gray-400">
            Waiting for room owner to choose map...
          </div>
        </div>
      {/if}
    {:else if isMyTurn}
      <div class="flex flex-col gap-2">
        <div class="text-lg font-ubuntu font-bold">Choose your spawn-point</div>
        <button class="btn" disabled={!isPlaced} on:click={nextPlayer}
          >Continue</button
        >
      </div>
    {:else}
      <div class="flex flex-col gap-2">
        <div class="text-lg font-ubuntu font-bold text-gray-400">
          Waiting other players to choose spawn-point...
        </div>
      </div>
    {/if}

    <div class="board flex flex-col items-center">
      {#each mapWithPlayers as row, rowIdx}
        <div class="flex">
          {#each row as { x, y, hole, player }, cellIdx}
            <span
              class={`h-12 w-12 border border-black ${
                hole ? "bg-gray-900" : ""
              }`}
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
</div>
